// Shared helpers for queen permutation-based solvers.

export function randomPermutation(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function queensToBoard(queens: number[]): number[][] {
  const n = queens.length;
  const board: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(0));
  for (let col = 0; col < n; col++) {
    board[queens[col]][col] = 1;
  }
  return board;
}

export function boardToQueens(board: number[][]): number[] {
  const n = board.length;
  const queens = new Array<number>(n).fill(0);
  for (let col = 0; col < n; col++) {
    for (let row = 0; row < n; row++) {
      if (board[row][col] === 1) {
        queens[col] = row;
        break;
      }
    }
  }
  return queens;
}

export function countConflicts(queens: number[]): number {
  const n = queens.length;
  let conflicts = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (queens[i] === queens[j]) conflicts++;
      if (Math.abs(queens[i] - queens[j]) === Math.abs(i - j)) conflicts++;
    }
  }
  return conflicts;
}

export function getConflictsForQueen(queens: number[], col: number): number {
  const n = queens.length;
  const row = queens[col];
  let conflicts = 0;
  for (let otherCol = 0; otherCol < n; otherCol++) {
    if (otherCol === col) continue;
    const otherRow = queens[otherCol];
    if (row === otherRow) conflicts++;
    if (Math.abs(row - otherRow) === Math.abs(col - otherCol)) conflicts++;
  }
  return conflicts;
}

export function countQueensWithConflicts(queens: number[]): number {
  const n = queens.length;
  let count = 0;
  for (let col = 0; col < n; col++) {
    if (getConflictsForQueen(queens, col) > 0) count++;
  }
  return count;
}

export function minConflictsStep(queens: number[]): number[] {
  const n = queens.length;
  const result = [...queens];
  const conflictCols: number[] = [];
  for (let col = 0; col < n; col++) {
    if (getConflictsForQueen(queens, col) > 0) conflictCols.push(col);
  }
  if (conflictCols.length === 0) return result;
  const col = conflictCols[Math.floor(Math.random() * conflictCols.length)];
  let minConflicts = Infinity;
  const bestRows: number[] = [];
  for (let row = 0; row < n; row++) {
    const tempQueens = [...queens];
    tempQueens[col] = row;
    const conflicts = getConflictsForQueen(tempQueens, col);
    if (conflicts < minConflicts) {
      minConflicts = conflicts;
      bestRows.length = 0;
      bestRows.push(row);
    } else if (conflicts === minConflicts) {
      bestRows.push(row);
    }
  }
  result[col] = bestRows[Math.floor(Math.random() * bestRows.length)];
  return result;
}
