using Feature.MonitoringObservers.Parser;
using Job.Contracts;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Vote.Monitor.Core.Options;
using Vote.Monitor.Core.Security;
using Vote.Monitor.Core.Services.EmailTemplating;
using Vote.Monitor.Core.Services.EmailTemplating.Props;
using Vote.Monitor.Domain;
using Vote.Monitor.Domain.Entities.ApplicationUserAggregate;

namespace Feature.MonitoringObservers.Services;

public class ObserverImportService(
    VoteMonitorContext context,
    UserManager<ApplicationUser> userManager,
    IJobService jobService,
    IEmailTemplateFactory emailFactory,
    IOptions<ApiConfiguration> apiConfig,
    ILogger<ObserverImportService> logger) : IObserverImportService
{
    private readonly ApiConfiguration _apiConfig = apiConfig.Value;

    public async Task ImportAsync(Guid electionRoundId, Guid ngoId,
        IEnumerable<MonitoringObserverImportModel> newObservers,
        CancellationToken ct)
    {
        var observers = newObservers.ToList();
        var normalizedEmails = observers.Select(x => x.Email.ToUpperInvariant().Trim()).ToList();

        var existingAccounts = await userManager
            .Users
            .Where(x => normalizedEmails.Contains(x.NormalizedEmail))
            .ToListAsync(ct);

        var existingMonitoringObservers = await context
            .MonitoringObservers
            .Include(x => x.Observer)
            .ThenInclude(x => x.ApplicationUser)
            .Where(x => normalizedEmails.Contains(x.Observer.ApplicationUser.NormalizedEmail))
            .ToListAsync(ct);

        var existingObservers = await context
            .Observers
            .Include(x => x.ApplicationUser)
            .Where(x => normalizedEmails.Contains(x.ApplicationUser.NormalizedEmail))
            .ToListAsync(ct);

        var monitoringNgo = await context
            .MonitoringNgos
            .Include(x => x.Ngo)
            .Where(x => x.NgoId == ngoId && x.ElectionRoundId == electionRoundId)
            .FirstAsync(ct);

        var ngoName = monitoringNgo.Ngo.Name;

        var electionRoundName = await context.ElectionRounds
            .Where(x => x.Id == electionRoundId)
            .Select(x => x.Title)
            .FirstAsync(ct);

        foreach (var observer in observers)
        {
            var fullName = GetFullName(observer);

            var normalizedEmail = observer.Email.ToUpperInvariant();
            // Has account in our system
            var existingAccount = existingAccounts.FirstOrDefault(x => x.NormalizedEmail == normalizedEmail);

            if (existingAccount != null)
            {
                // Check if is observer
                if (existingAccount.Role != UserRole.Observer)
                {
                    logger.LogWarning("Invited observer has different role in our system");
                    continue;
                }

                // Check if it is already monitoring same election but for different NGO
                var isMonitoringForAnotherNgo = existingMonitoringObservers.Any(x =>
                    x.Observer.ApplicationUser.NormalizedEmail == normalizedEmail &&
                    x.ElectionRoundId == electionRoundId);

                if (isMonitoringForAnotherNgo)
                {
                    logger.LogWarning("Invited observer is monitoring same {electionRound} for different ngo",
                        electionRoundId);
                    continue;
                }

                // Has an account is not monitoring this election round
                var existingObserver =
                    existingObservers.FirstOrDefault(x => x.ApplicationUser.NormalizedEmail == normalizedEmail);

                if (existingObserver is null)
                {
                    // has an account but we failed to create the observer 
                    existingAccount.NewInvite();
                    var newObserver = ObserverAggregate.Create(existingAccount);
                    var newMonitoringObserver = MonitoringObserverAggregate.CreateForExisting(electionRoundId,
                        monitoringNgo.Id, newObserver.Id, observer.Tags ?? [], existingAccount.Status);
                    await context.Observers.AddAsync(newObserver, ct);
                    await context.MonitoringObservers.AddAsync(newMonitoringObserver, ct);

                    var email = GenerateCreateAccountEmail(existingAccount.InvitationToken!, fullName, ngoName,
                        electionRoundName);
                    jobService.EnqueueSendEmail(observer.Email, email.Subject, email.Body);
                }
                else
                {
                    var newMonitoringObserver = MonitoringObserverAggregate.CreateForExisting(electionRoundId,
                        monitoringNgo.Id,
                        existingObserver.Id,
                        observer.Tags ?? [],
                        existingObserver.ApplicationUser.Status);

                    await context.MonitoringObservers.AddAsync(newMonitoringObserver, ct);

                    var email = existingObserver.ApplicationUser.Status == UserStatus.Pending
                        ? GenerateCreateAccountEmail(existingObserver.ApplicationUser.InvitationToken!,
                            existingObserver.ApplicationUser.DisplayName, ngoName, electionRoundName)
                        : GenerateNotificationEmail(fullName, ngoName, electionRoundName);

                    jobService.EnqueueSendEmail(observer.Email, email.Subject, email.Body);
                }
            }
            else
            {
                // Does not have an account 
                var user = ApplicationUser.Invite(observer.FirstName, observer.LastName, observer.Email,
                    observer.PhoneNumber);

                var result = await userManager.CreateAsync(user);
                if (!result.Succeeded)
                {
                    logger.LogError("Errors when importing monitoring observer {@errors}", result.Errors);
                    continue;
                }

                var newObserver = ObserverAggregate.Create(user);
                var newMonitoringObserver = MonitoringObserverAggregate.Create(electionRoundId, monitoringNgo.Id,
                    newObserver.Id, observer.Tags ?? []);
                await context.Observers.AddAsync(newObserver, ct);
                await context.MonitoringObservers.AddAsync(newMonitoringObserver, ct);

                var email = GenerateCreateAccountEmail(user.InvitationToken!, fullName, ngoName, electionRoundName);
                jobService.EnqueueSendEmail(observer.Email, email.Subject, email.Body);
            }
        }

        await context.SaveChangesAsync(ct);
    }

    private EmailModel GenerateNotificationEmail(string fullName, string ngoName, string electionRoundName)
    {
        var invitationExistingUserEmailProps = new InvitationExistingUserEmailProps(FullName: fullName,
            CdnUrl: _apiConfig.WebAppUrl, NgoName: ngoName, ElectionRoundDetails: electionRoundName);

        var email = emailFactory.GenerateInvitationExistingUserEmail(invitationExistingUserEmailProps);
        return email;
    }

    private EmailModel GenerateCreateAccountEmail(string invitationToken, string fullName, string ngoName,
        string electionRoundName)
    {
        var endpointUri = new Uri(Path.Combine($"{_apiConfig.WebAppUrl}", "accept-invite"));
        string acceptInviteUrl =
            QueryHelpers.AddQueryString(endpointUri.ToString(), "invitationToken", invitationToken);

        var invitationNewUserEmailProps = new InvitationNewUserEmailProps(FullName: fullName,
            CdnUrl: _apiConfig.WebAppUrl,
            AcceptUrl: acceptInviteUrl,
            NgoName: ngoName,
            ElectionRoundDetails: electionRoundName);

        var email = emailFactory.GenerateNewUserInvitationEmail(invitationNewUserEmailProps);
        return email;
    }


    private static string GetFullName(MonitoringObserverImportModel observer)
    {
        return observer.FirstName + " " + observer.LastName;
    }
}
