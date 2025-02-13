import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { type FunctionComponent } from '@/common/types';
import { Input } from '@/components/ui/input';
import { useCurrentElectionRoundStore } from '@/context/election-round.store';
import { FC } from 'react';
import { useElectionLiveChat } from './useElectionLiveChat';

interface ChatMessageProps {
  userId: string;
  text: string;
}

const ChatMssageComponent: FC<ChatMessageProps> = ({ userId, text }) => {
  return (
    <div>
      <div className='flex items-start gap-2.5'>
        <div className='flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700'>
          <div className='flex items-center space-x-2 rtl:space-x-reverse'>
            <span className='text-sm font-semibold text-gray-900 dark:text-white'>{userId}</span>
          </div>
          <p className='text-sm font-normal py-2.5 text-gray-900 dark:text-white'>{text}</p>
          <span className='text-sm font-normal text-gray-500 dark:text-gray-400'>Delivered</span>
        </div>
      </div>
    </div>
  );
};

function LiveChat(): FunctionComponent {
  const currentElectionRoundId = useCurrentElectionRoundStore((s) => s.currentElectionRoundId);
  const { chatUserId, messages, sendMessage } = useElectionLiveChat(currentElectionRoundId);

  const handleInputKeyDown = (event: any) => {
    if (event.key !== 'Enter') return;

    sendMessage(event.target.value);
    event.currentTarget.value = '';
  };
  return (
    <Card className='w-full pt-0'>
      <CardHeader className='flex flex-column gap-2'>
        <div className='flex flex-row justify-between items-center pr-6'>
          <CardTitle className='text-2xl font-semibold leading-none tracking-tight'>Live chat</CardTitle>
          <div className='table-actions flex flex-row-reverse flex-row- gap-4'></div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        <p>Your user id for this chat is: {chatUserId}</p>
        {messages.map((m) => (
          <ChatMssageComponent userId={m.userId} text={m.text} />
        ))}
        <Input onKeyDown={handleInputKeyDown} />
      </CardContent>
    </Card>
  );
}

export default LiveChat;
