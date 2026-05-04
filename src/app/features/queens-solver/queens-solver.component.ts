import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { FormControlsComponent } from './components/form-controls/form-controls.component';
import { ResultsBoardComponent } from './components/results-board/results-board.component';
import { LoadingStateComponent } from './components/loading-state/loading-state.component';
import { NoSolutionAlertComponent } from './components/no-solution-alert/no-solution-alert.component';
import { TrainingChartComponent } from './components/training-chart/training-chart.component';
import { ChampionsTableComponent } from './components/champions-table/champions-table.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import {
  BoardZoomDialogComponent,
  type BoardZoomData
} from './components/board-zoom-dialog/board-zoom-dialog.component';
import { QueensSolverStore } from './state/queens-solver.store';
import { SolverOrchestratorService } from './services/solver-orchestrator.service';
import { PersistenceService } from '../../data-access/persistence.service';
import type { AlgorithmType, ChampionV2 } from '../../shared/models/algorithm.types';
import { LucideAngularModule, Maximize2 } from 'lucide-angular';

const DEMO_SEQUENCE: AlgorithmType[] = ['backtracking', 'ga', 'nn', 'brain'];

@Component({
  selector: 'app-queens-solver',
  standalone: true,
  imports: [
    FormControlsComponent,
    ResultsBoardComponent,
    LoadingStateComponent,
    NoSolutionAlertComponent,
    TrainingChartComponent,
    ChampionsTableComponent,
    EmptyStateComponent,
    LucideAngularModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './queens-solver.component.html',
  styleUrls: ['./queens-solver.component.scss']
})
export class QueensSolverComponent implements OnInit, OnDestroy {
  protected readonly store = inject(QueensSolverStore);
  private readonly orchestrator = inject(SolverOrchestratorService);
  private readonly persistence = inject(PersistenceService);
  private readonly dialog = inject(Dialog);

  protected readonly evolveFromSeed = signal(true);
  protected readonly demoQueue = signal<AlgorithmType[]>([]);
  protected readonly championsView = signal<'cards' | 'table'>('cards');

  protected readonly zoomIcon = Maximize2;

  protected readonly champions = toSignal(from(this.persistence.getChampions()), { initialValue: [] as ChampionV2[] });

  protected readonly seedExists = computed(() => {
    return this.champions().some(c => c.algorithm === 'ga' && c.n === this.store.n());
  });

  protected readonly hasChart = computed(() => {
    const algo = this.store.algorithm();
    if (algo === 'ga') return this.store.evolutionHistory().length > 0;
    if (algo === 'nn') return this.store.trainingHistory().length > 0;
    if (algo === 'brain') return this.store.brainHistory().length > 0;
    return false;
  });

  async ngOnInit(): Promise<void> {
    const prefs = await this.persistence.getPreferences();
    this.store.setN(prefs.lastQueensCount);
  }

  ngOnDestroy(): void {
    this.orchestrator.cancel();
  }

  protected onNChange(n: number): void {
    this.store.setN(n);
    void this.persistence.setPreference('lastQueensCount', n);
  }

  protected onRun(payload: { algorithm: AlgorithmType; useSeed: boolean }): void {
    void this.runWithOptionalSeed(payload.algorithm, payload.useSeed);
  }

  private async runWithOptionalSeed(algorithm: AlgorithmType, useSeed: boolean): Promise<void> {
    let seed: number[][] | undefined;
    if (useSeed && algorithm === 'ga') {
      const champ = await this.persistence.getBestChampion('ga', this.store.n());
      seed = champ?.board;
    }
    this.orchestrator.solve(algorithm, this.store.n(), seed);
    void this.persistence.setPreference('lastAlgorithm', algorithm);
  }

  protected onCancel(): void {
    this.orchestrator.cancel();
    this.store.cancel();
  }

  protected onDemo(): void {
    if (this.store.isRunning()) return;
    this.demoQueue.set([...DEMO_SEQUENCE]);
    this.dequeueAndRun();
  }

  private dequeueAndRun(): void {
    const queue = [...this.demoQueue()];
    const next = queue.shift();
    this.demoQueue.set(queue);
    if (!next) return;
    this.orchestrator.solve(next, this.store.n());
  }

  protected onViewChampion(c: ChampionV2): void {
    this.store.loadFromChampion({
      algorithm: c.algorithm,
      n: c.n,
      board: c.board,
      solveTime: c.solveTime,
      generations: c.generations,
      iterations: c.iterations,
      evolutionHistory: c.evolutionHistory,
      trainingHistory: c.trainingHistory,
      brainHistory: c.brainHistory
    });
  }

  protected async onRemoveChampion(c: ChampionV2): Promise<void> {
    await this.persistence.deleteChampion(c.id);
    location.reload();
  }

  protected async onClearAll(): Promise<void> {
    if (!confirm('Apagar todos os campeões? Esta ação não pode ser desfeita.')) return;
    await this.persistence.clearAllChampions();
    location.reload();
  }

  protected openZoom(): void {
    const board = this.store.board();
    const algorithm = this.store.algorithm();
    if (!board || !algorithm) return;

    const data: BoardZoomData = {
      board,
      algorithm,
      solveTime: this.store.solveTime(),
      generations: this.store.generations() || null,
      iterations: this.store.iterations() || null
    };

    this.dialog.open<void, BoardZoomData>(BoardZoomDialogComponent, {
      data,
      hasBackdrop: true,
      backdropClass: 'nq-dialog-backdrop',
      panelClass: 'nq-dialog-panel',
      autoFocus: 'first-tabbable',
      restoreFocus: true
    });
  }
}
