﻿using Vote.Monitor.Core.Security;
using Vote.Monitor.Domain.Entities.IncidentReportAggregate;

namespace Feature.IncidentReports.ListFormsOverview;

public class Request
{
    public Guid ElectionRoundId { get; set; }

    [FromClaim(ApplicationClaimTypes.NgoId)]
    public Guid NgoId { get; set; }

    [QueryParam] public string? Level1Filter { get; set; }
    [QueryParam] public string? Level2Filter { get; set; }
    [QueryParam] public string? Level3Filter { get; set; }
    [QueryParam] public string? Level4Filter { get; set; }
    [QueryParam] public string? Level5Filter { get; set; }
    [QueryParam] public bool? HasFlaggedAnswers { get; set; }

    [QueryParam] public IncidentReportFollowUpStatus? FollowUpStatusFilter { get; set; }
    [QueryParam] public IncidentReportLocationType? LocationTypeFilter { get; set; }

    [QueryParam] public bool? HasNotes { get; set; }
    [QueryParam] public bool? HasAttachments { get; set; }
    [QueryParam] public QuestionsAnsweredFilter? QuestionsAnswered { get; set; }
    [QueryParam] public bool? IsCompletedFilter { get; set; }
}