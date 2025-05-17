import {
  QuestionType,
  type NumberAnswer,
  type SingleSelectAnswer,
  type SingleSelectQuestion,
  type TextAnswer,
} from "@/common/types";
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
import { useFormContext } from "react-hook-form";
import { mapFormDataToAnswer } from "../utils";

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
