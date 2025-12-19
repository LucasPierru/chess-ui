import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export function load({ params }: { params: { id: string } }) {
  return {
    title: 'Chess',
    content: 'Play the classic game of chess against a computer opponent.',
    id: params.id
  };


  //error(404, 'Not found');
}