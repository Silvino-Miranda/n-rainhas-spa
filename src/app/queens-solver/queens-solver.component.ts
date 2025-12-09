import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { QueensSolverService } from './_shared/services/queens-solver.service';
import { QueensSolverGaService } from './_shared/services/queens-solver-ga.service';
import { QueensSolverNnService } from './_shared/services/queens-solver-nn.service';
import { QueensSolverBrainService } from './_shared/services/queens-solver-brain.service';
import { LocalStorageService, ChampionResult, AlgorithmType } from './_shared/services/local-storage.service';
import { FormControlsComponent } from './_shared/components/form-controls/form-controls.component';
import { ChampionsTableComponent } from './_shared/components/champions-table/champions-table.component';
import { LoadingStateComponent } from './_shared/components/loading-state/loading-state.component';
import { NoSolutionAlertComponent } from './_shared/components/no-solution-alert/no-solution-alert.component';
import { ResultsBoardComponent } from './_shared/components/results-board/results-board.component';
import { TrainingChartComponent } from './_shared/components/training-chart/training-chart.component';

@Component({
  selector: 'app-queens-solver',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormControlsComponent,
    ChampionsTableComponent,
    LoadingStateComponent,
    NoSolutionAlertComponent,
    ResultsBoardComponent,
    TrainingChartComponent
  ],
  templateUrl: './queens-solver.component.html',
  styleUrls: ['./queens-solver.component.scss']
})
export class QueensSolverComponent {
  private formBuilder = inject(FormBuilder);
  private queensSolver = inject(QueensSolverService);
  private queensSolverGa = inject(QueensSolverGaService);
  private queensSolverNn = inject(QueensSolverNnService);
  private queensSolverBrain = inject(QueensSolverBrainService);
  private localStorage = inject(LocalStorageService);

  form: FormGroup<{ queensNumber: FormControl<number | null> }>;

  // Estado da aplicação com Signals
  solution: WritableSignal<number[][] | null> = signal(null);
  isLoading: WritableSignal<boolean> = signal(false);
  noSolution: WritableSignal<boolean> = signal(false);
  solveTime: WritableSignal<number> = signal(0);
  queensCount: WritableSignal<number> = signal(0);

  // Propriedades para AG
  generations: WritableSignal<number> = signal(0);
  algorithmUsed: WritableSignal<'backtracking' | 'ga' | 'nn' | 'brain' | null> = signal(null);
  evolutionHistory: WritableSignal<{ generation: number; bestFitness: number; avgFitness: number }[]> = signal([]);
  evolveFromSaved: WritableSignal<boolean> = signal(true);

  // Propriedades para Rede Neural
  iterations: WritableSignal<number> = signal(0);
  trainingHistory: WritableSignal<{ iteration: number; energy: number; validQueens: number }[]> = signal([]);

  // Propriedades para Brain.js
  brainHistory: WritableSignal<{ iteration: number; error: number; validQueens: number }[]> = signal([]);

  // Limites para o número de rainhas
  readonly MIN_QUEENS = 1;
  readonly MAX_QUEENS = 15;

  constructor() {
    this.form = this.formBuilder.group({
      queensNumber: [
        4,
        [Validators.required, Validators.min(this.MIN_QUEENS), Validators.max(this.MAX_QUEENS)]
      ]
    });

    // Migrar dados do formato antigo (se existirem)
    this.localStorage.migrateFromOldFormat();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const queensNumber = this.form.get('queensNumber')?.value;
    if (queensNumber) {
      this.solve(queensNumber);
    }
  }

  onSubmitGA(): void {
    if (this.form.invalid) {
      return;
    }

    const queensNumber = this.form.get('queensNumber')?.value;
    if (queensNumber) {
      this.solveWithGA(queensNumber);
    }
  }

  onSubmitNN(): void {
    if (this.form.invalid) {
      return;
    }

    const queensNumber = this.form.get('queensNumber')?.value;
    if (queensNumber) {
      this.solveWithNN(queensNumber);
    }
  }

  onSubmitBrain(): void {
    if (this.form.invalid) {
      return;
    }

    const queensNumber = this.form.get('queensNumber')?.value;
    if (queensNumber) {
      this.solveWithBrain(queensNumber);
    }
  }

  solve(n: number): void {
    this.resetState(n);
    this.algorithmUsed.set('backtracking');
    this.evolutionHistory.set([]);

    setTimeout(() => {
      const startTime = performance.now();
      const result = this.queensSolver.solve(n);
      const endTime = performance.now();

      this.solveTime.set(Math.round((endTime - startTime) * 100) / 100);
      this.isLoading.set(false);
      this.generations.set(0);

      if (result) {
        this.solution.set(result);
        this.noSolution.set(false);
        this.saveChampion('backtracking', n, this.solveTime(), result);
      } else {
        this.solution.set(null);
        this.noSolution.set(true);
      }
    }, 10);
  }

