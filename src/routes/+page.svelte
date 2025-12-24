<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '@/components/ui/button';
  import { ChessKingIcon, CircleQuestionMark, Repeat2 } from '@lucide/svelte';
  import { buttonVariants } from '@/components/ui/button';
  import * as Dialog from '@/components/ui/dialog';
  import Slider from '@/components/ui/slider/slider.svelte';
  import Label from '@/components/ui/label/label.svelte';
  import { Color } from '@/index';
  import { onMount } from 'svelte';
  import store from '@/stores/playerStore';
  import { initializeStompClient } from '@/stores/stompClientStore';
  import type { Client, Frame } from '@stomp/stompjs';
  import Board from '@/components/board/board.svelte';

  let minutes = $state(5);
  let increment = $state(3);
  let color: Color | null = $state(null);
  let playerId: string;
  let stompClient: Client | null = null;
  let board: string[][] = $state(
    [
      ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
      ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
      ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
    ].reverse(),
  );

  const flipBoard = () => {
    board = board
      .slice()
      .reverse()
      .map((row) => row.slice().reverse());
    const box = document.getElementById('flip-board-icon');

    if (box?.classList.contains('rotate-180')) {
      box.classList.remove('rotate-180');
    } else {
      box!.classList.add('rotate-180');
    }
  };

  onMount(() => {
    playerId = $store;

    if (!playerId) {
      console.error('playerId missing — aborting WS connect');
      return;
    }

    connectWebSocket();
  });

  function connectWebSocket() {
    stompClient = initializeStompClient(playerId);
    stompClient.onConnect = (frame: Frame) => {
      onConnected(frame);
    };

    stompClient.activate();

    stompClient.debug = (str) => {
      console.log(`[STOMP]`, str);
    };
  }

  function onConnected(frame: Frame) {
    console.log('Connected: ' + frame);
  }

  function createChallenge() {
    const roomId = crypto.randomUUID();
    stompClient!.publish({
      destination: `/app/game/create/${roomId}`,
      body: JSON.stringify({ minutes, increment, color }),
    });
    goto(`/game/${roomId}`);
  }
</script>

<div class="flex flex-col md:flex-row items-center justify-center gap-4 max-w-5xl mx-auto">
  <div></div>
  <!-- <Board color={Color.WHITE} {board} roomId={'null'} /> -->
  <div class="flex flex-col items-center gap-4">
    <div
      class="w-[min(100vw-2rem,100vh-8rem,768px)] aspect-square grow relative border-2 border-primary rounded-md"
    >
      <svg viewBox="0 0 768 768" class="">
        {#each board as row, rowIndex}
          {#each row as _, colIndex}
            <rect
              x={colIndex * 96}
              y={rowIndex * 96}
              width="96"
              height="96"
              fill={(rowIndex + colIndex) % 2 === 0 ? 'var(--white-square)' : 'var(--black-square)'}
            />
          {/each}
        {/each}
      </svg>
      {#each board as row, rowIndex}
        {#each row as cell, colIndex}
          {#if cell}
            <div
              class="w-1/8 aspect-square absolute bg-contain bg-no-repeat overflow-hidden top-0 left-0 cursor-grab touch-none will-change-transform"
              style="transform: translate({colIndex * 100}%, {rowIndex *
                100}%); background-image: url('/pieces/{cell}.png');"
              draggable="true"
            ></div>
          {/if}
        {/each}
      {/each}
    </div>
    <Dialog.Root>
      <Dialog.Trigger
        class={buttonVariants({ variant: 'default', size: 'lg' }) + ' font-semibold! text-lg!'}
      >
        Challenge somebody
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Send a challenge to a friend</Dialog.Title>
        </Dialog.Header>
        <div class="flex flex-col items-center gap-4 mt-4">
          <div class="w-full">
            <Label class="text-lg mb-2">{minutes} minutes</Label>
            <Slider type="single" min={1} max={180} step={1} bind:value={minutes} />
          </div>
          <div class="w-full">
            <Label class="text-lg mb-2">Increment: {increment} seconds</Label>
            <Slider type="single" min={0} max={60} step={1} bind:value={increment} />
          </div>
          <div>
            <Button
              size="icon-lg"
              variant={color === Color.BLACK ? 'default' : 'outline'}
              onclick={() => (color = Color.BLACK)}
              ><ChessKingIcon class="w-8 h-8 text-(--black-square)" /></Button
            >
            <Button
              size="icon-lg"
              variant={color === null ? 'default' : 'outline'}
              onclick={() => (color = null)}
            >
              <CircleQuestionMark class="w-8 h-8 text-white" />
            </Button>
            <Button
              size="icon-lg"
              variant={color === Color.WHITE ? 'default' : 'outline'}
              onclick={() => (color = Color.WHITE)}
            >
              <ChessKingIcon class="w-8 h-8 text-(--white-square)" />
            </Button>
          </div>
        </div>
        <Dialog.Footer>
          <Button onclick={createChallenge} size="lg" class="font-semibold">Send challenge</Button>
          <Dialog.Close
            class={buttonVariants({ variant: 'outline', size: 'lg' }) + ' font-semibold!'}
          >
            Close
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  </div>
  <Button
    onclick={flipBoard}
    size="icon-lg"
    variant="outline"
    class="mb-12 dark:hover:text-primary"
  >
    <Repeat2 class="w-8 h-8 transition-all" id="flip-board-icon" />
  </Button>
</div>
