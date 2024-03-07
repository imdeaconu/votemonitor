﻿using Vote.Monitor.Api.Feature.FormTemplate.Update.Requests;

namespace Vote.Monitor.Api.Feature.FormTemplate.Update.Validators;

public class TextInputQuestionRequestValidator : Validator<TextInputQuestionRequest>
{
    public TextInputQuestionRequestValidator(List<string> languages)
    {
        RuleFor(x => x.Id).NotEmpty();

        RuleFor(x => x.QuestionType).NotEmpty();

        RuleFor(x => x.Text)
            .SetValidator(new PartiallyTranslatedStringValidator(languages, 3, 256));

        RuleFor(x => x.Helptext)
            .SetValidator(new PartiallyTranslatedStringValidator(languages, 3, 256))
            .When(x => x.Helptext != null);

        RuleFor(x => x.Code)
            .NotEmpty()
            .MaximumLength(256);

        RuleFor(x => x.InputPlaceholder)
            .SetValidator(new PartiallyTranslatedStringValidator(languages, 3, 256))
            .When(x => x.InputPlaceholder != null);
    }
}