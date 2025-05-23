﻿using Authorization.Policies;
using Feature.NgoAdmins.Specifications;
using Vote.Monitor.Core.Models;

namespace Feature.NgoAdmins.List;

public class Endpoint(IReadRepository<NgoAdminAggregate> repository)
    : Endpoint<Request, Results<Ok<PagedResponse<NgoAdminModel>>, ProblemDetails>>
{
    public override void Configure()
    {
        Get("/api/ngos/{ngoId}/admins");
        DontAutoTag();
        Options(x => x.WithTags("ngo-admins"));
        Policies(PolicyNames.PlatformAdminsOnly);
    }

    public override async Task<Results<Ok<PagedResponse<NgoAdminModel>>, ProblemDetails>> ExecuteAsync(Request req,
        CancellationToken ct)
    {
        var specification = new ListNgoAdminsSpecification(req);
        var admins = await repository.ListAsync(specification, ct);
        var adminsCount = await repository.CountAsync(specification, ct);

        var result = admins.Select(x => new NgoAdminModel
        {
            Id = x.Id,
            FirstName = x.ApplicationUser.FirstName,
            LastName = x.ApplicationUser.LastName,
            Email = x.ApplicationUser.Email!,
            PhoneNumber = x.ApplicationUser.PhoneNumber,
            Status = x.ApplicationUser.Status,
            CreatedOn = x.CreatedOn,
            LastModifiedOn = x.LastModifiedOn
        }).ToList();

        return TypedResults.Ok(new PagedResponse<NgoAdminModel>(result, adminsCount, req.PageNumber, req.PageSize));
    }
}
