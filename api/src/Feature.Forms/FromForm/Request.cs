﻿using Vote.Monitor.Core.Security;

namespace Feature.Forms.FromForm;

public class Request
{
    public Guid ElectionRoundId { get; set; }

    [FromClaim(ApplicationClaimTypes.NgoId)]
    public Guid NgoId { get; set; }

    public Guid FormElectionRoundId { get; set; }
    public Guid FormId { get; set; }
    
    public string DefaultLanguage { get; set; }
    public string[] Languages { get; set; }
}