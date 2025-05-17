import type {
  MultiSelectAnswer,
  MultiSelectQuestion,
  SelectedOption,
} from "@/common/types";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

export const useFreeTextInput = (question: MultiSelectQuestion) => {
  const freeTextOption = question.options.find((option) => option.isFreeText);
  const fieldNames = {
    parent: `question-${question.id}`,
    freeText: `question-${question.id}-ft-${freeTextOption?.id ?? "0"}`,
  };

  const { control } = useFormContext();
  const currentValueFromParent = useWatch({ control, name: fieldNames.parent });

  const isFreeTextOptionSelected = (fieldValue: MultiSelectAnswer) => {
    if (!freeTextOption || !fieldValue) return false;

    if (!fieldValue.selection || fieldValue.selection.length === 0)
      return false;

    const currentSelectionSet = new Set(
      fieldValue.selection.map((opt) => opt.optionId)
    );

    return currentSelectionSet.has(freeTextOption.id);
  };

  const addFreeTextToOption = (text: string) => {
    const updatedData = currentValueFromParent?.selection?.map(
      (selection: SelectedOption) => {
        if (selection.optionId === freeTextOption?.id)
          return { ...selection, text };
        return selection;
      }
    );
    return { ...currentValueFromParent, selection: updatedData };
  };

  const shouldDisplayFreeTextInput = useMemo(
    () => isFreeTextOptionSelected(currentValueFromParent),
    [currentValueFromParent]
  );

  return {
    freeTextOption,
    fieldNames,
    shouldDisplayFreeTextInput,
    isFreeTextOptionSelected,
    addFreeTextToOption,
  };
};
