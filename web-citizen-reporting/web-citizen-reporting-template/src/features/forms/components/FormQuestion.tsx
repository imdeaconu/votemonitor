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
import { useShouldDisplayQuestion } from "../hooks/useShouldDisplayQuestion";
import {
  FormQuestionMultiSelectInput,
  FormQuestionNumberInput,
  FormQuestionSingleSelectInput,
  FormQuestionTextInput,
} from "./FormQuestionInputs";

interface FormQuestionProps {
  question: BaseQuestion;
  isRequired: boolean;
}

const BaseFormQuestion = ({ question, isRequired }: FormQuestionProps) => {
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
        <FormQuestionNumberInput
          questionId={question.id}
          isRequired={isRequired}
        />
      )}
      {isTextQuestion(question) && (
        <FormQuestionTextInput
          questionId={question.id}
          isRequired={isRequired}
        />
      )}
      {isSingleSelectQuestion(question) && (
        <FormQuestionSingleSelectInput
          question={question}
          language={language}
          isRequired={isRequired}
        />
      )}
      {isMultiSelectQuestion(question) && (
        <FormQuestionMultiSelectInput
          question={question}
          language={language}
          isRequired={isRequired}
        />
      )}
    </div>
  );
};

const QuestionWithDisplayLogic = ({ question }: { question: BaseQuestion }) => {
  const { control } = useFormContext();
  const shouldDisplay = useShouldDisplayQuestion({ question, control });
  if (!shouldDisplay) return;
  return <BaseFormQuestion question={question} isRequired={shouldDisplay} />;
};

export const FormQuestion = ({ question }: { question: BaseQuestion }) => {
  if (question.displayLogic)
    return <QuestionWithDisplayLogic question={question} />;
  return <BaseFormQuestion question={question} isRequired={true} />;
};
