import {
  QuestionType,
  type MultiSelectAnswer,
  type MultiSelectQuestion,
  type NumberAnswer,
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
import { useFormContext, useWatch } from "react-hook-form";
import {
  addOptionToMultiSelectAnswer,
  mapFormDataToAnswer,
  removeSelectionFromMultiSelectAnswer,
} from "../utils";
export const FormQuestionFreeTextInput = ({
  questionId,
  freeTextOption,
  language,
  isRequired,
}: {
  questionId: string;
  freeTextOption: SelectOption;
  language: string;
  isRequired?: boolean;
}) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={`question-${questionId}-ft-${freeTextOption.id}`}
      rules={{
        required: isRequired,
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
  questionId,
  isRequired,
}: {
  questionId: string;
  isRequired?: boolean;
}) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={`question-${questionId}`}
      rules={{
        required: isRequired,
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
  questionId,
  isRequired,
}: {
  questionId: string;
  isRequired?: boolean;
}) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={`question-${questionId}`}
      rules={{
        required: isRequired,
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
  question,
  language,
  isRequired,
}: {
  question: SingleSelectQuestion;
  language: string;
  isRequired?: boolean;
}) => {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={`question-${question.id}`}
      rules={{ required: isRequired }}
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
  question,
  language,
  isRequired,
}: {
  question: MultiSelectQuestion;
  language: string;
  isRequired?: boolean;
}) => {
  const { control } = useFormContext();

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
        rules={{
          required: isRequired,
          validate: (value: MultiSelectAnswer | undefined) =>
            value?.selection && value.selection.length > 0,
        }}
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
          questionId={question.id}
          freeTextOption={selectedFreeTextOption}
          language={language}
        />
      )}
    </div>
  );
};
