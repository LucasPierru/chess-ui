import { writable } from 'svelte/store';
import type { Client } from 'stompjs';

export const stompClient = writable<Client | null>(null);

export async function initializeStompClient(socket: WebSocket) {
  const Stomp = (await import("stompjs")).default;
  const client = Stomp.over(socket);
  stompClient.set(client);
  return client;
}