<script lang="ts">
  import { goto } from "$app/navigation";
  import { Button } from "@/components/ui/button";
  import { Repeat2 } from "@lucide/svelte";

  function createChallenge() {
    goto(`/game/${crypto.randomUUID()}`);
  }

  let board: string[][] = $state(
    [
      ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
      ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
      ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
    ].reverse()
  );

  const flipBoard = () => {
    board = board
      .slice()
      .reverse()
      .map((row) => row.slice().reverse());
    const box = document.getElementById("flip-board-icon");

    if (box?.classList.contains("rotate-180")) {
      box.classList.remove("rotate-180");
    } else {
      box!.classList.add("rotate-180");
    }
  };
</script>

<div class="flex items-center justify-center gap-4">
  <div></div>
  <div class="flex flex-col items-center gap-4">
    <div class="relative border-2 border-primary rounded-md">
      <svg width="768" height="768" viewBox="0 0 768 768" class="rounded-sm">
        {#each board as row, rowIndex}
          {#each row as _, colIndex}
            <rect
              x={colIndex * 96}
              y={rowIndex * 96}
              width="96"
              height="96"
              fill={(rowIndex + colIndex) % 2 === 0 ? "var(--accent)" : "var(--secondary)"}
            />
          {/each}
        {/each}
      </svg>
      {#each board as row, rowIndex}
        {#each row as cell, colIndex}
          {#if cell}
            <div
              class="absolute top-0 left-0 w-24 h-24 bg-contain bg-no-repeat"
              style="transform: translate({colIndex * 100}%, {rowIndex *
                100}%); background-image: url('/pieces/{cell}.png');"
              draggable="true"
            ></div>
          {/if}
        {/each}
      {/each}
    </div>
    <Button onclick={createChallenge} size="lg" class="font-semibold text-lg">Challenge somebody</Button>
  </div>
  <Button onclick={flipBoard} size="icon-lg" variant="outline" class="mb-12 dark:hover:text-primary">
    <Repeat2 class="w-8 h-8 transition-all" id="flip-board-icon" />
  </Button>
</div>

<style>
</style>
