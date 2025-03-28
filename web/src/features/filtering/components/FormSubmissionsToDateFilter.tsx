import { DateTimeFilter } from '@/features/filtering/components/DateTimeFilter';
import { FILTER_KEY } from '@/features/filtering/filtering-enums';
import { useFilteringContainer } from '@/features/filtering/hooks/useFilteringContainer';
import { FC, useMemo } from 'react';

export const FormSubmissionsToDateFilter: FC = () => {
  const { queryParams, navigateHandler } = useFilteringContainer();

  const onChange = (value: Date | undefined) => {
    navigateHandler({ [FILTER_KEY.ToDate]: value });
  };

  var value = useMemo(() => {
    const paramsDate = (queryParams as any)[FILTER_KEY.ToDate];
    return paramsDate;
  }, [queryParams]);

  return (
    <div className=''>
      <DateTimeFilter value={value} onChange={onChange} placeholder='To date' granularity='minute' />
    </div>
  );
};
