import type { FunctionComponent } from '@/common/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  observerQuickReportsColumns,
  quickReportsColumnVisibilityOptions
} from '@/features/responses/utils/column-visibility-options';
import { Route } from '@/routes/monitoring-observers/view/$monitoringObserverId.$tab';
import { Cog8ToothIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '@uidotdev/usehooks';
import { useState, type ChangeEvent } from 'react';
import { MonitoringObserverQuickReportsFilters } from '../MonitoringObserverQuickReportsFilters/MonitoringObserverQuickReportsFilters';
import { MonitoringObserverQuickReportsTable } from '../MonitoringObserverQuickReportsTable/MonitoringObserverQuickReportsTable';

export function MonitoringObserverQuickReports(): FunctionComponent {
  const search = Route.useSearch();

  const [isFiltering, setIsFiltering] = useState(() => Object.keys(search).length !== 0);
  const [columnsVisibility, setColumnsVisibility] = useState(observerQuickReportsColumns);

  const [searchText, setSearchText] = useState<string>('');
  const debouncedSearchText = useDebounce(searchText, 300);

  const handleSearchInput = (ev: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(ev.currentTarget.value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All quick reports submitted by observer</CardTitle>

        <Separator />

        <div className='flex justify-end gap-4 px-6'>
          <Input className='max-w-md' onChange={handleSearchInput} placeholder='Search' />
          <FunnelIcon
            className='w-[20px] text-purple-900 cursor-pointer'
            fill={isFiltering ? '#5F288D' : 'rgba(0,0,0,0)'}
            onClick={() => {
              setIsFiltering((prev) => !prev);
            }}
          />

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Cog8ToothIcon className='w-[20px] text-purple-900 cursor-pointer' />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Table columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickReportsColumnVisibilityOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.id}
                  checked={columnsVisibility[option.id]}
                  disabled={!option.enableHiding}
                  onCheckedChange={(checked) => {
                    setColumnsVisibility((prev) => ({ ...prev, [option.id]: checked }));
                  }}>
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        {isFiltering && (
          <div className='grid items-center grid-cols-6 gap-4'>
            <MonitoringObserverQuickReportsFilters />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <MonitoringObserverQuickReportsTable columnsVisibility={columnsVisibility} searchText={debouncedSearchText} />
      </CardContent>
    </Card>
  );
}
