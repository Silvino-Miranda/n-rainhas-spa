import type { SolveResult, EvolutionPoint } from '../../../../shared/models/algorithm.types';
import { boardToQueens, queensToBoard } from './utils';

interface Params {
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  elitismCount: number;
  maxGenerations: number;
}

export interface GAOptions {
  seed?: number[][];
  reportEvery?: number;
  onTick?: (point: EvolutionPoint) => void;
  onProgress?: (percent: number, generation: number, bestFitness: number) => void;
  shouldCancel?: () => boolean;
}

export function solveGA(n: number, opts: GAOptions = {}): SolveResult {
  const start = performance.now();

  if (n === 1) {
    return {
      board: [[1]], algorithm: 'ga', n,
      solveTime: performance.now() - start,
      noSolution: false,
      generations: 0,
      evolutionHistory: [{ generation: 0, bestFitness: 0, avgFitness: 0 }]
    };
  }
  if (n === 2 || n === 3) {
    return { board: null, algorithm: 'ga', n, solveTime: performance.now() - start, noSolution: true };
  }

  const params = adjustParameters(n);
  const evolutionHistory: EvolutionPoint[] = [];
  const reportEvery = opts.reportEvery ?? Math.max(1, Math.floor(params.maxGenerations / 200));

  let population: number[][];
  if (opts.seed) {
    population = initializePopulationWithSeed(n, boardToQueens(opts.seed), params);
  } else {
    population = initializePopulation(n, params);
  }

  for (let generation = 0; generation < params.maxGenerations; generation++) {
    if (opts.shouldCancel?.()) break;

    const fitnessScores = population.map(calculateFitness);
    const bestFitness = Math.min(...fitnessScores);
    const avgFitness = fitnessScores.reduce((a, b) => a + b, 0) / fitnessScores.length;

    if (generation % reportEvery === 0 || bestFitness === 0) {
      const point: EvolutionPoint = { generation: generation + 1, bestFitness, avgFitness: Math.round(avgFitness * 100) / 100 };
      evolutionHistory.push(point);
      opts.onTick?.(point);
      opts.onProgress?.(Math.min(99, ((generation + 1) / params.maxGenerations) * 100), generation + 1, bestFitness);
    }

    const bestIndex = fitnessScores.indexOf(bestFitness);
    if (bestFitness === 0) {
      return {
        board: queensToBoard(population[bestIndex]),
        algorithm: 'ga', n,
        solveTime: performance.now() - start,
        noSolution: false,
        generations: generation + 1,
        evolutionHistory
      };
    }

    const sorted = fitnessScores
      .map((fitness, index) => ({ fitness, index }))
      .sort((a, b) => a.fitness - b.fitness)
      .map(item => item.index);

    const next: number[][] = [];
    for (let i = 0; i < params.elitismCount; i++) {
      next.push([...population[sorted[i]]]);
    }
    while (next.length < params.populationSize) {
      const p1 = tournamentSelection(population, fitnessScores);
      const p2 = tournamentSelection(population, fitnessScores);
      const [c1raw, c2raw] = crossover(p1, p2, params.crossoverRate);
      const c1 = mutate(c1raw, params.mutationRate);
      const c2 = mutate(c2raw, params.mutationRate);
      next.push(c1);
      if (next.length < params.populationSize) next.push(c2);
    }
    population = next;
  }

  const finalFitness = population.map(calculateFitness);
  const bestIdx = finalFitness.indexOf(Math.min(...finalFitness));
  if (finalFitness[bestIdx] === 0) {
    return {
      board: queensToBoard(population[bestIdx]),
      algorithm: 'ga', n,
      solveTime: performance.now() - start,
      noSolution: false,
      generations: params.maxGenerations,
      evolutionHistory
    };
  }
  return {
    board: null,
    algorithm: 'ga', n,
    solveTime: performance.now() - start,
    noSolution: true,
    generations: params.maxGenerations,
    evolutionHistory
  };
}

function adjustParameters(n: number): Params {
  if (n <= 8) return { populationSize: 100, mutationRate: 0.1, crossoverRate: 0.8, elitismCount: 2, maxGenerations: 1000 };
  if (n <= 12) return { populationSize: 200, mutationRate: 0.1, crossoverRate: 0.8, elitismCount: 2, maxGenerations: 5000 };
  return { populationSize: 300, mutationRate: 0.1, crossoverRate: 0.8, elitismCount: 2, maxGenerations: 10000 };
}

function initializePopulation(n: number, params: Params): number[][] {
  const population: number[][] = [];
  for (let i = 0; i < params.populationSize; i++) {
    const individual = Array.from({ length: n }, (_, idx) => idx);
    shuffle(individual);
    population.push(individual);
  }
  return population;
}

function initializePopulationWithSeed(n: number, seed: number[], params: Params): number[][] {
  const population: number[][] = [[...seed]];
  const mutations = Math.floor(params.populationSize * 0.25);
  for (let i = 0; i < mutations; i++) {
    population.push(mutate([...seed], 1));
  }
  while (population.length < params.populationSize) {
    const ind = Array.from({ length: n }, (_, idx) => idx);
    shuffle(ind);
    population.push(ind);
  }
  return population;
}

function shuffle(arr: number[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function calculateFitness(chromosome: number[]): number {
  const n = chromosome.length;
  let conflicts = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(chromosome[i] - chromosome[j]) === Math.abs(i - j)) conflicts++;
    }
  }
  return conflicts;
}

function tournamentSelection(population: number[][], fitness: number[], size = 5): number[] {
  let bestIndex = Math.floor(Math.random() * population.length);
  let bestFit = fitness[bestIndex];
  for (let i = 1; i < size; i++) {
    const idx = Math.floor(Math.random() * population.length);
    if (fitness[idx] < bestFit) {
      bestIndex = idx;
      bestFit = fitness[idx];
    }
  }
  return [...population[bestIndex]];
}

function crossover(p1: number[], p2: number[], rate: number): [number[], number[]] {
  if (Math.random() > rate) return [[...p1], [...p2]];
  const n = p1.length;
  let a = Math.floor(Math.random() * n);
  let b = Math.floor(Math.random() * n);
  if (a > b) [a, b] = [b, a];
  return [orderCrossover(p1, p2, a, b), orderCrossover(p2, p1, a, b)];
}

function orderCrossover(p1: number[], p2: number[], a: number, b: number): number[] {
  const n = p1.length;
  const child = new Array<number>(n).fill(-1);
  for (let i = a; i <= b; i++) child[i] = p1[i];
  const used = new Set(child.filter(v => v !== -1));
  let ci = (b + 1) % n;
  let pi = (b + 1) % n;
  while (used.size < n) {
    if (!used.has(p2[pi])) {
      child[ci] = p2[pi];
      used.add(p2[pi]);
      ci = (ci + 1) % n;
    }
    pi = (pi + 1) % n;
  }
  return child;
}

function mutate(chromosome: number[], rate: number): number[] {
  if (Math.random() > rate) return chromosome;
  const result = [...chromosome];
  const n = result.length;
  const i = Math.floor(Math.random() * n);
  let j = Math.floor(Math.random() * n);
  while (j === i) j = Math.floor(Math.random() * n);
  [result[i], result[j]] = [result[j], result[i]];
  return result;
}
