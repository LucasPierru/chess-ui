<script lang="ts">
  import { Color, roundToNearestHundred } from '@/index';
  import { stompClient as stompClientStore } from '$lib/stores/stompClientStore';
  import { letters, getCoordinate } from '@/index';

  let { color, board, roomId }: { color: Color; board: string[][]; roomId: string } = $props();

  let selectedElement: HTMLDivElement | null = null;
  let isDragging = false;
  let offset = { x: 0, y: 0, width: 0, height: 0 };
  let from = '';
  let to = '';
  let coordinateSize = 14;
  const stompClient = $stompClientStore;
  let rightClickedSquares = $state({} as Record<string, boolean>);

  function startDrag(event: MouseEvent) {
    const target = event.target as HTMLDivElement;
    const board = document.querySelector('#board') as HTMLDivElement;
    if (target.id.startsWith('piece') && event.button === 0) {
      selectedElement = target;
      selectedElement.style.zIndex = '2';
      selectedElement.style.cursor = 'grabbing';
      const boundingRect = target.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      // Calculate the offset between mouse position and element position
      offset = {
        width: boundingRect.width,
        height: boundingRect.height,
        x: boundingRect.height / 2 + boardRect.left,
        y: boundingRect.width / 2 + boardRect.top,
      };
      const xPercent = (100 * (event.clientX - offset.x)) / boundingRect.width;
      const yPercent = (100 * (event.clientY - offset.y)) / boundingRect.height;

      const { col, row } = getCoordinate(color, xPercent, yPercent);

      from = letters[col] + row;

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
      const xPercent = (100 * (event.clientX - offset.x)) / offset.width;
      const yPercent = (100 * (event.clientY - offset.y)) / offset.height;
      selectedElement.style.transform = `translate(${xPercent}%, ${yPercent}%)`;
    }
  }

  function endDrag(event: MouseEvent) {
    if (isDragging && selectedElement) {
      // Restore appearance
      isDragging = false;
      //selectedElement.style.transform = "";
      const xPercent = roundToNearestHundred((100 * (event.clientX - offset.x)) / offset.width);
      const yPercent = roundToNearestHundred((100 * (event.clientY - offset.y)) / offset.height);
      const { col, row } = getCoordinate(color, xPercent, yPercent);
      to = letters[col] + row;
      sendMessage(from, to);
      // Remove the global listeners
      selectedElement.removeEventListener('mousemove', drag);
      selectedElement.removeEventListener('mouseup', endDrag);
      selectedElement.style.zIndex = '1';
      selectedElement.style.cursor = 'grab';
      selectedElement = null;
    }
  }

  function sendMessage(from: string, to: string) {
    // Handle incoming message for the '1' room
    stompClient!.publish({
      destination: `/app/game/${roomId}`,
      body: JSON.stringify({ from: from, to: to }),
    });
  }

  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();
    const target = event.target as HTMLDivElement;
    const board = document.querySelector('#board') as HTMLDivElement;

    const boundingRect = target.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    // Calculate the offset between mouse position and element position
    offset = {
      width: boundingRect.width,
      height: boundingRect.height,
      x: boundingRect.height / 2 + boardRect.left,
      y: boundingRect.width / 2 + boardRect.top,
    };
    const xPercent = (100 * (event.clientX - offset.x)) / boundingRect.width;
    const yPercent = (100 * (event.clientY - offset.y)) / boundingRect.height;
    const { col, row } = getColRow(color, getCoordinate(color, xPercent, yPercent));
    const squareKey = `${col},${row}`;
    if (rightClickedSquares[squareKey]) {
      rightClickedSquares[squareKey] = false;
    } else {
      rightClickedSquares[squareKey] = true;
    }
  }

  function resetHighlights(event: MouseEvent) {
    if (event.button === 0) {
      rightClickedSquares = {};
    }
  }

  function getColRow(
    color: Color,
    { col, row }: { col: number; row: number },
  ): { col: number; row: number } {
    return color === Color.WHITE ? { col, row: 8 - row } : { col: 7 - col, row: row - 1 };
  }
</script>

<div
  id="board"
  class="w-[min(100vw-2rem,100vh-8rem,768px)] aspect-square relative"
  oncontextmenu={handleContextMenu}
  onmousedown={resetHighlights}
  role="button"
  tabindex="0"
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
  <svg viewBox="0 0 768 768" class="absolute top-0 left-0 pointer-events-none">
    {#each board as row, rowIndex}
      {#each row as _, colIndex}
        {#if colIndex === 0}
          <text
            x={colIndex * 96 + coordinateSize / 2}
            y={rowIndex * 96 + coordinateSize}
            text-anchor="middle"
            dominant-baseline="central"
            font-size={coordinateSize}
            font-weight="bold"
            fill={rowIndex % 2 === 0 ? 'var(--black-square)' : 'var(--white-square)'}
          >
            {color === 'WHITE' ? 8 - rowIndex : rowIndex + 1}
          </text>
        {/if}
        {#if rowIndex === 7}
          <text
            x={(colIndex + 1) * 96 - coordinateSize}
            y={(rowIndex + 1) * 96 - coordinateSize}
            text-anchor="middle"
            dominant-baseline="central"
            font-size={coordinateSize}
            font-weight="bold"
            fill={colIndex % 2 === 0 ? 'var(--white-square)' : 'var(--black-square)'}
          >
            {color === 'WHITE' ? letters[colIndex] : letters[7 - colIndex]}
          </text>
        {/if}
      {/each}
    {/each}
  </svg>
  <svg viewBox="0 0 768 768" class="absolute top-0 left-0 pointer-events-none">
    {#each board as row, rowIndex}
      {#each row as _, colIndex}
        <text
          x={(colIndex + 1) * 96 - coordinateSize}
          y={(rowIndex + 1) * 96 - coordinateSize}
          text-anchor="middle"
          dominant-baseline="central"
          font-size={coordinateSize}
          font-weight="bold"
          fill={'#000'}
        >
        </text>
        {#if rightClickedSquares[`${colIndex},${rowIndex}`]}
          <rect
            x={colIndex * 96}
            y={rowIndex * 96}
            width="96"
            height="96"
            fill={'var(--accent)'}
            opacity="0.5"
          />
        {/if}
      {/each}
    {/each}
  </svg>
  {#each board as row, rowIndex}
    {#each row as cell, colIndex}
      {#if cell}
        <div
          id="piece-{rowIndex}{colIndex}"
          class="w-1/8 aspect-square absolute bg-contain bg-no-repeat overflow-hidden top-0 left-0 cursor-grab touch-none will-change-transform"
          style="transform: translate({colIndex * 100}%, {rowIndex *
            100}%);background-image: url('/pieces/{cell}.png');"
          draggable="true"
          onmousedown={startDrag}
          role="button"
          tabindex={parseInt(`${rowIndex}${colIndex}`)}
        ></div>
      {/if}
    {/each}
  {/each}
</div>

<style lang="postcss">
  @reference "tailwindcss";
</style>
