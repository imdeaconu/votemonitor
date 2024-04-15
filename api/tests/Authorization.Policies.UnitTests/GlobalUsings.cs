﻿global using Authorization.Policies.Requirements;
global using Authorization.Policies.Specifications;
global using FluentAssertions;
global using Microsoft.AspNetCore.Authorization;
global using NSubstitute;
global using NSubstitute.ReturnsExtensions;
global using Vote.Monitor.Core.Services.Security;
global using Vote.Monitor.Domain.Entities.ElectionRoundAggregate;
global using Vote.Monitor.Domain.Entities.MonitoringNgoAggregate;
global using Vote.Monitor.Domain.Entities.NgoAggregate;
global using Vote.Monitor.Domain.Repository;
global using Xunit;