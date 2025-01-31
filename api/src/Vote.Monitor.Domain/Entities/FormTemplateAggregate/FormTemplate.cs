﻿using FluentValidation;
using FluentValidation.Results;
using Vote.Monitor.Core.Helpers;
using Vote.Monitor.Core.Models;
using Vote.Monitor.Domain.Entities.FormAggregate;
using Vote.Monitor.Domain.Entities.FormBase.Questions;

namespace Vote.Monitor.Domain.Entities.FormTemplateAggregate;

public class FormTemplate : AuditableBaseEntity, IAggregateRoot
{
    public Guid Id { get; private set; }
    public FormType FormType { get; set; }
    public string Code { get; private set; }
    public string DefaultLanguage { get; private set; }
    public TranslatedString Name { get; private set; }
    public TranslatedString Description { get; private set; }
    public FormTemplateStatus Status { get; private set; }
    public string[] Languages { get; private set; } = [];
    public int NumberOfQuestions { get; private set; }
    public IReadOnlyList<BaseQuestion> Questions { get; private set; } = new List<BaseQuestion>().AsReadOnly();

    [JsonConstructor]
    internal FormTemplate(Guid id,
        FormType formType,
        string code,
        string defaultLanguage,
        TranslatedString name,
        TranslatedString description,
        FormTemplateStatus status,
        string[] languages)
    {
        Id = id;
        FormType = formType;
        Code = code;
        DefaultLanguage = defaultLanguage;
        Name = name;
        Description = description;
        Status = status;
        Languages = languages;
    }

    private FormTemplate(FormType formType,
        string code,
        string defaultLanguage,
        TranslatedString name,
        TranslatedString description,
        IEnumerable<string> languages,
        IEnumerable<BaseQuestion> questions)
    {
        Id = Guid.NewGuid();
        FormType = formType;
        Code = code;
        DefaultLanguage = defaultLanguage;
        Name = name;
        Description = description;
        Languages = languages.ToArray();
        Status = FormTemplateStatus.Drafted;
        Questions = questions.ToList();
    }

    public static FormTemplate Create(FormType formType,
        string code,
        string defaultLanguage,
        TranslatedString name,
        TranslatedString description,
        IEnumerable<string> languages,
        IEnumerable<BaseQuestion> questions) =>
        new(formType, code, defaultLanguage, name, description, languages, questions);

    public PublishResult Publish()
    {
        var validator = new FormTemplateValidator();
        var validationResult = validator.Validate(this);

        if (!validationResult.IsValid)
        {
            return new PublishResult.InvalidFormTemplate(validationResult);
        }

        Status = FormTemplateStatus.Published;

        return new PublishResult.Published();
    }

    public void Draft()
    {
        Status = FormTemplateStatus.Drafted;
    }

    public void UpdateDetails(string code,
        string defaultLanguage,
        TranslatedString name,
        TranslatedString description,
        FormType formType,
        IEnumerable<string> languages,
        IEnumerable<BaseQuestion> questions)
    {
        Code = code;
        DefaultLanguage = defaultLanguage;
        Name = name;
        Description = description;
        FormType = formType;
        Languages = languages.ToArray();
        Questions = questions.ToList().AsReadOnly();
        NumberOfQuestions = Questions.Count;
    }

    public void AddTranslations(string[] languageCodes)
    {
        var newLanguages = languageCodes.Except(Languages);
        Languages = Languages.Union(languageCodes).ToArray();

        foreach (var languageCode in newLanguages)
        {
            Description.AddTranslation(languageCode);
            Name.AddTranslation(languageCode);

            foreach (var question in Questions)
            {
                question.AddTranslation(languageCode);
            }
        }
    }

    public void RemoveTranslation(string languageCode)
    {
        bool hasLanguageCode = languageCode.Contains(languageCode);

        if (!hasLanguageCode)
        {
            return;
        }

        if (DefaultLanguage == languageCode)
        {
            throw new ArgumentException("Cannot remove default language");
        }

        Languages = Languages.Except([languageCode]).ToArray();
        Description.RemoveTranslation(languageCode);
        Name.RemoveTranslation(languageCode);

        foreach (var question in Questions)
        {
            question.RemoveTranslation(languageCode);
        }
    }

    public bool HasTranslation(string languageCode)
    {
        return Languages.Contains(languageCode);
    }

    public void SetDefaultLanguage(string languageCode)
    {
        if (!HasTranslation(languageCode))
        {
            throw new ArgumentException("Form template does not have translations for language code");
        }

        DefaultLanguage = languageCode;
    }

    public FormTemplate Duplicate() =>
        new(FormType, Code, DefaultLanguage, Name, Description, Languages, Questions);

    public FormAggregate.Form Clone(Guid electionRoundId, Guid monitoringNgoId, string defaultLanguage, string[] languages)
    {
        if (Status != FormTemplateStatus.Published)
        {
            throw new ValidationException([
                new ValidationFailure(nameof(Status), "Form template is not published.")
            ]);
        }


        if (!Languages.Contains(defaultLanguage))
        {
            throw new ValidationException([
                new ValidationFailure(nameof(defaultLanguage), "Default language is not supported.")
            ]);
        }

        foreach (var iso in languages)
        {
            if (!Languages.Contains(iso))
            {
                throw new ValidationException([
                    new ValidationFailure(nameof(languages) + $".{iso}", "Language is not supported.")
                ]);
            }
        }

        return FormAggregate.Form.Create(electionRoundId,
            monitoringNgoId,
            FormType,
            Code,
            new TranslatedString(Name).TrimTranslations(languages),
            new TranslatedString(Description).TrimTranslations(languages),
            defaultLanguage,
            languages,
            null,
            Questions.Select(x => x.DeepClone().TrimTranslations(languages)).ToList());
    }

#pragma warning disable CS8618 // Required by Entity Framework

    private FormTemplate()
    {
    }
#pragma warning restore CS8618
}
