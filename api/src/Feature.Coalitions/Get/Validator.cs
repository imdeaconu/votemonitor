﻿namespace Feature.NgoCoalitions.Get;

public class Validator : Validator<Request>
{
    public Validator()
    {
        RuleFor(x => x.ElectionRoundId).NotEmpty();
        RuleFor(x => x.CoalitionId).NotEmpty();
    }
}