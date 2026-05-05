import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { LucideAngularModule, Minimize2 } from 'lucide-angular';
import { TrainingChartComponent } from '../training-chart/training-chart.component';
import type {
  AlgorithmType,
  BrainPoint,
  EvolutionPoint,
  TrainingPoint
} from '../../../../shared/models/algorithm.types';

export interface ChartExpandData {
  algorithm: AlgorithmType;
  evolutionHistory: EvolutionPoint[];
  trainingHistory: TrainingPoint[];
  brainHistory: BrainPoint[];
}

@Component({
  selector: 'app-chart-expand-dialog',
  standalone: true,
  imports: [LucideAngularModule, TrainingChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nq-chart-expand" role="dialog" aria-modal="true" aria-labelledby="nq-chart-expand-title">
      <header class="nq-chart-expand__header">
        <h2 id="nq-chart-expand-title">Gráfico ampliado</h2>
        <button
          type="button"
          class="nq-chart-expand__close"
          (click)="dialogRef.close()"
          aria-label="Fechar gráfico ampliado"
          title="Fechar"
        >
          <lucide-icon [name]="closeIcon" [size]="18" aria-hidden="true"></lucide-icon>
        </button>
      </header>
      <div class="nq-chart-expand__body">
        <app-training-chart
          [algorithm]="data.algorithm"
          [evolutionHistory]="data.evolutionHistory"
          [trainingHistory]="data.trainingHistory"
          [brainHistory]="data.brainHistory"
        />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .nq-chart-expand {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: var(--nq-surface-card);
      border: 1px solid var(--nq-surface-border);
      border-radius: var(--nq-radius-lg);
      box-shadow: var(--nq-shadow-4);
      overflow: hidden;
    }
    .nq-chart-expand__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--nq-space-3) var(--nq-space-5);
      border-bottom: 1px solid var(--nq-surface-border);
      flex: 0 0 auto;
    }
    .nq-chart-expand__header h2 {
      font-family: var(--nq-font-display);
      font-size: var(--nq-text-xl);
      color: var(--nq-text-primary);
    }
    .nq-chart-expand__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--nq-radius-full);
      color: var(--nq-text-secondary);
      transition: background var(--nq-duration-fast) var(--nq-ease-standard),
                  color var(--nq-duration-fast) var(--nq-ease-standard);
    }
    .nq-chart-expand__close:hover {
      background: var(--nq-surface-subtle);
      color: var(--nq-text-primary);
    }
    .nq-chart-expand__body {
      flex: 1 1 auto;
      padding: var(--nq-space-4);
      overflow: hidden;
      display: flex;
    }
    .nq-chart-expand__body ::ng-deep app-training-chart {
      flex: 1;
      width: 100%;
      height: 100%;
    }
    .nq-chart-expand__body ::ng-deep .nq-chart {
      flex: 1;
      width: 100%;
      height: 100%;
      border: none;
      box-shadow: none;
      padding: 0;
    }
    .nq-chart-expand__body ::ng-deep .nq-chart__canvas-wrapper {
      flex: 1 1 auto;
      height: auto !important;
      min-height: 0;
    }
  `]
})
export class ChartExpandDialogComponent {
  protected readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  protected readonly data = inject<ChartExpandData>(DIALOG_DATA);
  protected readonly closeIcon = Minimize2;
}
