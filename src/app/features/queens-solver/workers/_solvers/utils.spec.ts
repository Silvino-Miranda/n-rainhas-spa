import { describe, expect, it } from 'vitest';
import {
  boardToQueens,
  countConflicts,
  countQueensWithConflicts,
  getConflictsForQueen,
  minConflictsStep,
  queensToBoard,
  randomPermutation
} from './utils';

describe('worker solver utils', () => {
  it('randomPermutation returns each value 0..n-1 exactly once', () => {
    const n = 8;
    const perm = randomPermutation(n);
    expect(perm).toHaveLength(n);
    expect(new Set(perm).size).toBe(n);
    for (let i = 0; i < n; i++) expect(perm).toContain(i);
  });

  it('queensToBoard puts exactly one queen per column at the right row', () => {
    const queens = [1, 3, 0, 2];
    const board = queensToBoard(queens);
    expect(board[1][0]).toBe(1);
    expect(board[3][1]).toBe(1);
    expect(board[0][2]).toBe(1);
    expect(board[2][3]).toBe(1);
    expect(board.flat().filter(v => v === 1)).toHaveLength(4);
  });

  it('boardToQueens is the inverse of queensToBoard', () => {
    const original = [2, 0, 3, 1];
    expect(boardToQueens(queensToBoard(original))).toEqual(original);
  });

  it('countConflicts is zero for the canonical N=4 solution [1,3,0,2]', () => {
    expect(countConflicts([1, 3, 0, 2])).toBe(0);
  });

  it('countConflicts catches diagonal attacks', () => {
    expect(countConflicts([0, 1, 2, 3])).toBeGreaterThan(0);
  });

  it('getConflictsForQueen returns 0 when the queen is safe', () => {
    expect(getConflictsForQueen([1, 3, 0, 2], 0)).toBe(0);
  });

  it('countQueensWithConflicts is 0 on a valid placement', () => {
    expect(countQueensWithConflicts([1, 3, 0, 2])).toBe(0);
  });

  it('minConflictsStep returns a permutation of the same length', () => {
    const start = [0, 1, 2, 3, 4, 5, 6, 7];
    const next = minConflictsStep(start);
    expect(next).toHaveLength(start.length);
    expect(next.every(v => v >= 0 && v < start.length)).toBe(true);
  });
});
