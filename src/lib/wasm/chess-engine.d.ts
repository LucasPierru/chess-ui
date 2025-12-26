// chess-engine.d.ts
export function playMove(
  from: string,
  to: string
): boolean;

export function getLegalMoves(
  square: string
): string[];

export function getFEN(): string;
