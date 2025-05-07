import {
  AnswerType,
  QuestionType,
  type MultiSelectAnswer,
  type MultiSelectQuestion,
  type NumberAnswer,
  type RatingAnswer,
  type SelectedOption,
  type SelectOption,
  type SingleSelectAnswer,
  type SingleSelectQuestion,
  type TextAnswer,
} from "@/common/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";
const mapFormDataToAnswer = (
  questionType: QuestionType,
  questionId: string,
  value: any
) => {
  switch (questionType) {
    case QuestionType.NumberQuestionType:
      const numberAnswer: NumberAnswer = {
        $answerType: AnswerType.NumberAnswerType,
        questionId,
        value,
      };
      return numberAnswer;

    case QuestionType.TextQuestionType:
      const textAnswer: TextAnswer = {
        $answerType: AnswerType.TextAnswerType,
        questionId,
        text: value,
      };
      return textAnswer;

    case QuestionType.MultiSelectQuestionType:
      let selectionArray = value
        ? value.map((val: string) => {
            return { optionId: val };
          })
        : [];
      const multiselectAnswer: MultiSelectAnswer = {
        $answerType: AnswerType.MultiSelectAnswerType,
        questionId,
        selection: selectionArray,
      };
      return multiselectAnswer;

    case QuestionType.SingleSelectQuestionType:
      const singleSelectAnswer: SingleSelectAnswer = {
        $answerType: AnswerType.SingleSelectAnswerType,
        questionId,
        selection: { optionId: value },
      };

      return singleSelectAnswer;

    case QuestionType.RatingQuestionType:
      const ratingAnswer: RatingAnswer = {
        $answerType: AnswerType.RatingAnswerType,
        questionId,
        value,
      };

      return ratingAnswer;

    default:
      return value;
      break;
  }
};

const addOptionToMultiSelectAnswer = (
  questionId: string,
  currentValue: MultiSelectAnswer,
  option: SelectedOption
) => {
  let selections = currentValue?.selection ?? [];
  selections = [...selections, option];
  const multiselectAnswer: MultiSelectAnswer = {
    $answerType: AnswerType.MultiSelectAnswerType,
    questionId,
    selection: selections,
  };
  return multiselectAnswer;
};

const removeSelectionFromMultiSelectAnswer = (
  questionId: string,
  currentValue: MultiSelectAnswer,
  optionId: string
) => {
  let selections = currentValue?.selection ?? [];
  const filteredSelections = selections.filter(
    (selected) => (selected as unknown as SelectOption).id !== optionId
  );

  const multiselectAnswer: MultiSelectAnswer = {
    $answerType: AnswerType.MultiSelectAnswerType,
    questionId,
    selection: filteredSelections,
  };
  return multiselectAnswer;
};

export const FormQuestionFreeTextInput = ({
  control,
  questionId,
  freeTextOption,
  language,
}: {
  control: Control<any>;
  questionId: string;
  freeTextOption: SelectOption;
  language: string;
}) => {
  return (
    <FormField
      control={control}
      name={`question-${questionId}.${freeTextOption.id}`}
      rules={{
        required: true,
        validate: (value: NumberAnswer | undefined) =>
          value?.value !== undefined,
      }}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Textarea
              {...field}
              placeholder={freeTextOption.text?.[language]}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const FormQuestionNumberInput = ({
  control,
  questionId,
}: {
  control: Control<any>;
  questionId: string;
}) => {
  return (
    <FormField
      control={control}
      name={`question-${questionId}`}
      rules={{
        required: true,
        validate: (value: NumberAnswer | undefined) =>
          value?.value !== undefined,
      }}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <NumberInput
              onChange={(value) =>
                field.onChange(
                  mapFormDataToAnswer(
                    QuestionType.NumberQuestionType,
                    questionId,
                    value
                  )
                )
              }
              onBlur={field.onBlur}
              value={(field?.value as NumberAnswer)?.value}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const FormQuestionTextInput = ({
  control,
  questionId,
}: {
  control: Control<any>;
  questionId: string;
}) => {
  return (
    <FormField
      control={control}
      name={`question-${questionId}`}
      rules={{
        required: true,
        validate: (value: TextAnswer | undefined) => value?.text !== "",
      }}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              onChange={(evemt) =>
                field.onChange(
                  mapFormDataToAnswer(
                    QuestionType.TextQuestionType,
                    questionId,
                    evemt.target.value
                  )
                )
              }
              onBlur={field.onBlur}
              value={(field?.value as TextAnswer)?.text}
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const FormQuestionSingleSelectInput = ({
  control,
  question,
  language,
}: {
  control: Control<any>;
  question: SingleSelectQuestion;
  language: string;
}) => {
  return (
    <FormField
      control={control}
      name={`question-${question.id}`}
      rules={{ required: true }}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormControl>
            <RadioGroup
              onValueChange={(value) =>
                field.onChange(
                  mapFormDataToAnswer(
                    QuestionType.SingleSelectQuestionType,
                    question.id,
                    value
                  )
                )
              }
              value={(field?.value as SingleSelectAnswer)?.selection?.optionId}
              className="flex flex-col space-y-1"
            >
              {question.options.map((option) => (
                <FormItem
                  className="flex items-center space-x-3 space-y-0"
                  key={`${question.id}-${option.id}`}
                >
                  <FormControl>
                    <RadioGroupItem value={option.id} />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {option.text[language]}
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const FormQuestionMultiSelectInput = ({
  control,
  question,
  language,
}: {
  control: Control<any>;
  question: MultiSelectQuestion;
  language: string;
}) => {
  const fieldName = `question-${question.id}`;
  const fieldValue = useWatch({ name: fieldName, control });

  const selectedFreeTextOption: SelectOption | undefined = useMemo(
    () => fieldValue?.selection?.find((opt: SelectOption) => opt.isFreeText),
    [fieldValue]
  );

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name={fieldName}
        rules={{ required: true, minLength: 1 }}
        render={({ field }) => (
          <FormItem>
            {question.options.map((option) => {
              const isChecked = field.value?.selection?.some(
                (opt: any) => opt.id === option.id
              );

              return (
                <FormItem
                  key={option.id}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? addOptionToMultiSelectAnswer(
                              question.id,
                              field.value,
                              option as any
                            )
                          : removeSelectionFromMultiSelectAnswer(
                              question.id,
                              field.value,
                              option.id
                            );
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    {option.text[language]}
                  </FormLabel>
                </FormItem>
              );
            })}
            <FormMessage />
          </FormItem>
        )}
      />
      {selectedFreeTextOption && (
        <FormQuestionFreeTextInput
          control={control}
          questionId={question.id}
          freeTextOption={selectedFreeTextOption}
          language={language}
        />
      )}
    </div>
  );
};
