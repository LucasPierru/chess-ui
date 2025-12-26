// lib/stomp/ready.ts
import { stompClient } from './client';

type Task = () => void;

let queue: Task[] = [];

const persistentTasks = new Set<Task>();

export function whenConnected(task: Task, options: { persistent?: boolean } = {}) {
  const { persistent = false } = options;

  if (persistent) {
    persistentTasks.add(task);
  }

  if (stompClient.connected) {
    task();
  } else {
    queue.push(task);
  }
}

function flush() {
  queue.forEach((task) => task());
  queue = [];
}

let hooked = false;

export function hookReadyLifecycle() {
  if (hooked) return;
  hooked = true;

  stompClient.onConnect = () => {
    console.log('[STOMP] connected');
    flush();
    persistentTasks.forEach((task) => task());
  };

  stompClient.onDisconnect = () => {
    console.log('[STOMP] disconnected');
  };
}
