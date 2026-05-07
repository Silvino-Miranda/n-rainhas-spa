import { describe, expect, it } from 'vitest';
import { solveNN } from './nn';
import { boardToQueens, countConflicts } from './utils';

describe('solveNN', () => {
  it('returns trivial for N=1', () => {
    const r = solveNN(1);
    expect(r.noSolution).toBe(false);
    expect(r.board).toEqual([[1]]);
  });

  it('flags no solution for N=2 and N=3', () => {
    expect(solveNN(2).noSolution).toBe(true);
    expect(solveNN(3).noSolution).toBe(true);
  });

  it('finds a conflict-free placement for N=6', () => {
    const r = solveNN(6);
    expect(r.noSolution).toBe(false);
    expect(r.board).not.toBeNull();
    expect(countConflicts(boardToQueens(r.board!))).toBe(0);
  });

  it('emits at least one training-history point for N>=4', () => {
    const r = solveNN(5);
    expect(r.trainingHistory && r.trainingHistory.length).toBeGreaterThan(0);
  });
});
