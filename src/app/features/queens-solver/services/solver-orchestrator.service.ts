import { Injectable, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { QueensSolverStore } from '../state/queens-solver.store';
import { PersistenceService } from '../../../data-access/persistence.service';
import { runInWorker } from '../../../shared/utils/worker-client';
import type { AlgorithmType, ChampionV2 } from '../../../shared/models/algorithm.types';

@Injectable({ providedIn: 'root' })
export class SolverOrchestratorService {
  private readonly store = inject(QueensSolverStore);
  private readonly persistence = inject(PersistenceService);
  private currentSubscription: Subscription | null = null;

  solve(algorithm: AlgorithmType, n: number, seed?: number[][]): void {
    this.cancel();
    this.store.startSolve(algorithm, n);

    const factory = workerFactories[algorithm];
    if (!factory) {
      this.store.failSolve(`Algoritmo desconhecido: ${algorithm}`);
      return;
    }

    this.currentSubscription = runInWorker(factory, { type: 'solve', n, seed }).subscribe({
      next: message => {
        switch (message.type) {
          case 'progress':
            this.store.updateProgress(message.value);
            break;
          case 'evolution-tick':
            this.store.appendEvolution(message.point);
            break;
          case 'training-tick':
            this.store.appendTraining(message.point);
            break;
          case 'brain-tick':
            this.store.appendBrain(message.point);
            break;
          case 'result':
            this.store.completeSolve(message.data);
            void this.maybePersist(message.data, algorithm, n);
            break;
        }
      },
      error: err => {
        this.store.failSolve(err instanceof Error ? err.message : String(err));
      }
    });
  }

  cancel(): void {
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
    }
  }

  private async maybePersist(
    result: { board: number[][] | null; solveTime: number; generations?: number; iterations?: number; evolutionHistory?: ChampionV2['evolutionHistory']; trainingHistory?: ChampionV2['trainingHistory']; brainHistory?: ChampionV2['brainHistory'] },
    algorithm: AlgorithmType,
    n: number
  ): Promise<void> {
    if (!result.board) return;
    const prefs = await this.persistence.getPreferences();
    if (!prefs.autoSaveChampions) return;

    const champion: ChampionV2 = {
      id: `${algorithm}:${n}:${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      schemaVersion: 2,
      algorithm,
      n,
      solveTime: result.solveTime,
      generations: result.generations,
      iterations: result.iterations,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      board: result.board,
      evolutionHistory: result.evolutionHistory,
      trainingHistory: result.trainingHistory,
      brainHistory: result.brainHistory
    };
    await this.persistence.saveChampion(champion);
  }
}

type WorkerFactory = () => Worker;

const workerFactories: Record<AlgorithmType, WorkerFactory> = {
  backtracking: () => new Worker(new URL('../workers/backtracking.worker', import.meta.url), { type: 'module' }),
  ga: () => new Worker(new URL('../workers/ga.worker', import.meta.url), { type: 'module' }),
  nn: () => new Worker(new URL('../workers/nn.worker', import.meta.url), { type: 'module' }),
  brain: () => new Worker(new URL('../workers/brain.worker', import.meta.url), { type: 'module' })
};
