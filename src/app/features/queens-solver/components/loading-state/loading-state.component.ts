import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { AlgorithmType } from '../../../../shared/models/algorithm.types';

const LABELS: Record<AlgorithmType, string> = {
  backtracking: 'Calculando solução exata...',
  ga: 'Evoluindo populações...',
  nn: 'Treinando rede de Hopfield...',
  brain: 'Aprendendo padrões com Brain.js...'
};

@Component({
  selector: 'app-loading-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nq-loading" role="status" aria-live="polite">
      <svg class="nq-loading__ring" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="16" />
      </svg>
      <p class="nq-loading__text">{{ message() }}</p>
      @if (progress() > 0) {
        <div class="nq-loading__progress" role="progressbar"
          [attr.aria-valuenow]="progress()" aria-valuemin="0" aria-valuemax="100">
          <div class="nq-loading__progress-bar" [style.width.%]="progress()"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .nq-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--nq-space-4);
      padding: var(--nq-space-8);
      background: var(--nq-surface-card);
      border: 1px solid var(--nq-surface-border);
      border-radius: var(--nq-radius-lg);
    }
    .nq-loading__ring {
      width: 48px;
      height: 48px;
      animation: nq-spin 1.2s linear infinite;
    }
    .nq-loading__ring circle {
      fill: none;
      stroke: var(--nq-brand-primary);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-dasharray: 70 30;
    }
    .nq-loading__text {
      font-family: var(--nq-font-mono);
      font-size: var(--nq-text-sm);
      color: var(--nq-text-secondary);
    }
    .nq-loading__progress {
      width: 240px;
      max-width: 100%;
      height: 4px;
      background: var(--nq-surface-subtle);
      border-radius: var(--nq-radius-full);
      overflow: hidden;
    }
    .nq-loading__progress-bar {
      height: 100%;
      background: var(--nq-brand-primary);
      transition: width var(--nq-duration-base) var(--nq-ease-standard);
    }
    @keyframes nq-spin { to { transform: rotate(360deg); } }
  `]
})
export class LoadingStateComponent {
  readonly algorithm = input<AlgorithmType | null>(null);
  readonly progress = input(0);

  protected readonly message = computed(() => {
    const algo = this.algorithm();
    return algo ? LABELS[algo] : 'Processando...';
  });
}
