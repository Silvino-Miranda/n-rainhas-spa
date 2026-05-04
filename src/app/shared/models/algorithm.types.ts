export type AlgorithmType = 'backtracking' | 'ga' | 'nn' | 'brain';

export const ALGORITHM_LABELS: Record<AlgorithmType, string> = {
  backtracking: 'Backtracking',
  ga: 'Algoritmo Genético',
  nn: 'Hopfield Híbrida',
  brain: 'Brain.js'
};

export const ALGORITHM_DESCRIPTIONS: Record<AlgorithmType, string> = {
  backtracking: 'Recursão exata. Sempre encontra.',
  ga: 'Evolução iterativa. Aprende com gerações.',
  nn: 'Rede neural com simulated annealing.',
  brain: 'Feedforward treinada + heurística.'
};

export interface EvolutionPoint {
  generation: number;
  bestFitness: number;
  avgFitness: number;
}

export interface TrainingPoint {
  iteration: number;
  energy: number;
  validQueens: number;
}

export interface BrainPoint {
  iteration: number;
  error: number;
  validQueens: number;
}

export interface SolveResult {
  board: number[][] | null;
  algorithm: AlgorithmType;
  n: number;
  solveTime: number;
  noSolution: boolean;
  generations?: number;
  iterations?: number;
  evolutionHistory?: EvolutionPoint[];
  trainingHistory?: TrainingPoint[];
  brainHistory?: BrainPoint[];
}

export interface ChampionV2 {
  id: string;
  schemaVersion: 2;
  algorithm: AlgorithmType;
  n: number;
  solveTime: number;
  generations?: number;
  iterations?: number;
  createdAt: number;
  updatedAt: number;
  board: number[][];
  evolutionHistory?: EvolutionPoint[];
  trainingHistory?: TrainingPoint[];
  brainHistory?: BrainPoint[];
}

export interface PreferencesV2 {
  schemaVersion: 2;
  theme: 'light' | 'dark';
  lastQueensCount: number;
  lastAlgorithm: AlgorithmType;
  autoSaveChampions: boolean;
  updatedAt: number;
}
