import { stompClient } from './client';
import { playerId } from '../stores/player';
import { get } from 'svelte/store';

export function connect() {
  const id = get(playerId)
  if (!id || stompClient.active) return;

  stompClient.connectHeaders = {
    playerId: id
  };

  /* stompClient.onConnect = () => {
    connected.set(true);
  };

  stompClient.onDisconnect = () => {
    connected.set(false);
  }; */

  stompClient.onStompError = (frame) => {
    console.error('Broker error:', frame.headers['message']);
  };

  stompClient.activate();
}

export function reconnect() {
  stompClient.deactivate().then(connect);
}

export function disconnect() {
  stompClient.deactivate();
}