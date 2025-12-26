// lib/stomp/subscriptions.ts
import type { StompSubscription } from '@stomp/stompjs';
import { stompClient } from './client';
import { whenConnected } from './ready';

export function subscribe<T>(
  destination: string,
  handler: (payload: T) => void
) {
  let sub: StompSubscription;

  const task = () => {
    sub?.unsubscribe();
    sub = stompClient.subscribe(destination, (msg) =>
      handler(JSON.parse(msg.body))
    );
  };

  whenConnected(task);

  return sub!;
}
