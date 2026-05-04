import type { SolveResult, TrainingPoint } from '../../../../shared/models/algorithm.types';
import { countConflicts, countQueensWithConflicts, getConflictsForQueen, minConflictsStep, queensToBoard, randomPermutation } from './utils';

export interface NNOptions {
  reportEvery?: number;
  onTick?: (point: TrainingPoint) => void;
  onProgress?: (percent: number, iteration: number, energy: number) => void;
  shouldCancel?: () => boolean;
}

export function solveNN(n: number, opts: NNOptions = {}): SolveResult {
  const start = performance.now();
  if (n === 1) {
    return {
      board: [[1]], algorithm: 'nn', n,
      solveTime: performance.now() - start,
      noSolution: false,
      iterations: 0,
      trainingHistory: [{ iteration: 0, energy: 0, validQueens: 1 }]
    };
  }
  if (n === 2 || n === 3) {
    return { board: null, algorithm: 'nn', n, solveTime: performance.now() - start, noSolution: true };
  }

  const maxIterations = n <= 8 ? 1000 : n <= 12 ? 3000 : 5000;
  const reportEvery = opts.reportEvery ?? 5;

  for (let attempt = 0; attempt < 5; attempt++) {
    if (opts.shouldCancel?.()) break;
    const result = runHybrid(n, maxIterations, reportEvery, opts, start);
    if (result) return result;
  }

  return { board: null, algorithm: 'nn', n, solveTime: performance.now() - start, noSolution: true, iterations: maxIterations };
}

function runHybrid(n: number, maxIterations: number, reportEvery: number, opts: NNOptions, start: number): SolveResult | null {
  const trainingHistory: TrainingPoint[] = [];
  let queens = randomPermutation(n);
  let temperature = 1.0;
  const coolingRate = 0.995;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    if (opts.shouldCancel?.()) return null;

    const conflicts = countConflicts(queens);
    if (iteration % reportEvery === 0) {
      const point: TrainingPoint = { iteration, energy: conflicts, validQueens: n - countQueensWithConflicts(queens) };
      trainingHistory.push(point);
      opts.onTick?.(point);
      opts.onProgress?.(Math.min(99, (iteration / maxIterations) * 100), iteration, conflicts);
    }

    if (conflicts === 0) {
      const point: TrainingPoint = { iteration, energy: 0, validQueens: n };
      trainingHistory.push(point);
      opts.onTick?.(point);
      return {
        board: queensToBoard(queens), algorithm: 'nn', n,
        solveTime: performance.now() - start,
        noSolution: false,
        iterations: iteration,
        trainingHistory
      };
    }

    const r = Math.random();
    if (r < 0.4) {
      queens = minConflictsStep(queens);
    } else if (r < 0.7) {
      queens = neuralSwapStep(queens, temperature);
    } else {
      queens = randomSwap(queens);
    }

    temperature = Math.max(0.01, temperature * coolingRate);
  }

  for (let i = 0; i < 1000; i++) {
    if (opts.shouldCancel?.()) return null;
    if (countConflicts(queens) === 0) {
      const point: TrainingPoint = { iteration: maxIterations + i, energy: 0, validQueens: n };
      trainingHistory.push(point);
      opts.onTick?.(point);
      return {
        board: queensToBoard(queens), algorithm: 'nn', n,
        solveTime: performance.now() - start,
        noSolution: false,
        iterations: maxIterations + i,
        trainingHistory
      };
    }
    queens = minConflictsStep(queens);
  }

  return null;
}

function neuralSwapStep(queens: number[], temperature: number): number[] {
  const n = queens.length;
  const result = [...queens];
  const energies: number[] = [];
  for (let col = 0; col < n; col++) energies[col] = getConflictsForQueen(queens, col);

  const high = energies
    .map((e, i) => ({ energy: e, col: i }))
    .filter(x => x.energy > 0)
    .sort((a, b) => b.energy - a.energy);

  if (high.length < 2) return minConflictsStep(queens);

  const col1 = high[0].col;
  const col2Index = Math.floor(Math.random() * Math.min(3, high.length - 1)) + 1;
  const col2 = high[col2Index]?.col ?? high[1].col;

  const current = countConflicts(queens);
  [result[col1], result[col2]] = [result[col2], result[col1]];
  const next = countConflicts(result);

  if (next <= current) return result;
  const probability = Math.exp(-(next - current) / temperature);
  return Math.random() < probability ? result : queens;
}

function randomSwap(queens: number[]): number[] {
  const n = queens.length;
  const result = [...queens];
  const i = Math.floor(Math.random() * n);
  let j = Math.floor(Math.random() * n);
  while (j === i) j = Math.floor(Math.random() * n);
  [result[i], result[j]] = [result[j], result[i]];
  return result;
}
