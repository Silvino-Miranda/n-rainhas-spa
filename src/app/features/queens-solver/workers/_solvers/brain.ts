import type { SolveResult, BrainPoint } from '../../../../shared/models/algorithm.types';
import { countConflicts, countQueensWithConflicts, getConflictsForQueen, minConflictsStep, queensToBoard, randomPermutation } from './utils';

export interface BrainOptions {
  reportEvery?: number;
  onTick?: (point: BrainPoint) => void;
  onProgress?: (percent: number, iteration: number, error: number) => void;
  shouldCancel?: () => boolean;
}

interface BrainNet {
  train: (data: { input: Record<string, number>; output: Record<string, number> }[], options: { iterations: number; errorThresh: number; log: boolean }) => unknown;
  run: (input: Record<string, number>) => Record<string, number>;
}

interface BrainModule {
  NeuralNetwork: new (options: { hiddenLayers: number[]; activation: string; learningRate: number }) => BrainNet;
}

export async function solveBrain(n: number, opts: BrainOptions = {}): Promise<SolveResult> {
  const start = performance.now();
  if (n === 1) {
    return {
      board: [[1]], algorithm: 'brain', n,
      solveTime: performance.now() - start,
      noSolution: false,
      iterations: 0,
      brainHistory: [{ iteration: 0, error: 0, validQueens: 1 }]
    };
  }
  if (n === 2 || n === 3) {
    return { board: null, algorithm: 'brain', n, solveTime: performance.now() - start, noSolution: true };
  }

  const brainModule = (await import(/* webpackIgnore: true */ 'brain.js')) as unknown as BrainModule;
  const maxIterations = n <= 8 ? 1000 : n <= 12 ? 2000 : 3000;
  const reportEvery = opts.reportEvery ?? 10;

  for (let attempt = 0; attempt < 5; attempt++) {
    if (opts.shouldCancel?.()) break;
    const result = trainAndSolve(brainModule, n, maxIterations, reportEvery, opts, start);
    if (result) return result;
  }

  return { board: null, algorithm: 'brain', n, solveTime: performance.now() - start, noSolution: true, iterations: maxIterations };
}

function trainAndSolve(
  brainModule: BrainModule,
  n: number,
  maxIterations: number,
  reportEvery: number,
  opts: BrainOptions,
  start: number
): SolveResult | null {
  const brainHistory: BrainPoint[] = [];

  const net = new brainModule.NeuralNetwork({
    hiddenLayers: [n * 2, n * 2],
    activation: 'sigmoid',
    learningRate: 0.3
  });

  const trainingData = generateTrainingData(n);
  net.train(trainingData, { iterations: 500, errorThresh: 0.005, log: false });

  let queens = initializeWithNetwork(net, n);
  let bestQueens = [...queens];
  let bestConflicts = countConflicts(queens);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    if (opts.shouldCancel?.()) return null;
    const conflicts = countConflicts(queens);

    if (iteration % reportEvery === 0) {
      const point: BrainPoint = { iteration, error: conflicts / n, validQueens: n - countQueensWithConflicts(queens) };
      brainHistory.push(point);
      opts.onTick?.(point);
      opts.onProgress?.(Math.min(99, (iteration / maxIterations) * 100), iteration, conflicts / n);
    }

    if (conflicts === 0) {
      const point: BrainPoint = { iteration, error: 0, validQueens: n };
      brainHistory.push(point);
      opts.onTick?.(point);
      return {
        board: queensToBoard(queens), algorithm: 'brain', n,
        solveTime: performance.now() - start,
        noSolution: false,
        iterations: iteration,
        brainHistory
      };
    }

    if (conflicts < bestConflicts) {
      bestConflicts = conflicts;
      bestQueens = [...queens];
    }

    const r = Math.random();
    if (r < 0.3) {
      queens = networkGuidedStep(net, queens, n);
    } else if (r < 0.7) {
      queens = minConflictsStep(queens);
    } else {
      queens = randomMove(queens);
    }
  }

  queens = [...bestQueens];
  for (let i = 0; i < 500; i++) {
    if (opts.shouldCancel?.()) return null;
    if (countConflicts(queens) === 0) {
      const point: BrainPoint = { iteration: maxIterations + i, error: 0, validQueens: n };
      brainHistory.push(point);
      opts.onTick?.(point);
      return {
        board: queensToBoard(queens), algorithm: 'brain', n,
        solveTime: performance.now() - start,
        noSolution: false,
        iterations: maxIterations + i,
        brainHistory
      };
    }
    queens = minConflictsStep(queens);
  }

  return null;
}

function generateTrainingData(n: number): { input: Record<string, number>; output: Record<string, number> }[] {
  const data: { input: Record<string, number>; output: Record<string, number> }[] = [];
  for (let sample = 0; sample < 50; sample++) {
    let queens = randomPermutation(n);
    for (let i = 0; i < 100; i++) {
      if (countConflicts(queens) === 0) break;
      queens = minConflictsStep(queens);
    }
    if (countConflicts(queens) <= 1) {
      const input: Record<string, number> = {};
      const output: Record<string, number> = {};
      for (let col = 0; col < n; col++) {
        input[`c${col}`] = queens[col] / (n - 1);
        output[`c${col}`] = queens[col] / (n - 1);
      }
      data.push({ input, output });
    }
  }
  while (data.length < 10) {
    const queens = randomPermutation(n);
    const input: Record<string, number> = {};
    const output: Record<string, number> = {};
    for (let col = 0; col < n; col++) {
      input[`c${col}`] = queens[col] / (n - 1);
      output[`c${col}`] = queens[col] / (n - 1);
    }
    data.push({ input, output });
  }
  return data;
}

function initializeWithNetwork(net: BrainNet, n: number): number[] {
  try {
    const input: Record<string, number> = {};
    for (let col = 0; col < n; col++) input[`c${col}`] = 0.5;
    const output = net.run(input);
    const queens: number[] = [];
    const used = new Set<number>();
    for (let col = 0; col < n; col++) {
      let row = Math.round((output[`c${col}`] ?? Math.random()) * (n - 1));
      row = Math.max(0, Math.min(n - 1, row));
      while (used.has(row)) row = (row + 1) % n;
      queens.push(row);
      used.add(row);
    }
    return queens;
  } catch {
    return randomPermutation(n);
  }
}

function networkGuidedStep(net: BrainNet, queens: number[], n: number): number[] {
  const result = [...queens];
  const conflictCols: number[] = [];
  for (let col = 0; col < n; col++) {
    if (getConflictsForQueen(queens, col) > 0) conflictCols.push(col);
  }
  if (conflictCols.length === 0) return result;
  const col = conflictCols[Math.floor(Math.random() * conflictCols.length)];
  try {
    const input: Record<string, number> = {};
    for (let c = 0; c < n; c++) input[`c${c}`] = queens[c] / (n - 1);
    const output = net.run(input);
    let row = Math.round((output[`c${col}`] ?? Math.random()) * (n - 1));
    row = Math.max(0, Math.min(n - 1, row));
    const temp = [...queens];
    temp[col] = row;
    if (countConflicts(temp) < countConflicts(queens)) {
      result[col] = row;
      return result;
    }
    return minConflictsStep(queens);
  } catch {
    return minConflictsStep(queens);
  }
}

function randomMove(queens: number[]): number[] {
  const n = queens.length;
  const result = [...queens];
  const col = Math.floor(Math.random() * n);
  result[col] = Math.floor(Math.random() * n);
  return result;
}
