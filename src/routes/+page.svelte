<script lang="ts">
  import { Button } from '@/components/ui/button';
  import { Repeat2 } from '@lucide/svelte';
  import { onDestroy, onMount } from 'svelte';
  import { connect, disconnect } from '@/stomp';
  import ChallengeDialog from '@/components/challenge-dialog/challenge-dialog.svelte';
  import { getFEN, getLegalMoves } from '@/wasm/chess-engine';
  import { Color, translateFen } from '@/index';
  import Board from '@/components/board/board.svelte';

  let boardFen = $state('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  let boardVersion = $state(0);
  let playerColor: Color = $state(Color.WHITE);
  let board: string[][] = $derived(translateFen(boardFen, playerColor));

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

  const handleBoardChange = (newFen: string) => {
    boardFen = newFen;
    boardVersion += 1;
  };

  onMount(() => {
    boardFen = getFEN();
    /* console.log(getFEN());
    console.log(getLegalMoves('e2')); */
    connect();
  });

  onDestroy(() => {
    disconnect();
  });
</script>

<svelte:head>
  <title>Chess - Play Chess Online</title>
  <meta name="description" content="Play the classic game of chess against a computer opponent." />
</svelte:head>

{#key boardVersion}
  <div class="flex flex-col md:flex-row items-center justify-center gap-4 max-w-5xl mx-auto">
    <div></div>
    <div class="flex flex-col items-center gap-4">
      <Board color={Color.WHITE} {board} onBoardChange={handleBoardChange} />
      <!-- <div
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
    </div> -->
      <ChallengeDialog />
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
{/key}
