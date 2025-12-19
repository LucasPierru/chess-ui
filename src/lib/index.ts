export enum Color {
  WHITE = 'w',
  BLACK = 'b'
}

// place files you want to import through the `$lib` alias in this folder.
export const translateFen = (fen: string, color = Color.WHITE): string[][] => {
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
    return result;
  })

  return color === Color.WHITE ? board.reverse() : board;
}