import { stompClient } from './client';
import { whenConnected } from './ready';

export function publish(destination: string, body: unknown) {
  whenConnected(() => {
    stompClient.publish({
      destination,
      body: JSON.stringify(body)
    });
  });
}