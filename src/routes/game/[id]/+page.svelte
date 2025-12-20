<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Client, Subscription } from "stompjs";
  import store from "$lib/stores/playerStore.js";
  import { translateFen, Color } from "$lib";

  let { data } = $props();
  let boardFen = $state("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  let boardVersion = $state(0);
  let playerColor: Color | null = null;
  let isPlayer = false;
  let isReady = false;

  const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];

  let board: string[][] = $derived(translateFen(boardFen, Color.WHITE));
  let socket: WebSocket;
  let stompClient: Client | null = null;
  let subscription: Subscription | null = null;
  let currentRoom: string;

  const playerId = $store;

  onMount(async () => {
    const Stomp = (await import("stompjs")).default;
    currentRoom = data.id;
    socket = new WebSocket("ws://localhost:8080/ws");
    stompClient = Stomp.over(socket);
    connectWebSocket();
  });

  function roundToNearestHundred(num: number): number {
    return Math.round(num / 100) * 100;
  }

  let selectedElement: HTMLDivElement | null = null;
  let isDragging = false;
  let offset = { x: 0, y: 0 };
  let from = "";
  let to = "";

  function startDrag(event: MouseEvent) {
    if (!isReady) return;
    const target = event.target as HTMLDivElement;
    if (target.classList.contains("piece")) {
      selectedElement = target;
      selectedElement.style.zIndex = "2";
      selectedElement.style.cursor = "grabbing";
      const boundingRect = target.getBoundingClientRect();
      // Calculate the offset between mouse position and element position
      offset = {
        x: boundingRect.height / 2 + 8,
        y: boundingRect.width / 2 + 8,
      };
      const xPercent = (100 * (event.clientX - offset.x)) / 96;
      const yPercent = (100 * (event.clientY - offset.y)) / 96;
      from = letters[roundToNearestHundred(xPercent) / 100] + (7 - roundToNearestHundred(yPercent) / 100 + 1);
      event.preventDefault();
      selectedElement.style.transform = `translate(${xPercent}%, ${yPercent}%)`;
      selectedElement.addEventListener("mousemove", drag);
      selectedElement.addEventListener("mouseup", endDrag);
      isDragging = true;
    }
  }

  function drag(event: MouseEvent) {
    if (selectedElement && isDragging) {
      event.preventDefault();
      const xPercent = (100 * (event.clientX - offset.x)) / 96;
      const yPercent = (100 * (event.clientY - offset.y)) / 96;
      selectedElement.style.transform = `translate(${xPercent}%, ${yPercent}%)`;
    }
  }

  function endDrag(event: MouseEvent) {
    if (isDragging && selectedElement) {
      // Restore appearance
      isDragging = false;
      //selectedElement.style.transform = "";
      const xPercent = roundToNearestHundred((100 * (event.clientX - offset.x)) / 96);
      const yPercent = roundToNearestHundred((100 * (event.clientY - offset.y)) / 96);
      to = letters[roundToNearestHundred(xPercent) / 100] + (7 - roundToNearestHundred(yPercent) / 100 + 1);
      sendMessage(from, to);
      // Remove the global listeners
      selectedElement.removeEventListener("mousemove", drag);
      selectedElement.removeEventListener("mouseup", endDrag);
      selectedElement.style.zIndex = "1";
      selectedElement.style.cursor = "grab";
      selectedElement = null;
    }
  }

  function connectWebSocket() {
    stompClient!.connect({ playerId }, function (frame) {
      subscription = stompClient!.subscribe(`/user/queue/game/init`, function (messageOutput) {
        console.log("Received init message");
        const body = JSON.parse(messageOutput.body);
        boardFen = body.fen;
        boardVersion = boardVersion + 1;
        playerColor = body.playerColor;
        isPlayer = body.isPlayer;
        isReady = true;
      });

      // Client subscribes to the '1' room
      subscription = stompClient!.subscribe(`/topic/game/fen/${data.id}`, function (messageOutput) {
        const body = JSON.parse(messageOutput.body);
        if (body.messageType == "MOVE_REJECTED") {
          boardFen = boardFen;
          boardVersion = boardVersion + 1;
        } else {
          boardFen = body.fen;
          boardVersion = boardVersion + 1;
        }
      });

      subscription = stompClient!.subscribe(`/user/topic/game/fen/${data.id}`, function (messageOutput) {
        const body = JSON.parse(messageOutput.body);
        if (body.messageType == "MOVE_REJECTED") {
          boardFen = boardFen;
          boardVersion = boardVersion + 1;
        } else {
          boardFen = body.fen;
          boardVersion = boardVersion + 1;
        }
      });

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
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
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

  function sendMessage(from: string, to: string) {
    // Handle incoming message for the '1' room
    stompClient!.send(`/app/game/${data.id}`, {}, JSON.stringify({ from: from, to: to }));
  }
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.content} />
</svelte:head>

{#key boardVersion}
  <div class="board">
    {#each board as row, rowIndex}
      {#each row as cell, colIndex}
        {#if cell}
          <div
            class="piece"
            style="transform: translate({colIndex * 100}%, {rowIndex *
              100}%);background-image: url('/pieces/{cell}.png');"
            draggable="true"
            ondragstart={startDrag}
            role="button"
            tabindex={parseInt(`${rowIndex}${colIndex}`)}
          ></div>
        {/if}
      {/each}
    {/each}
  </div>
{/key}

<style>
  .static {
    cursor: not-allowed;
  }
  .draggable {
    cursor: grab;
  }
  .board {
    /* Reference the image placed in static/images/background.jpg */
    background-image: url("/board.png");
    background-size: 100%;
    contain: layout;
    height: 768px;
    width: 768px;
    position: relative;
  }

  .piece {
    background-size: 100%;
    width: 12.5%;
    height: 12.5%;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    touch-action: none;
    will-change: transform;
    cursor: grab;
  }
</style>
