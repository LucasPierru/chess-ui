// src/lib/stores/persistentStore.js
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const initialValue = browser ? localStorage.getItem("playerId") ?? crypto.randomUUID() : crypto.randomUUID();

const store = writable(initialValue);

// Subscribe to store changes and update localStorage
store.subscribe((value) => {
  if (browser) {
    localStorage.setItem("playerId", value as string);
  }
});

export default store;
