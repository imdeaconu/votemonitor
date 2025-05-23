﻿using Feature.Ngos.Specifications;
using Feature.Ngos.Update;
using Vote.Monitor.TestUtils.Fakes.Aggregates;
using Endpoint = Feature.Ngos.Update.Endpoint;

namespace Feature.Ngos.UnitTests.Endpoints;

public class UpdateEndpointTests
{
    [Fact]
    public async Task ShouldReturnNotFound_WhenNgoDoesNotExist()
    {
        // Arrange
        var repository = Substitute.For<IRepository<NgoAggregate>>();
        var endpoint = Factory.Create<Endpoint>(repository);

        // Act
        var request = new Request { Id = Guid.NewGuid() };
        var result = await endpoint.ExecuteAsync(request, CancellationToken.None);

        // Assert
        result
            .Should().BeOfType<Results<NoContent, NotFound, Conflict<ProblemDetails>>>()
            .Which
            .Result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task ShouldReturnConflict_WhenNgoWithSameNameExists()
    {
        // Arrange
        var ngo = new NgoAggregateFaker().Generate();

        var repository = Substitute.For<IRepository<NgoAggregate>>();
        repository
            .GetByIdAsync(ngo.Id)
            .Returns(ngo);

        repository
            .AnyAsync(Arg.Any<GetNgoWithSameNameSpecification>())
            .Returns(true);

        var endpoint = Factory.Create<Endpoint>(repository);

        // Act
        var request = new Request { Id = ngo.Id, Name = "ExistingName" };
        var result = await endpoint.ExecuteAsync(request, CancellationToken.None);

        // Assert
        result
            .Should().BeOfType<Results<NoContent, NotFound, Conflict<ProblemDetails>>>()
            .Which
            .Result.Should().BeOfType<Conflict<ProblemDetails>>();
    }

    [Fact]
    public async Task ShouldNoContent_AfterUpdatingNgoDetails()
    {
        // Arrange
        var ngo = Substitute.For<NgoAggregate>();

        var repository = Substitute.For<IRepository<NgoAggregate>>();
        repository
            .GetByIdAsync(Arg.Any<Guid>())
            .Returns(ngo);

        var endpoint = Factory.Create<Endpoint>(repository);

        // Act
        var request = new Request { Id = Guid.NewGuid(), Name = "updatedName" };
        var result = await endpoint.ExecuteAsync(request, CancellationToken.None);

        // Assert
        ngo.Received(1).UpdateDetails("updatedName");
        result
            .Should().BeOfType<Results<NoContent, NotFound, Conflict<ProblemDetails>>>()
            .Which
            .Result.Should().BeOfType<NoContent>();
    }
}
