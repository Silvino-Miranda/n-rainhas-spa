import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { LucideAngularModule, X } from 'lucide-angular';
import { ResultsBoardComponent } from '../results-board/results-board.component';
import type { AlgorithmType } from '../../../../shared/models/algorithm.types';

export interface BoardZoomData {
  board: number[][];
  algorithm: AlgorithmType;
  solveTime: number;
  generations: number | null;
  iterations: number | null;
}

@Component({
  selector: 'app-board-zoom-dialog',
  standalone: true,
  imports: [ResultsBoardComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nq-zoom" role="dialog" aria-modal="true" aria-labelledby="nq-zoom-title">
      <header class="nq-zoom__header">
        <h2 id="nq-zoom-title">Tabuleiro ampliado</h2>
        <button
          type="button"
          class="nq-zoom__close"
          (click)="dialogRef.close()"
          aria-label="Fechar"
        >
          <lucide-icon [name]="closeIcon" [size]="18" aria-hidden="true"></lucide-icon>
        </button>
      </header>
      <div class="nq-zoom__body">
        <app-results-board
          [board]="data.board"
          [algorithm]="data.algorithm"
          [solveTime]="data.solveTime"
          [generations]="data.generations"
          [iterations]="data.iterations"
        />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .nq-zoom {
      display: flex;
      flex-direction: column;
      max-width: 80vw;
      max-height: 80vh;
      width: min(960px, 80vw);
      background: var(--nq-surface-card);
      border: 1px solid var(--nq-surface-border);
      border-radius: var(--nq-radius-lg);
      box-shadow: var(--nq-shadow-4);
      overflow: hidden;
    }
    .nq-zoom__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--nq-space-3) var(--nq-space-5);
      border-bottom: 1px solid var(--nq-surface-border);
    }
    .nq-zoom__header h2 {
      font-family: var(--nq-font-display);
      font-size: var(--nq-text-xl);
      color: var(--nq-text-primary);
    }
    .nq-zoom__close {
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
    .nq-zoom__close:hover {
      background: var(--nq-surface-subtle);
      color: var(--nq-text-primary);
    }
    .nq-zoom__body {
      flex: 1;
      overflow: auto;
      padding: var(--nq-space-5);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class BoardZoomDialogComponent {
  protected readonly dialogRef = inject<DialogRef<void>>(DialogRef);
  protected readonly data = inject<BoardZoomData>(DIALOG_DATA);
  protected readonly closeIcon = X;
}
