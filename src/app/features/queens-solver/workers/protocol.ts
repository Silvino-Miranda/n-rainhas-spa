import type { AlgorithmType, SolveResult, EvolutionPoint, TrainingPoint, BrainPoint } from '../../../shared/models/algorithm.types';

export interface SolveRequest {
  type: 'solve';
  n: number;
  seed?: number[][];
}

export interface CancelRequest {
  type: 'cancel';
}

export type WorkerRequest = SolveRequest | CancelRequest;

export interface ProgressMessage {
  type: 'progress';
  value: number;
  generation?: number;
  iteration?: number;
  bestFitness?: number;
  energy?: number;
  validQueens?: number;
}

export interface EvolutionTickMessage {
  type: 'evolution-tick';
  point: EvolutionPoint;
}

export interface TrainingTickMessage {
  type: 'training-tick';
  point: TrainingPoint;
}

export interface BrainTickMessage {
  type: 'brain-tick';
  point: BrainPoint;
}

export interface ResultMessage {
  type: 'result';
  data: SolveResult;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
}

export type WorkerMessage =
  | ProgressMessage
  | EvolutionTickMessage
  | TrainingTickMessage
  | BrainTickMessage
  | ResultMessage
  | ErrorMessage;

export interface AlgorithmDispatch {
  algorithm: AlgorithmType;
  workerFactory: () => Worker;
}
