import { authApi } from '@/common/auth-api';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import TagsSelectFormField from '@/components/ui/tag-selector';
import { useToast } from '@/components/ui/use-toast';
import { useCurrentElectionRoundStore } from '@/context/election-round.store';
import { useMonitoringObserversTags } from '@/hooks/tags-queries';
import { Route, monitoringObserverDetailsQueryOptions } from '@/routes/monitoring-observers/edit.$monitoringObserverId';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { monitoringObserversKeys } from '../../hooks/monitoring-observers-queries';
import { targetedObserversKeys } from '../../hooks/push-messages-queries';
import { MonitoringObserverStatus, UpdateMonitoringObserverRequest } from '../../models/monitoring-observer';
import { MonitorObserverBackButton } from '../MonitoringObserverBackButton';

export default function EditObserver() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentElectionRoundId = useCurrentElectionRoundStore((s) => s.currentElectionRoundId);

  const { monitoringObserverId } = Route.useParams();
  const monitoringObserverQuery = useSuspenseQuery(
    monitoringObserverDetailsQueryOptions(currentElectionRoundId, monitoringObserverId)
  );
  const monitoringObserver = monitoringObserverQuery.data;

  const { data: availableTags } = useMonitoringObserversTags(currentElectionRoundId);

  const { toast } = useToast();

  const editObserverFormSchema = z.object({
    status: z.string(),
    tags: z.any(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string().optional().catch(''),
  });

  const form = useForm<z.infer<typeof editObserverFormSchema>>({
    resolver: zodResolver(editObserverFormSchema),
    mode: 'all',
    defaultValues: {
      status: monitoringObserver.status,
      tags: monitoringObserver.tags,
      firstName: monitoringObserver.firstName,
      lastName: monitoringObserver.lastName,
      phoneNumber: monitoringObserver.phoneNumber,
    },
  });

  function onSubmit(values: z.infer<typeof editObserverFormSchema>) {
    const request: UpdateMonitoringObserverRequest = {
      tags: values.tags,
      status: values.status,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber ?? '',
    };

    editMutation.mutate({ electionRoundId: currentElectionRoundId, request });
  }

  const editMutation = useMutation({
    mutationFn: ({
      electionRoundId,
      request,
    }: {
      electionRoundId: string;
      request: UpdateMonitoringObserverRequest;
    }) => {
      return authApi.post<void>(
        `/election-rounds/${electionRoundId}/monitoring-observers/${monitoringObserver.id}`,
        request
      );
    },
    onSuccess: (_, { electionRoundId }) => {
      toast({
        title: 'Success',
        description: 'Observer successfully updated',
      });
      router.invalidate();
      queryClient.invalidateQueries({ queryKey: monitoringObserversKeys.all(electionRoundId) });
      queryClient.invalidateQueries({ queryKey: targetedObserversKeys.all(electionRoundId) });

      navigate({
        to: '/monitoring-observers/view/$monitoringObserverId/$tab',
        params: { monitoringObserverId: monitoringObserver.id, tab: 'details' },
      });
    },
  });

  return (
    <Layout title={`Edit ${monitoringObserver.displayName}`} backButton={<MonitorObserverBackButton />}>
      <Card className='w-[800px] pt-0'>
        <CardHeader className='flex gap-2 flex-column'>
          <div className='flex flex-row items-center justify-between'>
            <CardTitle className='text-xl'>Edit observer</CardTitle>
          </div>
          <Separator />
        </CardHeader>
        <CardContent className='flex flex-col items-baseline gap-6'>
          <div className='flex flex-col gap-1'>
            <p className='font-bold text-gray-700'>Email</p>
            <p className='font-normal text-gray-900'>{monitoringObserver.email}</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className='text-left'>First name</FormLabel>
                    <FormControl>
                      <Input {...field} {...fieldState} disabled={!monitoringObserver.isOwnObserver} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field, fieldState }) => (
                  <FormItem className='w-[540px]'>
                    <FormLabel className='text-left'>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} {...fieldState} disabled={!monitoringObserver.isOwnObserver} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className='text-left'>Phone number</FormLabel>
                    <FormControl>
                      <Input {...field} {...fieldState} disabled={!monitoringObserver.isOwnObserver} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-left'>Tags</FormLabel>
                    <FormControl>
                      <TagsSelectFormField
                        options={availableTags?.filter((tag) => !field.value.includes(tag)) ?? []}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Observer tags'
                        disabled={!monitoringObserver.isOwnObserver}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='w-[540px]'>
                    <FormLabel>
                      Status <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={field.value === MonitoringObserverStatus.Pending}>
                        <SelectTrigger>
                          <SelectValue placeholder='Observer status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value='Active'>Active</SelectItem>
                            <SelectItem value='Suspended'>Suspended</SelectItem>
                            <SelectItem value='Pending' disabled={true}>
                              Pending
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className='mt-2' />
                  </FormItem>
                )}
              />

              <div className='flex justify-between'>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    type='button'
                    onClick={() => {
                      navigate({
                        to: '/monitoring-observers/view/$monitoringObserverId/$tab',
                        params: { monitoringObserverId: monitoringObserver.id, tab: 'details' },
                      });
                    }}>
                    Cancel
                  </Button>
                  <Button type='submit' className='px-6' disabled={!monitoringObserver.isOwnObserver}>
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Layout>
  );
}
