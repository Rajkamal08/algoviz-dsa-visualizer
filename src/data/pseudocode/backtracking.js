export const backtrackingPseudocode = {
  nqueens: {
    javascript: [
      'function nQueens(board, row) {',
      '  if (row === N) { solutions.push(board); return; }',
      '  for (let col = 0; col < N; col++) {',
      '    if (isSafe(board, row, col)) {',
      '      board[row][col] = "Q";',
      '      nQueens(board, row + 1);',
      '      board[row][col] = "."; // Backtrack',
      '    }',
      '  }',
      '}',
    ],
  },
}
