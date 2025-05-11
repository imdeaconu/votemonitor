import {
  AnswerType,
  QuestionType,
  type MultiSelectAnswer,
  type NumberAnswer,
  type RatingAnswer,
  type SelectedOption,
  type SelectOption,
  type SingleSelectAnswer,
  type TextAnswer,
} from "@/common/types";

export const mapFormDataToAnswer = (
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
export const addOptionToMultiSelectAnswer = (
  questionId: string,
  currentValue: MultiSelectAnswer,
  option: SelectedOption
) => {
  let selections = currentValue?.selection ?? [];
  selections = [...selections, option];
  let multiselectAnswer: MultiSelectAnswer = {
    $answerType: AnswerType.MultiSelectAnswerType,
    questionId,
    selection: selections,
  };

  return multiselectAnswer;
};
export const removeSelectionFromMultiSelectAnswer = (
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