  solveWithGA(n: number): void {
    this.resetState(n);
    this.algorithmUsed.set('ga');

    setTimeout(() => {
      const savedResult = this.evolveFromSaved() ? this.getGAChampionForN(n) : null;
      const initialBoard = savedResult?.board || undefined;

      const startTime = performance.now();
      const result = this.queensSolverGa.solve(n, initialBoard);
      const endTime = performance.now();

      this.solveTime.set(Math.round((endTime - startTime) * 100) / 100);
      this.isLoading.set(false);

      if (result) {
        this.solution.set(result.board);
        this.generations.set(result.generations);
        this.evolutionHistory.set(result.evolutionHistory);
        this.noSolution.set(false);
        this.saveChampion('ga', n, this.solveTime(), result.board, result.generations);
      } else {
        this.solution.set(null);
        this.generations.set(0);
        this.evolutionHistory.set([]);
        this.noSolution.set(true);
      }
    }, 10);
  }

  solveWithNN(n: number): void {
    this.resetState(n);
    this.algorithmUsed.set('nn');

    setTimeout(() => {
      const startTime = performance.now();
      const result = this.queensSolverNn.solve(n);
      const endTime = performance.now();

      this.solveTime.set(Math.round((endTime - startTime) * 100) / 100);
      this.isLoading.set(false);

      if (result) {
        this.solution.set(result.board);
        this.iterations.set(result.iterations);
        this.trainingHistory.set(result.trainingHistory);
        this.noSolution.set(false);
        this.saveChampion('nn', n, this.solveTime(), result.board, undefined, result.iterations);
      } else {
        this.solution.set(null);
        this.iterations.set(0);
        this.trainingHistory.set([]);
        this.noSolution.set(true);
      }
    }, 10);
  }

  solveWithBrain(n: number): void {
    this.resetState(n);
    this.algorithmUsed.set('brain');

    setTimeout(() => {
      const startTime = performance.now();
      const result = this.queensSolverBrain.solve(n);
      const endTime = performance.now();

      this.solveTime.set(Math.round((endTime - startTime) * 100) / 100);
      this.isLoading.set(false);

      if (result) {
        this.solution.set(result.board);
        this.iterations.set(result.iterations);
        this.brainHistory.set(result.trainingHistory);
        this.noSolution.set(false);
        this.saveChampion('brain', n, this.solveTime(), result.board, undefined, result.iterations);
      } else {
        this.solution.set(null);
        this.iterations.set(0);
        this.brainHistory.set([]);
        this.noSolution.set(true);
      }
    }, 10);
  }

  private resetState(n: number): void {
    this.solution.set(null);
    this.noSolution.set(false);
    this.isLoading.set(true);
    this.queensCount.set(n);
    this.generations.set(0);
    this.evolutionHistory.set([]);
    this.iterations.set(0);
    this.trainingHistory.set([]);
    this.brainHistory.set([]);
  }

  private saveChampion(
    algorithm: AlgorithmType,
    n: number,
    solveTime: number,
    board: number[][],
    generations?: number,
    iterations?: number
  ): void {
    const champion: ChampionResult = {
      n,
      algorithm,
      solveTime,
      board,
      date: new Date().toLocaleString('pt-BR'),
      ...(generations !== undefined && { generations }),
      ...(iterations !== undefined && { iterations })
    };

    this.localStorage.saveChampion(champion);
  }

  getAllChampions(): ChampionResult[] {
    return this.localStorage.getAllChampions();
  }

  getChampionsByAlgorithm(algorithm: AlgorithmType): ChampionResult[] {
    return this.localStorage.getChampionsByAlgorithm(algorithm);
  }

  loadSavedSolution(result: ChampionResult): void {
    this.solution.set(result.board);
    this.queensCount.set(result.n);
    this.algorithmUsed.set(result.algorithm);
    this.solveTime.set(result.solveTime);
    this.noSolution.set(false);

    if (result.generations !== undefined) {
      this.generations.set(result.generations);
    }
    if (result.iterations !== undefined) {
      this.iterations.set(result.iterations);
    }

    this.evolutionHistory.set([]);
    this.trainingHistory.set([]);
    this.brainHistory.set([]);
  }

  clearAllResults(): void {
    this.localStorage.clearAll();
  }

  clearAlgorithmResults(algorithm: AlgorithmType): void {
    this.localStorage.clearAlgorithmChampions(algorithm);
  }

  hasSavedResultForCurrentN(): boolean {
    const n = this.form.get('queensNumber')?.value;
    return n ? this.localStorage.hasChampion('ga', n) : false;
  }

  private getGAChampionForN(n: number): ChampionResult | null {
    return this.localStorage.getChampion('ga', n);
  }

  getAlgorithmLabel(algorithm: AlgorithmType): string {
    const labels: { [key in AlgorithmType]: string } = {
      backtracking: 'Backtracking',
      ga: 'Genético',
      nn: 'Rede Neural',
      brain: 'Brain.js'
    };
    return labels[algorithm] || algorithm;
  }

  getAlgorithmEmoji(algorithm: AlgorithmType): string {
    const emojis: { [key in AlgorithmType]: string } = {
      backtracking: '♟️',
      ga: '🧬',
      nn: '🧠',
      brain: '🔵'
    };
    return emojis[algorithm] || '❓';
  }

  getAlgorithmBadgeClass(algorithm: AlgorithmType): string {
    const classes: { [key in AlgorithmType]: string } = {
      backtracking: 'bg-secondary',
      ga: 'bg-success',
      nn: 'bg-warning text-dark',
      brain: 'bg-info'
    };
    return classes[algorithm] || 'bg-secondary';
  }
}
