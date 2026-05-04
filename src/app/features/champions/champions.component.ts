import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { ChampionsTableComponent } from '../queens-solver/components/champions-table/champions-table.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PersistenceService } from '../../data-access/persistence.service';
import type { ChampionV2 } from '../../shared/models/algorithm.types';

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
          (viewSolution)="redirect()"
          (removeChampion)="onRemove($event)"
          (clearAll)="onClearAll()"
          (viewChange)="view.set($event)"
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
export class ChampionsComponent {
  private readonly persistence = inject(PersistenceService);
  protected readonly view = signal<'cards' | 'table'>('cards');
  protected readonly champions = toSignal(from(this.persistence.getChampions()), { initialValue: [] as ChampionV2[] });

  protected redirect(): void {
    location.href = '/';
  }

  protected async onRemove(c: ChampionV2): Promise<void> {
    await this.persistence.deleteChampion(c.id);
    location.reload();
  }

  protected async onClearAll(): Promise<void> {
    if (!confirm('Apagar todos os campeões? Esta ação não pode ser desfeita.')) return;
    await this.persistence.clearAllChampions();
    location.reload();
  }
}
