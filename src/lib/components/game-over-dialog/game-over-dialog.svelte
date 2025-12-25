<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import type { GameEnded } from '$lib';

  let {
    isGameOver,
    gameEnded,
  }: {
    isGameOver: boolean;
    gameEnded: GameEnded | null;
  } = $props();

  // Type-safe helpers to determine the result type
  const hasWinner = $derived(
    gameEnded ? 'winnerColor' in gameEnded && gameEnded.winnerColor !== null : false,
  );
  const isDraw = $derived(
    gameEnded ? 'winnerColor' in gameEnded && gameEnded.winnerColor === null : false,
  );

  // Get title and description based on game result
  const title = $derived(gameEnded ? getGameResultTitle(gameEnded) : '');
  const description = $derived(gameEnded ? getGameResultDescription(gameEnded) : '');

  function getGameResultTitle(gameEnded: GameEnded): string {
    if (hasWinner) {
      const winnerResult = gameEnded as Extract<GameEnded, { winnerColor: any }>;
      return `${winnerResult.winnerColor} wins!`;
    } else {
      return 'Draw!';
    }
  }

  function getGameResultDescription(gameEnded: GameEnded): string {
    switch (gameEnded.result) {
      case 'RESIGNATION':
        return 'Game ended by resignation';
      case 'CHECKMATE':
        return 'Game ended by checkmate';
      case 'TIMEOUT':
        return 'Game ended by timeout';
      case 'STALEMATE':
        return 'Game ended in stalemate - no legal moves available';
      case 'DRAW_AGREEMENT':
        return 'Players agreed to a draw';
      case 'DRAW_INSUFFICIENT_MATERIAL':
        return 'Draw by insufficient material';
      case 'DRAW_FIFTY_MOVE_RULE':
        return 'Draw by fifty-move rule';
      case 'DRAW_THREEFOLD_REPETITION':
        return 'Draw by threefold repetition';
      default:
        return 'Game ended';
    }
  }
</script>

<Dialog.Root open={isGameOver}>
  <Dialog.Content class="w-fit">
    <Dialog.Header class="items-center">
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>
        {description}
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button onclick={() => {}} size="lg" variant="secondary" class="font-semibold w-1/2"
        >New Challenge</Button
      >
      <Button onclick={() => {}} size="lg" variant="secondary" class="font-semibold w-1/2"
        >Rematch</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
