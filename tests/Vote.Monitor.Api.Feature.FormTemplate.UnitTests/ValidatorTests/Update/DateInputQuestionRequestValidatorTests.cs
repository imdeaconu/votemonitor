﻿using Vote.Monitor.Api.Feature.FormTemplate.Update.Requests;
using Vote.Monitor.Api.Feature.FormTemplate.Update.Validators;

namespace Vote.Monitor.Api.Feature.FormTemplate.UnitTests.ValidatorTests.Update;

public class DateInputQuestionRequestValidatorTests
{
    private readonly DateInputQuestionRequestValidator _sut = new([LanguagesList.EN.Iso1, LanguagesList.RO.Iso1]);

    [Fact]
    public void Validation_ShouldFail_When_EmptyId()
    {
        // Arrange
        var dateInputQuestionRequest = new DateInputQuestionRequest
        {
            Id = Guid.Empty
        };

        // Act
        var validationResult = _sut.TestValidate(dateInputQuestionRequest);

        // Assert
        validationResult
            .ShouldHaveValidationErrorFor(x => x.Id);
    }

    [Theory]
    [MemberData(nameof(ValidatorsTestData.InvalidPartiallyTranslatedTestCases), MemberType = typeof(ValidatorsTestData))]
    public void Validation_ShouldFail_When_EmptyText(TranslatedString invalidText)
    {
        // Arrange
        var dateInputQuestionRequest = new DateInputQuestionRequest
        {
            Text = invalidText
        };

        // Act
        var validationResult = _sut.TestValidate(dateInputQuestionRequest);

        // Assert
        validationResult
            .ShouldHaveValidationErrorFor(x => x.Text);
    }

    [Theory]
    [MemberData(nameof(ValidatorsTestData.InvalidPartiallyTranslatedTestCases), MemberType = typeof(ValidatorsTestData))]
    public void Validation_ShouldFail_When_EmptyHelptext(TranslatedString invalidHelptext)
    {
        // Arrange
        var dateInputQuestionRequest = new DateInputQuestionRequest
        {
            Helptext = invalidHelptext
        };

        // Act
        var validationResult = _sut.TestValidate(dateInputQuestionRequest);

        // Assert
        validationResult
            .ShouldHaveValidationErrorFor(x => x.Helptext);
    }

    [Fact]
    public void Validation_ShouldPass_When_NoHelptext()
    {
        // Arrange
        var dateInputQuestionRequest = new DateInputQuestionRequest
        {
            Helptext = null
        };

        // Act
        var validationResult = _sut.TestValidate(dateInputQuestionRequest);

        // Assert
        validationResult
            .ShouldNotHaveValidationErrorFor(x => x.Helptext);
    }

    [Theory]
    [MemberData(nameof(TestData.EmptyStringsTestCases), MemberType = typeof(TestData))]
    public void Validation_ShouldFail_When_CodeEmpty(string code)
    {
        // Arrange
        var dateInputQuestionRequest = new DateInputQuestionRequest
        {
            Code = code
        };

        // Act
        var validationResult = _sut.TestValidate(dateInputQuestionRequest);

        // Assert
        validationResult
            .ShouldHaveValidationErrorFor(x => x.Code)
            .WithErrorMessage("'Code' must not be empty.");
    }

    [Theory]
    [MemberData(nameof(ValidatorsTestData.InvalidCodeTestCases), MemberType = typeof(ValidatorsTestData))]
    public void Validation_ShouldFail_When_CodeHasInvalidLength(string code)
    {
        // Arrange
        var dateInputQuestionRequest = new DateInputQuestionRequest
        {
            Code = code
        };

        // Act
        var validationResult = _sut.TestValidate(dateInputQuestionRequest);

        // Assert
        validationResult
            .ShouldHaveValidationErrorFor(x => x.Code);
    }

    [Fact]
    public void Validation_ShouldPass_When_ValidRequest()
    {
        // Arrange
        var dateInputQuestionRequest = new DateInputQuestionRequest
        {
            Code = "code",
            Helptext = ValidatorsTestData.ValidPartiallyTranslatedTestData.First(),
            Text = ValidatorsTestData.ValidPartiallyTranslatedTestData.Last(),
            Id = Guid.NewGuid()
        };

        // Act
        var validationResult = _sut.TestValidate(dateInputQuestionRequest);

        // Assert
        validationResult
            .ShouldNotHaveAnyValidationErrors();
    }
}