export enum Color {
  WHITE = 'WHITE',
  BLACK = 'BLACK'
}

export enum GameResult {
  RESIGNATION = 'RESIGNATION',
  CHECKMATE = 'CHECKMATE',
  TIMEOUT = 'TIMEOUT',
  STALEMATE = 'STALEMATE',
  DRAW_AGREEMENT = 'DRAW_AGREEMENT',
  DRAW_INSUFFICIENT_MATERIAL = 'DRAW_INSUFFICIENT_MATERIAL',
  DRAW_FIFTY_MOVE_RULE = 'DRAW_FIFTY_MOVE_RULE',
  DRAW_THREEFOLD_REPETITION = 'DRAW_THREEFOLD_REPETITION'
}

// Results that indicate a winner
export type WinnerGameResult =
  | GameResult.RESIGNATION
  | GameResult.CHECKMATE
  | GameResult.TIMEOUT;

// Results that indicate a draw (no winner)
export type DrawGameResult =
  | GameResult.STALEMATE
  | GameResult.DRAW_AGREEMENT
  | GameResult.DRAW_INSUFFICIENT_MATERIAL
  | GameResult.DRAW_FIFTY_MOVE_RULE
  | GameResult.DRAW_THREEFOLD_REPETITION;

// Discriminated union types for type-safe game results
export type GameEndedWithWinner = {
  result: WinnerGameResult;
  winnerColor: Color;
};

export type GameEndedWithDraw = {
  result: DrawGameResult;
  winnerColor: null;
};

export const isGameEndedWithWinner = (result: WinnerGameResult | DrawGameResult | null): result is WinnerGameResult => {
  return (
    result === GameResult.RESIGNATION ||
    result === GameResult.CHECKMATE ||
    result === GameResult.TIMEOUT
  );
}

export const isGameEndedWithDraw = (result: WinnerGameResult | DrawGameResult | null): result is DrawGameResult => {
  return (
    result === GameResult.STALEMATE ||
    result === GameResult.DRAW_AGREEMENT ||
    result === GameResult.DRAW_INSUFFICIENT_MATERIAL ||
    result === GameResult.DRAW_FIFTY_MOVE_RULE ||
    result === GameResult.DRAW_THREEFOLD_REPETITION
  );
}

export type GameEnded = GameEndedWithWinner | GameEndedWithDraw;

export const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export function getCoordinate(color: Color, xPercent: number, yPercent: number): { col: number; row: number } {
  const row =
    color === Color.WHITE
      ? 8 - roundToNearestHundred(yPercent) / 100
      : roundToNearestHundred(yPercent) / 100 + 1;
  const col =
    color === Color.WHITE
      ? roundToNearestHundred(xPercent) / 100
      : 7 - roundToNearestHundred(xPercent) / 100;
  return { col, row };
}


// place files you want to import through the `$lib` alias in this folder.
export const translateFen = (fen: string, color: Color): string[][] => {
  const rows = fen.split(' ')[0].split('/');
  const symbolToPiece: { [key: string]: string } = {
    'r': 'br',
    'n': 'bn',
    'b': 'bb',
    'q': 'bq',
    'k': 'bk',
    'p': 'bp',
    'R': 'wr',
    'N': 'wn',
    'B': 'wb',
    'Q': 'wq',
    'K': 'wk',
    'P': 'wp'
  };

  const board: string[][] = rows.reverse().map(row => {
    const result: string[] = [];
    const elem = row.split("");
    elem.forEach(piece => {
      if (/^\d$/.test(piece)) {
        for (let i = 0; i < parseInt(piece); i++) {
          result.push("");
        }
      } else {
        result.push(symbolToPiece[piece])
      }
    })
    return color === Color.WHITE ? result : result.reverse();
  })

  return color === Color.WHITE ? board.reverse() : board;
}

export function roundToNearestHundred(num: number): number {
  return Math.round(num / 100) * 100;
}