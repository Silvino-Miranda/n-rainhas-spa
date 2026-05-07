import { describe, expect, it } from 'vitest';
import { ALGORITHM_DESCRIPTIONS, ALGORITHM_LABELS, type AlgorithmType } from './algorithm.types';

const ALGORITHMS: AlgorithmType[] = ['backtracking', 'ga', 'nn', 'brain'];

describe('algorithm metadata maps', () => {
  it('exposes a non-empty label for every AlgorithmType', () => {
    for (const algo of ALGORITHMS) {
      expect(ALGORITHM_LABELS[algo]).toBeTruthy();
      expect(ALGORITHM_LABELS[algo].length).toBeGreaterThan(0);
    }
  });

  it('exposes a non-empty description for every AlgorithmType', () => {
    for (const algo of ALGORITHMS) {
      expect(ALGORITHM_DESCRIPTIONS[algo]).toBeTruthy();
      expect(ALGORITHM_DESCRIPTIONS[algo].length).toBeGreaterThan(10);
    }
  });

  it('labels are unique across algorithms', () => {
    const labels = ALGORITHMS.map(a => ALGORITHM_LABELS[a]);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
