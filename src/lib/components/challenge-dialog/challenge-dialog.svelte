<script lang="ts">
  import * as Dialog from '../ui/dialog';
  import { Button, buttonVariants } from '../ui/button';
  import Slider from '../ui/slider/slider.svelte';
  import Label from '../ui/label/label.svelte';
  import { ChessKingIcon, CircleQuestionMark } from '@lucide/svelte';
  import { Color } from '$lib';
  import { goto } from '$app/navigation';
  import { stompClient as stompClientStore } from '$lib/stores/stompClientStore';

  let minutes = $state(5);
  let increment = $state(3);
  let color: Color | null = $state(null);
  const stompClient = $stompClientStore;

  function createChallenge() {
    const roomId = crypto.randomUUID();
    stompClient!.publish({
      destination: `/app/game/create/${roomId}`,
      body: JSON.stringify({ minutes, increment, color }),
    });
    goto(`/game/${roomId}`);
  }
</script>

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
      <Dialog.Close class={buttonVariants({ variant: 'outline', size: 'lg' }) + ' font-semibold!'}>
        Close
      </Dialog.Close>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
