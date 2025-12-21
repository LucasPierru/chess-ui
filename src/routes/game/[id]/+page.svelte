<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Client, Subscription } from "stompjs";
  import store from "$lib/stores/playerStore";
  import { initializeStompClient } from "$lib/stores/stompClientStore";
  import { translateFen, Color } from "$lib";
  import { Clipboard, LoaderCircle } from "@lucide/svelte";
  import Button from "@/components/ui/button/button.svelte";
  import { toast } from "svelte-sonner";
  import Board from "@/components/board/board.svelte";

  let { data } = $props();
  let boardFen = $state("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  let boardVersion = $state(0);
  let playerColor: Color = $state(Color.WHITE);
  let isPlayer = false;
  let isReady = false;

  let board: string[][] = $derived(translateFen(boardFen, playerColor));
  let sideToMove: Color = $derived(boardFen.split(" ")[1] === "w" ? Color.WHITE : Color.BLACK);
  let socket: WebSocket;
  let stompClient: Client | null = null;
  let subscriptions: Subscription[] = [];
  let currentRoom: string;
  let numberOfPlayers = $state(0);
  let numberOfSpectators = $state(0);
  let currentUrl = "";

  const playerId = $store;

  onMount(async () => {
    currentRoom = data.id;
    socket = new WebSocket("ws://localhost:8080/ws");
    stompClient = await initializeStompClient(socket);
    connectWebSocket();
    currentUrl = window.location.href;
  });

  function connectWebSocket() {
    stompClient!.connect({ playerId }, function (frame) {
      subscriptions.push(
        stompClient!.subscribe(`/user/queue/game/init`, function (messageOutput) {
          const body = JSON.parse(messageOutput.body);
          console.log({ body });
          boardFen = body.fen;
          boardVersion = boardVersion + 1;
          playerColor = body.color;
          isPlayer = body.isPlayer;
          isReady = true;
          numberOfPlayers = body.numberOfPlayers;
          numberOfSpectators = body.numberOfSpectators;
        })
      );

      // Client subscribes to the '1' room
      subscriptions.push(
        stompClient!.subscribe(`/topic/game/fen/${data.id}`, function (messageOutput) {
          const body = JSON.parse(messageOutput.body);
          if (body.messageType == "MOVE_REJECTED") {
            boardFen = boardFen;
            boardVersion = boardVersion + 1;
          } else {
            boardFen = body.fen;
            boardVersion = boardVersion + 1;
          }
        })
      );

      subscriptions.push(
        stompClient!.subscribe(`/user/topic/game/fen/${data.id}`, function (messageOutput) {
          const body = JSON.parse(messageOutput.body);
          if (body.messageType == "MOVE_REJECTED") {
            boardFen = boardFen;
            boardVersion = boardVersion + 1;
          } else {
            boardFen = body.fen;
            boardVersion = boardVersion + 1;
          }
        })
      );

      initBoard();
    });

    stompClient!.debug = function (str) {
      console.log(`[STOMP ${currentRoom}]`, str);
    };
  }

  function initBoard() {
    if (stompClient) {
      stompClient.send(`/app/game/init/${data.id}`);
    }
  }

  function disconnect() {
    if (subscriptions.length > 0) {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      subscriptions = [];
    }

    if (stompClient && stompClient.connected) {
      stompClient.disconnect(function () {
        console.log("Disconnected");
      });
    }
  }

  onDestroy(() => {
    disconnect();
  });

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.content} />
</svelte:head>

{#key boardVersion}
  <div class="flex flex-col items-center gap-4">
    <div class="flex flex-row gap-4 items-center justify-center w-full">
      <div class="flex-1"></div>
      {#if numberOfPlayers > 1}
        <Board color={playerColor} {board} roomId={data.id} />
      {/if}
      <div class={`flex-1`}>
        <span
          class={`block w-fit text-center p-4 font-semibold text-lg rounded-lg border border-border shadow-md ${sideToMove === "WHITE" ? "bg-white text-black" : "bg-black text-white"}`}
        >
          {sideToMove === "WHITE" ? "White to move" : "Black to move"}
        </span>
      </div>
    </div>
    {#if numberOfPlayers <= 1}
      <span class="text-lg">Share this link to invite an opponent</span>
      <div class="flex items-center gap-4 border border-primary p-2 rounded-xl">
        <span>{currentUrl}</span>
        <Button onclick={copyToClipboard} size="icon"><Clipboard /></Button>
      </div>
      <div class="flex gap-2 items-center">
        <LoaderCircle class="animate-spin" />
        <h2 class="text-lg">Waiting for opponent to join</h2>
      </div>
    {/if}
    <span>Players: {numberOfPlayers} | Spectators: {numberOfSpectators}</span>
  </div>
{/key}

<style lang="postcss">
  @reference "tailwindcss";
</style>
