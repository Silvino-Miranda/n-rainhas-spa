import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { ChampionsTableComponent } from '../queens-solver/components/champions-table/champions-table.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { openConfirmDialog } from '../../shared/ui/confirm-dialog/confirm-dialog.component';
import { PersistenceService } from '../../data-access/persistence.service';
import { QueensSolverStore } from '../queens-solver/state/queens-solver.store';
import type { ChampionsView, ChampionV2 } from '../../shared/models/algorithm.types';

@Component({
  selector: 'app-champions',
  standalone: true,
  imports: [ChampionsTableComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nq-content-grid">
      <header class="nq-champions-page__hero">
        <span class="nq-champions-page__eyebrow">Histórico</span>
        <h1>Campeões</h1>
        <p>Resultados persistidos localmente em IndexedDB. Cada par (algoritmo, N) guarda o melhor.</p>
      </header>

      @if (champions().length === 0) {
        <app-empty-state
          title="Nenhum campeão ainda."
          description="Volte ao Solver e execute um algoritmo para registrar o primeiro resultado."
        />
      } @else {
        <app-champions-table
          [champions]="champions()"
          [view]="view()"
          (viewSolution)="onView($event)"
          (removeChampion)="onRemove($event)"
          (clearAll)="onClearAll()"
          (viewChange)="onViewChange($event)"
        />
      }
    </div>
  `,
  styles: [`
    .nq-content-grid {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--nq-space-6);
      display: flex;
      flex-direction: column;
      gap: var(--nq-space-8);
    }
    .nq-champions-page__hero {
      display: flex;
      flex-direction: column;
      gap: var(--nq-space-2);
    }
    .nq-champions-page__eyebrow {
      font-family: var(--nq-font-mono);
      font-size: var(--nq-text-xs);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--nq-brand-primary);
    }
    .nq-champions-page__hero h1 {
      font-family: var(--nq-font-display);
      font-size: var(--nq-text-4xl);
    }
    .nq-champions-page__hero p {
      color: var(--nq-text-secondary);
      max-width: 60ch;
    }
  `]
})
export class ChampionsComponent implements OnInit {
  private readonly persistence = inject(PersistenceService);
  private readonly router = inject(Router);
  private readonly store = inject(QueensSolverStore);
  private readonly dialog = inject(Dialog);

  protected readonly view = signal<ChampionsView>('cards');
  protected readonly champions = signal<ChampionV2[]>([]);

  constructor() {
    effect(() => {
      this.persistence.changeTick();
      void this.persistence.getChampions().then(list => this.champions.set(list));
    });
  }

  async ngOnInit(): Promise<void> {
    const prefs = await this.persistence.getPreferences();
    this.view.set(prefs.championsView ?? 'cards');
  }

  protected onViewChange(view: ChampionsView): void {
    this.view.set(view);
    void this.persistence.setPreference('championsView', view);
  }

  protected onView(c: ChampionV2): void {
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
    void this.router.navigateByUrl('/');
  }

  protected async onRemove(c: ChampionV2): Promise<void> {
    await this.persistence.deleteChampion(c.id);
  }

  protected async onClearAll(): Promise<void> {
    const confirmed = await openConfirmDialog(this.dialog, {
      title: 'Apagar todos os campeões?',
      message: 'Esta ação remove permanentemente todos os campeões salvos para todos os algoritmos e tamanhos de N. Não pode ser desfeita.',
      confirmLabel: 'Apagar tudo',
      cancelLabel: 'Cancelar',
      tone: 'danger'
    });
    if (!confirmed) return;
    await this.persistence.clearAllChampions();
  }
}
