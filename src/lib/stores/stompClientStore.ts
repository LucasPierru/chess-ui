import { writable } from 'svelte/store';
import { Client } from '@stomp/stompjs';
import { WebSocket } from 'ws';

Object.assign(global, { WebSocket });

export const stompClient = writable<Client | null>(null);

export function initializeStompClient(playerId: string): Client {
  const client = new Client({
    brokerURL: 'ws://localhost:8080/ws',
    connectHeaders: {
      playerId
    },
    debug: str => console.log("[STOMP]", str),
    reconnectDelay: 0,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0
  });
  stompClient.set(client);
  return client;
}