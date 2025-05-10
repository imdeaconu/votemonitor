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
import { type Control } from "react-hook-form";
import { useShouldDisplayQuestion } from "../hooks/useShouldDisplayQuestion";
import {
  FormQuestionMultiSelectInput,
  FormQuestionNumberInput,
  FormQuestionSingleSelectInput,
  FormQuestionTextInput,
} from "./FormQuestionInputs";

interface FormQuestionProps {
  question: BaseQuestion;
  control: Control;
}

const BaseFormQuestion = ({ question, control }: FormQuestionProps) => {
  const language = useAtomValue(currentFormLanguageAtom);

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

const QuestionWithDisplayLogic = ({ question, control }: FormQuestionProps) => {
  const shouldDisplay = useShouldDisplayQuestion({ question, control });
  if (!shouldDisplay) return;
  return <BaseFormQuestion question={question} control={control} />;
};

export const FormQuestion = ({ question, control }: FormQuestionProps) => {
  if (question.displayLogic)
    return <QuestionWithDisplayLogic question={question} control={control} />;
  return <BaseFormQuestion question={question} control={control} />;
};
