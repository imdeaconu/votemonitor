﻿namespace Feature.IncidentReports.Notes.Upsert;

public class Validator : Validator<Request>
{
    public Validator()
    {
        RuleFor(x => x.ElectionRoundId).NotEmpty();
        RuleFor(x => x.IncidentReportId).NotEmpty();
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FormId).NotEmpty();
        RuleFor(x => x.QuestionId).NotEmpty();
        RuleFor(x => x.Text).NotEmpty().MaximumLength(10_000);
    }
}
