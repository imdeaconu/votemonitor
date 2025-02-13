import { WsClientSingleton } from '@/common/ws-client';
import Pusher, { Channel } from 'pusher-js';
import { useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';

type ChatMessage = {
  userId: string;
  text: string;
};

export const useElectionLiveChat = (electionRoundId: string) => {
  const [chatUserId] = useState(v4());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsClient = useRef<Pusher | undefined>();
  const channel = useRef<Channel | undefined>();
  useEffect(() => {
    wsClient.current = WsClientSingleton.getInstance();

    wsClient.current.connection.bind('connected', () => {
      console.log('Connected to Soketi via PusherJS!');
    });

    wsClient.current.connection.bind('error', (error:Error) => {
      console.error(error);
    });

    channel.current = wsClient.current.subscribe(electionRoundId);

    channel.current.bind('client-message', (text: string) => {
      setMessages((crtMsg) => [...crtMsg, { userId: chatUserId, text }]);
    });

    return () => {
      channel.current?.unbind('client-message');
      wsClient.current?.unsubscribe(electionRoundId);
    };
  }, [electionRoundId]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  const sendMessage = (text: string) => {
    const newMessage: ChatMessage = { userId: chatUserId, text };

    try {
      channel.current?.trigger('client-message', text);
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.log(error);
    }
  };

  return { channel, chatUserId, messages, sendMessage };
};
