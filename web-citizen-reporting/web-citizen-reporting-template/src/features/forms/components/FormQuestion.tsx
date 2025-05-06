import { type BaseQuestion } from "@/common/types";
import { FormDescription, FormLabel } from "@/components/ui/form";
import { currentFormLanguageAtom } from "@/features/forms/atoms";
import {
  isMultiSelectQuestion,
  isNumberQuestion,
  isSingleSelectQuestion,
  isTextQuestion,
} from "@/lib/utils";
import { useAtomValue } from "jotai";
import { useFormContext } from "react-hook-form";
import {
  FormQuestionMultiSelectInput,
  FormQuestionNumberInput,
  FormQuestionSingleSelectInput,
  FormQuestionTextInput,
} from "./FormQuestionInputs";

interface BaseFormQuestionProps {
  question: BaseQuestion;
}

const BaseFormQuestion = ({ question }: BaseFormQuestionProps) => {
  const language = useAtomValue(currentFormLanguageAtom);
  const { control } = useFormContext();

  return (
    <div className="w-full flex flex-col gap-4" key={question.id}>
      <div>
        <FormLabel>
          <span> {`${question.code} - ${question.text[language]}`}</span>
        </FormLabel>

        <FormDescription>{question?.helptext?.[language]}</FormDescription>
      </div>
      {isNumberQuestion(question) && (
        <FormQuestionNumberInput questionId={question.id} control={control} />
      )}
      {isTextQuestion(question) && (
        <FormQuestionTextInput questionId={question.id} control={control} />
      )}
      {isSingleSelectQuestion(question) && (
        <FormQuestionSingleSelectInput
          question={question}
          control={control}
          language={language}
        />
      )}
      {isMultiSelectQuestion(question) && (
        <FormQuestionMultiSelectInput
          question={question}
          control={control}
          language={language}
        />
      )}{" "}
    </div>
  );
};

export const FormQuestion = ({ question }: { question: BaseQuestion }) => {
  return <BaseFormQuestion question={question} />;
};
