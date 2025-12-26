<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { StompSubscription as Subscription } from '@stomp/stompjs';
  import { connect, disconnect, subscribe, topics, publish } from '@/stomp';
  import {
    translateFen,
    Color,
    type WinnerGameResult,
    type DrawGameResult,
    type GameEnded,
    isGameEndedWithWinner,
    isGameEndedWithDraw,
  } from '$lib';
  import { Clipboard, LoaderCircle } from '@lucide/svelte';
  import Button from '@/components/ui/button/button.svelte';
  import { toast } from 'svelte-sonner';
  import Board from '@/components/board/board.svelte';
  import GameOverDialog from '@/components/game-over-dialog/game-over-dialog.svelte';

  let { data } = $props();
  let boardFen = $state('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  let boardVersion = $state(0);
  let playerColor: Color = $state(Color.WHITE);
  let isPlayer = false;

  let board: string[][] = $derived(translateFen(boardFen, playerColor));
  let sideToMove: Color = $derived(boardFen.split(' ')[1] === 'w' ? Color.WHITE : Color.BLACK);
  let subscriptions: Subscription[] = [];
  let numberOfPlayers = $state(0);
  let numberOfSpectators = $state(0);
  let currentUrl = $state('');
  let hasCopied = $state(false);
  let result: WinnerGameResult | DrawGameResult | null = $state(null);
  let winnerColor: Color | null = $state(null);

  const getGameEnded = (): GameEnded | null => {
    if (winnerColor !== null && isGameEndedWithWinner(result)) {
      return {
        result: result,
        winnerColor: winnerColor,
      };
    } else if (isGameEndedWithDraw(result)) {
      return {
        result: result as DrawGameResult,
        winnerColor: null,
      };
    } else {
      return null;
    }
  };

  const gameEnded: GameEnded | null = $derived(getGameEnded());

  onMount(() => {
    currentUrl = window.location.href;
    connect();
    createSubscriptions();
  });

  function createSubscriptions() {
    subscriptions.push(
      subscribe(topics.PLAYER_JOIN, (body: any) => {
        playerColor = body.color;
        isPlayer = body.isPlayer;
        numberOfPlayers = body.numberOfPlayers;
        numberOfSpectators = body.numberOfSpectators;
      }),
    );

    subscriptions.push(
      subscribe(topics.GAME_INIT(data.id), (body: any) => {
        boardFen = body.fen;
        boardVersion = boardVersion + 1;
        numberOfPlayers = body.numberOfPlayers;
        numberOfSpectators = body.numberOfSpectators;
      }),
    );

    subscriptions.push(
      subscribe(topics.GAME_UPDATE(data.id), (body: any) => {
        if (body.messageType == 'MOVE_REJECTED') {
          boardFen = boardFen;
          boardVersion = boardVersion + 1;
          result = body.result;
          winnerColor = body.winnerColor;
        } else {
          boardFen = body.fen;
          boardVersion = boardVersion + 1;
          result = body.result;
          winnerColor = body.winnerColor;
        }
      }),
    );

    subscriptions.push(
      subscribe(topics.USER_GAME_UPDATE(data.id), (body: any) => {
        if (body.messageType == 'MOVE_REJECTED') {
          boardFen = boardFen;
          boardVersion = boardVersion + 1;
          result = body.result;
          winnerColor = body.winnerColor;
        } else {
          boardFen = body.fen;
          boardVersion = boardVersion + 1;
          result = body.result;
          winnerColor = body.winnerColor;
        }
      }),
    );

    initBoard();
  }

  function initBoard() {
    publish(`/app/game/join/${data.id}`, {});
  }

  function disconnectClient() {
    if (subscriptions.length > 0) {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      subscriptions = [];
    }
    disconnect();
  }

  onDestroy(() => {
    disconnectClient();
  });

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(currentUrl);
      hasCopied = true;
      toast('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.content} />
</svelte:head>

{#key boardVersion}
  <div class="flex flex-col items-center gap-4">
    <div class="flex flex-col lg:flex-row gap-4 items-center justify-center w-full">
      <div class="flex-1"></div>
      {#if numberOfPlayers > 1}
        <Board color={playerColor} {board} roomId={data.id} />
        <div class="flex-1">
          <span
            class={`block w-fit text-center p-4 font-semibold text-lg rounded-lg border border-border shadow-md ${sideToMove === 'WHITE' ? 'bg-white text-black' : 'bg-black text-white'}`}
          >
            {sideToMove === 'WHITE' ? 'White to move' : 'Black to move'}
          </span>
        </div>
      {/if}
    </div>
    {#if numberOfPlayers <= 1}
      <span class="text-lg">Share this link to invite an opponent</span>
      <div class="flex items-center gap-4 border border-primary p-2 rounded-xl">
        <span>{currentUrl}</span>
        <Button onclick={copyToClipboard} size="icon" variant={hasCopied ? 'secondary' : 'default'}
          ><Clipboard /></Button
        >
      </div>
      <div class="flex gap-2 items-center">
        <LoaderCircle class="animate-spin" />
        <h2 class="text-lg">Waiting for opponent to join</h2>
      </div>
    {/if}
    <span>Players: {numberOfPlayers} | Spectators: {numberOfSpectators}</span>
  </div>
  {#if gameEnded !== null}
    <GameOverDialog isGameOver={gameEnded !== null} {gameEnded} />
  {/if}
{/key}

<style lang="postcss">
  @reference "tailwindcss";
</style>
