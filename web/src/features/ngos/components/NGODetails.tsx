import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PencilIcon } from '@heroicons/react/24/outline';

import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Route } from '@/routes/ngos/view.$ngoId.$tab';
import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';
import { NGO } from '../models/NGO';
import { NGOAdminsView } from './NGOAdmins';
import { NgoStatusBadge } from './NgoStatusBadges';
import { NgoBackButton } from './NgoExtraComponents';

interface NGODetailsProps {
  data: NGO;
}

export const NGODetailsView: FC<NGODetailsProps> = ({ data }) => {
  return (
    <Card className='w-[800px] pt-0'>
      <CardHeader className='flex gap-2 flex-column'>
        <div className='flex flex-row items-center justify-between'>
          <CardTitle className='text-xl'>Organization details</CardTitle>
          <Button
            //onClick={navigateToEdit}
            variant='ghost-primary'
            //</div>disabled={!monitoringObserver.isOwnObserver || electionRound?.status === ElectionRoundStatus.Archived}
          >
            <PencilIcon className='w-[18px] mr-2 text-purple-900' />
            <span className='text-base text-purple-900'>Edit</span>
          </Button>
        </div>
        <Separator />
      </CardHeader>
      <CardContent className='flex flex-col items-baseline gap-6'>
        <div className='flex flex-col gap-1'>
          <p className='font-bold text-gray-700'>Name</p>
          <p className='font-normal text-gray-900'>{data.name}</p>
        </div>

        <div className='flex flex-col gap-1'>
          <p className='font-bold text-gray-700'>Status</p>
          <NgoStatusBadge status={data.status} />
        </div>
      </CardContent>
    </Card>
  );
};

export const NGODetails: FC<NGODetailsProps> = ({ data }) => {
  const { tab } = Route.useParams();
  const navigate = useNavigate();

  function handleTabChange(tab: string): void {
    navigate({
      params(prev: any) {
        return { ...prev, tab };
      },
    });
  }
  return (
    <Layout title={`${data.name}`} backButton={<NgoBackButton />}>
      <Tabs defaultValue='details' value={tab} onValueChange={handleTabChange}>
        <TabsList className='grid grid-cols-3 bg-gray-200 w-[600px] mb-4'>
          <TabsTrigger value='details'>Organization details</TabsTrigger>
          <TabsTrigger value='admins'>Admin users</TabsTrigger>
        </TabsList>
        <TabsContent value='details'>
          <NGODetailsView data={data} />
        </TabsContent>
        <TabsContent value='admins'>
          <NGOAdminsView ngoId={data.id} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};