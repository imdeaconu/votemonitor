﻿namespace Feature.IncidentReports.GetById;

public class Validator : Validator<Request>
{
    public Validator()
    {
        RuleFor(x => x.ElectionRoundId).NotEmpty();
        RuleFor(x => x.NgoId).NotEmpty();
        RuleFor(x => x.IncidentReportId).NotEmpty();
    }
}