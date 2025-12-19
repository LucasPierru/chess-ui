<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Client } from 'stompjs';

  export const ssr = false;

  const board: string[][] = [
    ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
    ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
    ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
  ];
  let socket: WebSocket;
  let stompClient: Client;

  onMount(async() => {
    initializeDragAndDrop();
    const Stomp = (await import('stompjs')).default;
    socket = new WebSocket("ws://localhost:8080/ws");
    stompClient = Stomp.over(socket);
    connectWebSocket();
  });

  function roundToNearestHundred(num: number): number {
    return Math.round(num / 100) * 100;
  }

  function initializeDragAndDrop() {
    let selectedElement: HTMLDivElement | null = null;
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    const svg = document.getElementsByClassName('piece') as HTMLCollectionOf<HTMLDivElement>;

    function startDrag(event: MouseEvent) {
      const target = event.target as HTMLDivElement;
      if(target.classList.contains('piece')) {
        selectedElement = target;
        selectedElement.style.zIndex = '2';
        selectedElement.style.cursor = 'grabbing';
        const boundingRect = target.getBoundingClientRect();
        // Calculate the offset between mouse position and element position
        offset = {
          x: (boundingRect.height/2 + 8),
          y: (boundingRect.width/2 + 8)
        };
        const xPercent = 100 * (event.clientX - offset.x) / 96;  
        const yPercent = 100 * (event.clientY - offset.y) / 96; 
        event.preventDefault();
        selectedElement.style.transform = `translate(${xPercent}%, ${yPercent}%)`;
        selectedElement.addEventListener('mousemove', drag);
        selectedElement.addEventListener('mouseup', endDrag);
        isDragging = true;
      }
    }

    function drag(event: MouseEvent) {
      if (selectedElement && isDragging) {
        event.preventDefault();
        const xPercent = 100 * (event.clientX - offset.x) / 96;  
        const yPercent = 100 * (event.clientY - offset.y) / 96; 
        selectedElement.style.transform = `translate(${xPercent}%, ${yPercent}%)`;
      }
    }

    function endDrag(event: MouseEvent) {
      if (isDragging && selectedElement) {
        // Restore appearance
        isDragging = false;
        const xPercent = 100 * (event.clientX - offset.x) / 96;  
        const yPercent = 100 * (event.clientY - offset.y) / 96; 
        selectedElement.style.transform = `translate(${roundToNearestHundred(xPercent)}%, ${roundToNearestHundred(yPercent)}%)`;
        sendMessage("e2", "e4");
        // Remove the global listeners
        selectedElement.removeEventListener('mousemove', drag);
        selectedElement.removeEventListener('mouseup', endDrag);
        selectedElement.style.zIndex = '1';
        selectedElement.style.cursor = 'grab';
        selectedElement = null;
      }
    }

    for (let i = 0; i < svg.length; i++) {
      svg[i].addEventListener('mousedown', startDrag);
    }
  }

  function connectWebSocket() {
    stompClient.connect({}, function(frame) {
      console.log('Connected: ' + frame);
      
      // Client subscribes to the '1' room
      stompClient.subscribe('/topic/game/fen/1', function(messageOutput) {
      });
    
    });

    stompClient.debug = function (str) {
      console.log(str);
    };
  }

   onDestroy(() => {
      if (stompClient) {
        stompClient.disconnect(function() {
          console.log('Disconnected');
        });
      }
    });


  function sendMessage(from: string, to: string) {
    // Handle incoming message for the '1' room
    stompClient.send('/app/game/1', {}, JSON.stringify({'from': from, 'to': to}));
  }

</script>

<style>
  .static {
    cursor: not-allowed;
  }
  .draggable {
    cursor: grab;
  }
  .board {
    /* Reference the image placed in static/images/background.jpg */
    background-image: url('/board.png');
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
    left:0;
    overflow: hidden;
    touch-action: none;
    will-change: transform;
    cursor:grab
  }
</style>

<div class="board">
  {#each board as row, rowIndex}
    {#each row as cell, colIndex}
      {#if cell}
        <div class="piece" style="transform: translate({colIndex * 100}%, {rowIndex * 100}%);background-image: url('/pieces/{cell}.png');">
        </div>
      {/if}
    {/each}
  {/each}
</div>