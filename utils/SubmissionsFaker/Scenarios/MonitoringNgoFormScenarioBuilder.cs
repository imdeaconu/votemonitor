using SubmissionsFaker.Clients.NgoAdmin.Models;
using SubmissionsFaker.Consts;
using SubmissionsFaker.Extensions;
using SubmissionsFaker.Fakers;
using SubmissionsFaker.Models;

namespace SubmissionsFaker.Scenarios;

public class MonitoringNgoFormScenarioBuilder
{
    public readonly MonitoringNgoScenarioBuilder ParentBuilder;

    private readonly UpdateFormResponse _form;
    public Guid FormId => _form.Id;
    public UpdateFormResponse Form => _form;

    public MonitoringNgoFormScenarioBuilder(
        MonitoringNgoScenarioBuilder parentBuilder,
        UpdateFormResponse form)
    {
        ParentBuilder = parentBuilder;
        _form = form;
    }
    
    public MonitoringNgoFormScenarioBuilder WithSubmission(ScenarioObserver observer,
        ScenarioPollingStation pollingStation)
    { 
        var pollingStationId = ParentBuilder.ParentBuilder.PollingStationByName(pollingStation);
        var submission = new SubmissionFaker(_form.Id, pollingStationId, _form.Questions).Generate();

        var observerClient = ParentBuilder.ParentBuilder.ParentBuilder.ClientFor(observer);

        observerClient.PostWithResponse<ResponseWithId>(
            $"/api/election-rounds/{ParentBuilder.ElectionRoundId}/form-submissions",
            submission);
        return this;
    }
}