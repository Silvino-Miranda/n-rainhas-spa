import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { QueensSolverStore } from './queens-solver.store';

describe('QueensSolverStore', () => {
  let store: QueensSolverStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(QueensSolverStore);
  });

  it('starts in idle state with default N=8', () => {
    expect(store.status()).toBe('idle');
    expect(store.n()).toBe(8);
    expect(store.isRunning()).toBe(false);
    expect(store.hasSolution()).toBe(false);
  });

  it('startSolve flips the store into the running state', () => {
    store.startSolve('ga', 12);
    expect(store.status()).toBe('running');
    expect(store.isRunning()).toBe(true);
    expect(store.algorithm()).toBe('ga');
    expect(store.n()).toBe(12);
    expect(store.progress()).toBe(0);
  });

  it('updateProgress is monotonic and clamped to 100', () => {
    store.startSolve('nn', 8);
    store.updateProgress(40);
    store.updateProgress(20); // older event ignored
    store.updateProgress(150); // clamped
    expect(store.progress()).toBe(100);
  });

  it('completeSolve with a board switches to success', () => {
    store.startSolve('backtracking', 4);
    store.completeSolve({
      board: [[0, 0, 1, 0], [1, 0, 0, 0], [0, 0, 0, 1], [0, 1, 0, 0]],
      algorithm: 'backtracking',
      n: 4,
      solveTime: 1.2,
      noSolution: false
    });
    expect(store.status()).toBe('success');
    expect(store.hasSolution()).toBe(true);
    expect(store.progress()).toBe(100);
  });

  it('completeSolve with noSolution flips to no-solution', () => {
    store.startSolve('nn', 3);
    store.completeSolve({ board: null, algorithm: 'nn', n: 3, solveTime: 0, noSolution: true });
    expect(store.status()).toBe('no-solution');
    expect(store.hasNoSolution()).toBe(true);
  });

  it('reset clears the board and history but keeps N', () => {
    store.startSolve('ga', 7);
    store.completeSolve({ board: [[0]], algorithm: 'ga', n: 7, solveTime: 0, noSolution: false });
    store.reset();
    expect(store.status()).toBe('idle');
    expect(store.board()).toBeNull();
    expect(store.n()).toBe(7);
  });
});
