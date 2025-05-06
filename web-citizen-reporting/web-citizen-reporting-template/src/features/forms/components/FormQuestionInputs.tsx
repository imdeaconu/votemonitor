import {
  AnswerType,
  QuestionType,
  type MultiSelectAnswer,
  type MultiSelectQuestion,
  type NumberAnswer,
  type RatingAnswer,
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
import type { Control } from "react-hook-form";
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
  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name={`question-${question.id}`}
        render={() => (
          <FormItem>
            {question.options.map((option) => (
              <FormField
                key={option.id}
                control={control}
                name={`question-${question.id}`}
                rules={{ required: true, minLength: 1 }}
                render={({ field }) => {
                  return (
                    <FormItem
                      key={option.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(option.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, option.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value: string) => value !== option.id
                                  )
                                );
                          }}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {option.text[language]}
                      </FormLabel>
                    </FormItem>
                  );
                }}
              />
            ))}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
