import { Injectable, computed, signal } from '@angular/core';
import type {
  AlgorithmType,
  EvolutionPoint,
  TrainingPoint,
  BrainPoint,
  SolveResult
} from '../../../shared/models/algorithm.types';

export type SolverStatus = 'idle' | 'running' | 'success' | 'no-solution' | 'error' | 'cancelled';

export interface QueensSolverState {
  n: number;
  algorithm: AlgorithmType | null;
  status: SolverStatus;
  board: number[][] | null;
  solveTime: number;
  generations: number;
  iterations: number;
  evolutionHistory: EvolutionPoint[];
  trainingHistory: TrainingPoint[];
  brainHistory: BrainPoint[];
  progress: number;
  error: string | null;
}

const INITIAL_STATE: QueensSolverState = {
  n: 8,
  algorithm: null,
  status: 'idle',
  board: null,
  solveTime: 0,
  generations: 0,
  iterations: 0,
  evolutionHistory: [],
  trainingHistory: [],
  brainHistory: [],
  progress: 0,
  error: null
};

@Injectable({ providedIn: 'root' })
export class QueensSolverStore {
  private readonly state = signal<QueensSolverState>(INITIAL_STATE);

  readonly snapshot = this.state.asReadonly();
  readonly n = computed(() => this.state().n);
  readonly algorithm = computed(() => this.state().algorithm);
  readonly status = computed(() => this.state().status);
  readonly board = computed(() => this.state().board);
  readonly solveTime = computed(() => this.state().solveTime);
  readonly generations = computed(() => this.state().generations);
  readonly iterations = computed(() => this.state().iterations);
  readonly evolutionHistory = computed(() => this.state().evolutionHistory);
  readonly trainingHistory = computed(() => this.state().trainingHistory);
  readonly brainHistory = computed(() => this.state().brainHistory);
  readonly progress = computed(() => this.state().progress);
  readonly error = computed(() => this.state().error);

  readonly isRunning = computed(() => this.state().status === 'running');
  readonly hasSolution = computed(() => this.state().status === 'success' && this.state().board !== null);
  readonly hasNoSolution = computed(() => this.state().status === 'no-solution');

  setN(n: number): void {
    this.state.update(s => ({ ...s, n }));
  }

  startSolve(algorithm: AlgorithmType, n: number): void {
    this.state.set({
      ...INITIAL_STATE,
      n,
      algorithm,
      status: 'running',
      progress: 0
    });
  }

  updateProgress(value: number): void {
    this.state.update(s => ({ ...s, progress: Math.max(s.progress, Math.min(100, value)) }));
  }

  appendEvolution(point: EvolutionPoint): void {
    this.state.update(s => ({ ...s, evolutionHistory: [...s.evolutionHistory, point] }));
  }

  appendTraining(point: TrainingPoint): void {
    this.state.update(s => ({ ...s, trainingHistory: [...s.trainingHistory, point] }));
  }

  appendBrain(point: BrainPoint): void {
    this.state.update(s => ({ ...s, brainHistory: [...s.brainHistory, point] }));
  }

  completeSolve(result: SolveResult): void {
    this.state.update(s => ({
      ...s,
      status: result.noSolution ? 'no-solution' : (result.board ? 'success' : 'no-solution'),
      board: result.board,
      solveTime: result.solveTime,
      generations: result.generations ?? 0,
      iterations: result.iterations ?? 0,
      evolutionHistory: result.evolutionHistory ?? s.evolutionHistory,
      trainingHistory: result.trainingHistory ?? s.trainingHistory,
      brainHistory: result.brainHistory ?? s.brainHistory,
      progress: 100
    }));
  }

  failSolve(error: string): void {
    this.state.update(s => ({ ...s, status: 'error', error }));
  }

  cancel(): void {
    this.state.update(s => ({ ...s, status: 'cancelled' }));
  }

  loadFromChampion(payload: {
    algorithm: AlgorithmType;
    n: number;
    board: number[][];
    solveTime: number;
    generations?: number;
    iterations?: number;
    evolutionHistory?: EvolutionPoint[];
    trainingHistory?: TrainingPoint[];
    brainHistory?: BrainPoint[];
  }): void {
    this.state.set({
      ...INITIAL_STATE,
      n: payload.n,
      algorithm: payload.algorithm,
      status: 'success',
      board: payload.board,
      solveTime: payload.solveTime,
      generations: payload.generations ?? 0,
      iterations: payload.iterations ?? 0,
      evolutionHistory: payload.evolutionHistory ?? [],
      trainingHistory: payload.trainingHistory ?? [],
      brainHistory: payload.brainHistory ?? [],
      progress: 100
    });
  }

  reset(): void {
    this.state.set({ ...INITIAL_STATE, n: this.state().n });
  }
}
