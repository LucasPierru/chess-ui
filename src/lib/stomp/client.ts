import { Client } from '@stomp/stompjs';

export const stompClient = new Client({
  brokerURL: 'ws://localhost:8080/ws',
  reconnectDelay: 5000,
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
  debug: (str: string) => console.log("[STOMP]", str),
});