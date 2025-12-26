<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import ThemeToggle from '@/components/ui/theme-toggle';
  import { Toaster } from '$lib/components/ui/sonner/index';
  import { initStomp } from '@/stomp';

  let { children } = $props();
  initStomp();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<Toaster position="bottom-right" />
<ModeWatcher />
<div class="min-h-screen flex flex-col">
  <nav class="p-4 shadow-md flex justify-between items-center">
    <a href="/" class="text-2xl font-semibold">Chess</a>
    <div class="flex items-center gap-4"></div>
    <ThemeToggle />
  </nav>
  <main class="grow container mx-auto p-4">
    {@render children()}
  </main>
</div>

<style></style>
