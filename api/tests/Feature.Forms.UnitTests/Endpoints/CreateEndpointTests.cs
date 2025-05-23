﻿using System.Security.Claims;
using Feature.Forms.Models;
using Microsoft.AspNetCore.Authorization;
using Vote.Monitor.Core.Constants;
using Vote.Monitor.Domain.Entities.FormAggregate;
using Vote.Monitor.Domain.Entities.MonitoringNgoAggregate;

namespace Feature.Forms.UnitTests.Endpoints;

public class CreateEndpointTests
{
    private readonly IAuthorizationService _authorizationService = Substitute.For<IAuthorizationService>();
    private readonly IRepository<Form> _repository = Substitute.For<IRepository<Form>>();
    private readonly IRepository<MonitoringNgo> _monitoringNgoRepository = Substitute.For<IRepository<MonitoringNgo>>();
    private readonly Create.Endpoint _endpoint;
    private readonly Guid _initialFormVersion = Guid.NewGuid();
    private readonly MonitoringNgo _monitoringNgo;

    public CreateEndpointTests()
    {
        _endpoint = Factory.Create<Create.Endpoint>(_authorizationService, _monitoringNgoRepository, _repository);
        _authorizationService
            .AuthorizeAsync(Arg.Any<ClaimsPrincipal>(), Arg.Any<object>(),
                Arg.Any<IEnumerable<IAuthorizationRequirement>>()).Returns(AuthorizationResult.Success());
        _monitoringNgo = new MonitoringNgoAggregateFaker(formsVersions: _initialFormVersion).Generate();
        _monitoringNgoRepository.GetByIdAsync(_monitoringNgo.Id).Returns(_monitoringNgo);
    }

    [Fact]
    public async Task ShouldReturnNotFound_WhenUserIsNotAuthorized()
    {
        // Arrange
        _authorizationService
            .AuthorizeAsync(Arg.Any<ClaimsPrincipal>(), Arg.Any<object>(), Arg.Any<IEnumerable<IAuthorizationRequirement>>())
            .Returns(AuthorizationResult.Failed());

        // Act
        var request = new Create.Request();

        var result = await _endpoint.ExecuteAsync(request, CancellationToken.None);

        // Assert
        result
            .Should().BeOfType<Results<Ok<FormFullModel>, NotFound>>()
            .Which
            .Result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task ShouldUpdateFormVersion_WhenValidRequest()
    {
        // Arrange
        var formName = new TranslatedString { [LanguagesList.RO.Iso1] = "UniqueName" };

        _monitoringNgoRepository
            .FirstOrDefaultAsync(Arg.Any<GetMonitoringNgoSpecification>())
            .Returns(_monitoringNgo);

        // Act
        var request = new Create.Request
        {
            NgoId = _monitoringNgo.NgoId,
            Name = formName,
            Code = "a code",
            DefaultLanguage = LanguagesList.RO.Iso1,
            Languages = [LanguagesList.RO.Iso1]
        };

        await _endpoint.ExecuteAsync(request, CancellationToken.None);

        // Assert
        await _monitoringNgoRepository
            .Received(1)
            .UpdateAsync(Arg.Is<MonitoringNgo>(x => x.Id == _monitoringNgo.Id
                                                    && x.FormsVersion != _initialFormVersion));
    }

    [Fact]
    public async Task ShouldReturnOkWithFormModel_WhenNoConflict()
    {
        // Arrange
        var formName = new TranslatedString { [LanguagesList.RO.Iso1] = "UniqueName" };
        _monitoringNgoRepository
            .FirstOrDefaultAsync(Arg.Any<GetMonitoringNgoSpecification>())
            .Returns(_monitoringNgo);

        // Act
        var request = new Create.Request
        {
            NgoId = _monitoringNgo.NgoId,
            Name = formName,
            Code = "a code",
            DefaultLanguage = LanguagesList.RO.Iso1,
            Languages = [LanguagesList.RO.Iso1]
        };
        var result = await _endpoint.ExecuteAsync(request, CancellationToken.None);

        // Assert
        await _repository
               .Received(1)
               .AddAsync(Arg.Is<Form>(x => x.Name == formName));

        result
            .Should().BeOfType<Results<Ok<FormFullModel>, NotFound>>()!
            .Which!
            .Result.Should().BeOfType<Ok<FormFullModel>>()!
            .Which!.Value!.Name.Should().BeEquivalentTo(formName);
    }
}
