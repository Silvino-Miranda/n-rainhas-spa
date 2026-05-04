import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ALGORITHM_LABELS, type AlgorithmType } from '../../../../shared/models/algorithm.types';

@Component({
  selector: 'app-results-board',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './results-board.component.html',
  styleUrls: ['./results-board.component.scss']
})
export class ResultsBoardComponent {
  readonly board = input.required<number[][]>();
  readonly algorithm = input.required<AlgorithmType>();
  readonly solveTime = input(0);
  readonly generations = input<number | null>(null);
  readonly iterations = input<number | null>(null);

  protected readonly n = computed(() => this.board().length);
  protected readonly cellSize = computed(() => {
    const size = this.n();
    if (size <= 6) return 60;
    if (size <= 9) return 52;
    if (size <= 12) return 44;
    return 36;
  });

  protected readonly algorithmLabel = computed(() => ALGORITHM_LABELS[this.algorithm()]);

  protected readonly metricLabel = computed(() => {
    const algo = this.algorithm();
    if (algo === 'ga' && this.generations() != null) return `${this.generations()} gerações`;
    if ((algo === 'nn' || algo === 'brain') && this.iterations() != null) return `${this.iterations()} iterações`;
    return null;
  });

  protected isQueen(row: number, col: number): boolean {
    return this.board()[row]?.[col] === 1;
  }

  protected isLight(row: number, col: number): boolean {
    return (row + col) % 2 === 0;
  }

  protected queenIndex(_row: number, col: number): number {
    return col;
  }
}
