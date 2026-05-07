import { describe, expect, it } from 'vitest';
import { solveGA } from './ga';
import { countConflicts, boardToQueens } from './utils';

describe('solveGA', () => {
  it('returns trivial for N=1', () => {
    const r = solveGA(1);
    expect(r.noSolution).toBe(false);
    expect(r.board).toEqual([[1]]);
  });

  it('flags no solution for N=2 and N=3', () => {
    expect(solveGA(2).noSolution).toBe(true);
    expect(solveGA(3).noSolution).toBe(true);
  });

  it('finds a conflict-free placement for N=8', () => {
    const r = solveGA(8);
    expect(r.noSolution).toBe(false);
    expect(r.board).not.toBeNull();
    expect(countConflicts(boardToQueens(r.board!))).toBe(0);
  });

  it('emits at least one evolution-history point for N>=4', () => {
    const r = solveGA(6);
    expect(r.evolutionHistory && r.evolutionHistory.length).toBeGreaterThan(0);
  });
});
