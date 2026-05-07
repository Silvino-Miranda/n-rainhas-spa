import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, GitMerge, Dna, Brain, Network, Loader2, X } from 'lucide-angular';
import type { AlgorithmType } from '../../../../shared/models/algorithm.types';

interface AlgorithmMeta {
  label: string;
  description: string;
}

const META: Record<AlgorithmType, AlgorithmMeta> = {
  backtracking: { label: 'Backtracking', description: 'Recursão exata. Sempre encontra.' },
  ga: { label: 'Algoritmo Genético', description: 'Evolução iterativa. Aprende com gerações.' },
  nn: { label: 'Hopfield Híbrida', description: 'Rede neural com simulated annealing.' },
  brain: { label: 'Brain.js', description: 'Feedforward treinada + heurística.' }
};

@Component({
  selector: 'app-algorithm-card',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="nq-algo-card" [class.is-running]="isRunning()" [class.is-disabled]="disabled()">
      <header class="nq-algo-card__header">
        <span class="nq-algo-card__icon" [style.--nq-algo-color]="colorVar()" aria-hidden="true">
          <lucide-icon [name]="icon()" [size]="28" [strokeWidth]="1.5"></lucide-icon>
        </span>
        <div class="nq-algo-card__heading">
          <h3 class="nq-algo-card__title">{{ meta().label }}</h3>
          <p class="nq-algo-card__description">{{ meta().description }}</p>
        </div>
      </header>

      @if (isRunning() && progress() > 0) {
        <div class="nq-algo-card__progress" role="progressbar"
          [attr.aria-valuenow]="progress()" aria-valuemin="0" aria-valuemax="100">
          <div class="nq-algo-card__progress-bar" [style.width.%]="progress()"></div>
        </div>
      }

      <footer class="nq-algo-card__footer">
        @if (!isRunning()) {
          <button
            type="button"
            class="nq-algo-card__cta"
            [disabled]="disabled()"
            (click)="run.emit(algorithm())"
          >
            Executar
          </button>
        } @else {
          <button
            type="button"
            class="nq-algo-card__cancel"
            (click)="cancel.emit(algorithm())"
            aria-label="Cancelar execução"
          >
            <lucide-icon [name]="cancelIcon" [size]="16" aria-hidden="true"></lucide-icon>
            Cancelar
          </button>
        }
      </footer>
    </article>
  `,
  styleUrls: ['./algorithm-card.component.scss']
})
export class AlgorithmCardComponent {
  readonly algorithm = input.required<AlgorithmType>();
  readonly disabled = input(false);
  readonly isRunning = input(false);
  readonly progress = input(0);

  readonly run = output<AlgorithmType>();
  readonly cancel = output<AlgorithmType>();

  protected readonly cancelIcon = X;

  protected readonly meta = computed(() => META[this.algorithm()]);

  protected readonly icon = computed(() => {
    switch (this.algorithm()) {
      case 'backtracking': return GitMerge;
      case 'ga':           return Dna;
      case 'nn':           return Brain;
      case 'brain':        return Network;
    }
  });

  protected readonly loaderIcon = Loader2;

  protected readonly colorVar = computed(() => `var(--nq-chart-${this.algorithm()})`);
}
