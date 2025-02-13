import Pusher from 'pusher-js';

export class WsClientSingleton {
  private static instance: Pusher;
  private constructor() {}

  public static getInstance(): Pusher {
    if (!WsClientSingleton.instance) {
      WsClientSingleton.instance = new Pusher('app-key', {
        wsHost: '127.0.0.1', // Soketi server
        wsPort: 6001,
        wssPort: 6001,
        forceTLS: false, // Disable TLS for local development
        disableStats: true,
        cluster: 'mt1', // Required but ignored by Soketi
        enabledTransports: ['ws', 'wss'],
      });
    }
    return WsClientSingleton.instance;
  }
}
