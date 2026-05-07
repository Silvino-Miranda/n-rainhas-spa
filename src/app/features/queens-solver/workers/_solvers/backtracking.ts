import type { SolveResult } from '../../../../shared/models/algorithm.types';

export function solveBacktracking(n: number): SolveResult {
  const start = performance.now();
  if (n === 1) {
    return {
      board: [[1]],
      algorithm: 'backtracking',
      n,
      solveTime: performance.now() - start,
      noSolution: false
    };
  }
  if (n === 2 || n === 3) {
    return {
      board: null,
      algorithm: 'backtracking',
      n,
      solveTime: performance.now() - start,
      noSolution: true
    };
  }

  const board: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(0));
  const solution = placeQueens(board, 0);
  return {
    board: solution,
    algorithm: 'backtracking',
    n,
    solveTime: performance.now() - start,
    noSolution: solution === null
  };
}

function placeQueens(board: number[][], col: number): number[][] | null {
  const n = board.length;
  if (col === n) return board;
  for (let row = 0; row < n; row++) {
    if (isValid(board, row, col)) {
      board[row][col] = 1;
      const result = placeQueens(board, col + 1);
      if (result) return result;
      board[row][col] = 0;
    }
  }
  return null;
}

function isValid(board: number[][], row: number, col: number): boolean {
  for (let i = 0; i < col; i++) {
    if (board[row][i] === 1) return false;
  }
  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j] === 1) return false;
  }
  for (let i = row + 1, j = col - 1; i < board.length && j >= 0; i++, j--) {
    if (board[i][j] === 1) return false;
  }
  return true;
}
