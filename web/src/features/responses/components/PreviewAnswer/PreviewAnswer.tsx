import { DateTimeFormat } from '@/common/formats';
import {
  isDateAnswer,
  isMultiSelectAnswer,
  isMultiSelectQuestion,
  isNumberAnswer,
  isRatingAnswer,
  isRatingQuestion,
  isSingleSelectAnswer,
  isSingleSelectQuestion,
  isTextAnswer,
} from '@/common/guards';
import {
  BaseQuestion,
  DateAnswer,
  FunctionComponent,
  MultiSelectAnswer,
  NumberAnswer,
  RatingAnswer,
  SingleSelectAnswer,
  TextAnswer,
} from '@/common/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RatingGroup } from '@/components/ui/ratings';
import { cn, isNotNilOrWhitespace, ratingScaleToNumber } from '@/lib/utils';
import { FlagIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { Attachment, Note, SubmissionType } from '../../models/common';
import { ResponseExtraDataSection } from '../ReponseExtraDataSection/ResponseExtraDataSection';

export interface PreviewAnswerProps {
  submissionType: SubmissionType;
  question: BaseQuestion;
  answer: NumberAnswer | TextAnswer | DateAnswer | RatingAnswer | SingleSelectAnswer | MultiSelectAnswer | undefined;
  notes: Note[];
  attachments: Attachment[];
  defaultLanguage: string;
}

export default function PreviewAnswer({
  submissionType,
  question,
  defaultLanguage,
  answer,
  notes,
  attachments,
}: PreviewAnswerProps): FunctionComponent {
  return (
    <div key={question.id} className='flex flex-col gap-4'>
      <p className='font-bold text-gray-700'>
        {question.code}: {question.text[defaultLanguage]}
      </p>

      <p className='text-sm italic'> {question.helptext?.[defaultLanguage]}</p>
      {isSingleSelectQuestion(question) && (
        <RadioGroup
          defaultChecked
          defaultValue={answer && isSingleSelectAnswer(answer) ? answer.selection?.optionId : ''}>
          {question.options.map((option) => (
            <div key={option.id} className='space-y-4'>
              <div className='flex flex-row items-start space-x-3 space-y-0'>
                <RadioGroupItem disabled value={option.id} id={option.id} />
                <Label className='font-normal' htmlFor={option.id}>
                  {option.text[defaultLanguage]}
                  {option.isFlagged && <> (Flagged)</>}
                </Label>
                {option.isFlagged && <FlagIcon className={cn('text-destructive', 'w-4')} />}
              </div>
              {option.isFreeText &&
                answer &&
                isSingleSelectAnswer(answer) &&
                isNotNilOrWhitespace(answer?.selection?.text) &&
                answer.selection?.optionId === option.id && (
                  <div className='p-3 border rounded-lg'>{answer.selection?.text ?? '-'}</div>
                )}
            </div>
          ))}
        </RadioGroup>
      )}

      {isMultiSelectQuestion(question) &&
        question.options.map((option) => {
          const isOptionChecked =
            answer &&
            isMultiSelectAnswer(answer) &&
            !!answer.selection?.find((selection) => selection.optionId === option.id);

          return (
            <div key={option.id} className='space-y-4'>
              <div className='flex flex-row items-start space-x-3 space-y-0'>
                <Checkbox checked={isOptionChecked} id={option.id} disabled />
                <Label htmlFor={option.id}>
                  {option.text[defaultLanguage]}
                  {option.isFlagged && <> (Flagged)</>}
                </Label>
                {option.isFlagged && <FlagIcon className={cn('text-destructive', 'w-4')} />}
              </div>
              {option.isFreeText &&
                answer &&
                isMultiSelectAnswer(answer) &&
                answer?.selection?.some((o) => o.optionId === option.id) &&
                isNotNilOrWhitespace(answer?.selection?.find((o) => o.optionId === option.id)?.text) && (
                  <div className='p-3 border rounded-lg'>
                    {answer?.selection?.find((o) => o.optionId === option.id)?.text}
                  </div>
                )}
            </div>
          );
        })}

      {isRatingQuestion(question) && (
        <RatingGroup
          className='max-w-fit'
          scale={ratingScaleToNumber(question.scale)}
          defaultValue={answer && isRatingAnswer(answer) ? answer.value?.toString() : undefined}
          lowerLabel={question.lowerLabel?.[defaultLanguage]}
          upperLabel={question.upperLabel?.[defaultLanguage]}
          disabled
        />
      )}

      {answer ? (
        <>
          {isDateAnswer(answer) && <p>{answer.date ? format(answer.date, DateTimeFormat) : '-'}</p>}

          {isNumberAnswer(answer) && <p>{answer.value ?? '-'}</p>}

          {isTextAnswer(answer) && <div className='p-3 border rounded-lg'>{answer.text}</div>}
        </>
      ) : (
        <></>
      )}
      {(attachments.length > 0 || notes.length > 0) && (
        <ResponseExtraDataSection
          attachments={attachments}
          notes={notes}
          aggregateDisplay={false}
          submissionType={submissionType}
        />
      )}
    </div>
  );
}
