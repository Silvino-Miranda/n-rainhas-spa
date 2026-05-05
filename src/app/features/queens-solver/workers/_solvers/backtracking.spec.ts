import { describe, expect, it } from 'vitest';
import { solveBacktracking } from './backtracking';

describe('solveBacktracking', () => {
  it('returns trivial board for N=1', () => {
    const result = solveBacktracking(1);
    expect(result.noSolution).toBe(false);
    expect(result.board).toEqual([[1]]);
  });

  it('flags no solution for N=2', () => {
    const result = solveBacktracking(2);
    expect(result.noSolution).toBe(true);
    expect(result.board).toBeNull();
  });

  it('flags no solution for N=3', () => {
    const result = solveBacktracking(3);
    expect(result.noSolution).toBe(true);
  });

  it('finds a valid placement for N=4', () => {
    const result = solveBacktracking(4);
    expect(result.noSolution).toBe(false);
    expect(result.board).not.toBeNull();
    const board = result.board!;
    expect(board.length).toBe(4);
    // Exactly N queens placed
    const queens = board.flat().filter(v => v === 1).length;
    expect(queens).toBe(4);
  });

  it('produces a conflict-free placement for N=8', () => {
    const result = solveBacktracking(8);
    expect(result.noSolution).toBe(false);
    const board = result.board!;
    const positions: { r: number; c: number }[] = [];
    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board.length; c++) {
        if (board[r][c] === 1) positions.push({ r, c });
      }
    }
    expect(positions.length).toBe(8);
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        expect(a.r).not.toBe(b.r);
        expect(a.c).not.toBe(b.c);
        expect(Math.abs(a.r - b.r)).not.toBe(Math.abs(a.c - b.c));
      }
    }
  });
});
