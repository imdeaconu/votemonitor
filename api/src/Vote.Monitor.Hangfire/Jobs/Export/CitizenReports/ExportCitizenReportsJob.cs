using Dapper;
using Microsoft.EntityFrameworkCore;
using Vote.Monitor.Core.FileGenerators;
using Vote.Monitor.Core.Services.FileStorage.Contracts;
using Vote.Monitor.Core.Services.Hangfire;
using Vote.Monitor.Core.Services.Time;
using Vote.Monitor.Domain;
using Vote.Monitor.Domain.ConnectionFactory;
using Vote.Monitor.Domain.Entities.ExportedDataAggregate;
using Vote.Monitor.Domain.Entities.FormAggregate;
using Vote.Monitor.Hangfire.Jobs.Export.CitizenReports.ReadModels;

namespace Vote.Monitor.Hangfire.Jobs.Export.CitizenReports;

public class ExportCitizenReportsJob(
    VoteMonitorContext context,
    INpgsqlConnectionFactory dbConnectionFactory,
    IFileStorageService fileStorageService,
    ILogger<ExportCitizenReportsJob> logger,
    ITimeProvider timeProvider) : IExportCitizenReportsJob
{
    public async Task Run(Guid electionRoundId, Guid ngoId, Guid exportedDataId, CancellationToken ct)
    {
        var exportedData = await context
            .ExportedData
            .Where(x => x.ElectionRoundId == electionRoundId && x.Id == exportedDataId)
            .FirstOrDefaultAsync(ct);

        if (exportedData == null)
        {
            logger.LogWarning("ExportData was not found for {electionRoundId}  {exportedDataId}",
                electionRoundId, exportedDataId);
            throw new ExportedDataWasNotFoundException(ExportedDataType.CitizenReports, electionRoundId,
                exportedDataId);
        }

        try
        {
            if (exportedData.ExportStatus == ExportedDataStatus.Completed)
            {
                logger.LogWarning("ExportData was completed for {electionRoundId} {ngoId} {exportedDataId}",
                    electionRoundId, ngoId, exportedDataId);
                return;
            }

            var utcNow = timeProvider.UtcNow;

            var citizenReportingForm = await context
                .Forms
                .Where(x => x.ElectionRoundId == electionRoundId
                            && x.MonitoringNgo.NgoId == ngoId
                            && x.Status == FormStatus.Published
                            && x.FormType == FormType.CitizenReporting
                            && x.ElectionRound.CitizenReportingEnabled
                            && x.ElectionRound.MonitoringNgoForCitizenReporting.NgoId == ngoId)
                .AsNoTracking()
                .ToListAsync(ct);

            var citizenReports = await GetCitizenReports(electionRoundId, ngoId, ct);

            foreach (var attachment in citizenReports.SelectMany(citizenReport => citizenReport.Attachments))
            {
                var result =
                    await fileStorageService.GetPresignedUrlAsync(attachment.FilePath, attachment.UploadedFileName);

                if (result is GetPresignedUrlResult.Ok okResult)
                {
                    attachment.PresignedUrl = okResult.Url;
                }
            }

            var excelFileGenerator = ExcelFileGenerator.New();

            for (var index = 0; index < citizenReportingForm.Count; index++)
            {
                var form = citizenReportingForm[index];
                var sheetData = CitizenReportsDataTable
                    .FromForm(form)
                    .WithData()
                    .For(citizenReports)
                    .Please();

                excelFileGenerator.WithSheet((index + 1) + "-" + form.Code, sheetData.header, sheetData.dataTable);
            }

            var base64EncodedData = excelFileGenerator.Please();
            var fileName = $"citizen-reports-{utcNow:yyyyMMdd_HHmmss}.xlsx";
            exportedData.Complete(fileName, base64EncodedData, utcNow);

            await context.SaveChangesAsync(ct);
        }
        catch (Exception e)
        {
            logger.LogError(e, "An error occured when exporting data");
            exportedData.Fail();
            await context.SaveChangesAsync(ct);

            throw;
        }
    }

    private async Task<CitizenReportModel[]> GetCitizenReports(Guid electionRoundId, Guid ngoId, CancellationToken ct)
    {
        var sql = """
                  SELECT
                      CR."Id" AS "CitizenReportId",
                      CR."FormId",
                      CR."Answers",
                      CR."FollowUpStatus",
                      F."Questions",
                      L."Level1",
                      L."Level2",
                      L."Level3",
                      L."Level4",
                      L."Level5",
                      COALESCE(
                              (
                                  SELECT
                                      JSONB_AGG(
                                              JSONB_BUILD_OBJECT(
                                                      'QuestionId',
                                                      "QuestionId",
                                                      'FilePath',
                                                      "FilePath",
                                                      'UploadedFileName',
                                                      "UploadedFileName"
                                              )
                                      )
                                  FROM
                                      "CitizenReportAttachments" A
                                  WHERE
                                      A."ElectionRoundId" = @electionRoundId
                                    AND A."FormId" = CR."FormId"
                                    AND A."CitizenReportId" = CR."Id"
                              ),
                              '[]'::JSONB
                      ) AS "Attachments",
                      COALESCE(
                              (
                                  SELECT
                                      JSONB_AGG(
                                              JSONB_BUILD_OBJECT('QuestionId', "QuestionId", 'Text', "Text")
                                      )
                                  FROM
                                      "CitizenReportNotes" N
                                  WHERE
                                      N."ElectionRoundId" = @electionRoundId
                                    AND N."FormId" = CR."FormId"
                                    AND N."CitizenReportId" = CR."Id"
                              ),
                              '[]'::JSONB
                      ) AS "Notes",
                      COALESCE(CR."LastModifiedOn", CR."CreatedOn") "TimeSubmitted"
                  FROM
                      "CitizenReports" CR
                          INNER JOIN "Forms" F ON F."Id" = CR."FormId"
                          INNER JOIN "Locations" L ON L."Id" = CR."LocationId"
                          INNER JOIN "ElectionRounds" E ON CR."ElectionRoundId" = E."Id"
                          INNER JOIN "MonitoringNgos" MN ON MN."Id" = E."MonitoringNgoForCitizenReportingId"
                  WHERE
                      CR."ElectionRoundId" = @electionRoundId
                    AND E."CitizenReportingEnabled" = TRUE
                    AND MN."NgoId" = @ngoId
                  ORDER BY
                      "TimeSubmitted" DESC
                  """;

        var queryParams = new { electionRoundId, ngoId };

        IEnumerable<CitizenReportModel> citizenReports = [];
        using (var dbConnection = await dbConnectionFactory.GetOpenConnectionAsync(ct))
        {
            citizenReports = await dbConnection.QueryAsync<CitizenReportModel>(sql, queryParams);
        }

        var citizenReportsData = citizenReports.ToArray();
        return citizenReportsData;
    }
}