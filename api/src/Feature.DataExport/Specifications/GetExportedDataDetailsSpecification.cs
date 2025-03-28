﻿using Ardalis.Specification;
using Feature.DataExport.Details;
using Vote.Monitor.Domain.Entities.ExportedDataAggregate;

namespace Feature.DataExport.Specifications;

public sealed class GetExportedDataDetailsSpecification : SingleResultSpecification<ExportedData, Response>
{
    public GetExportedDataDetailsSpecification(Guid exportedDataId, Guid userId)
    {
        Query.Where(x => x.OwnerId == userId && x.Id == exportedDataId);

        Query.Select(x => new Response
        {
            ExportedDataId = x.Id,
            CompletedAt = x.CompletedAt,
            ExportStatus = x.ExportStatus,
            FileName = x.FileName,
            StartedAt = x.StartedAt,
            ExportedDataType = x.ExportedDataType
        });
    }
}
