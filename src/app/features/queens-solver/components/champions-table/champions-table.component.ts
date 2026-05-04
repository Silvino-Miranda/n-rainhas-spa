import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, Trophy, Eye, Trash2, LayoutGrid, Table as TableIcon } from 'lucide-angular';
import { ALGORITHM_LABELS, type AlgorithmType, type ChampionV2 } from '../../../../shared/models/algorithm.types';

type View = 'cards' | 'table';

@Component({
  selector: 'app-champions-table',
  standalone: true,
  imports: [LucideAngularModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './champions-table.component.html',
  styleUrls: ['./champions-table.component.scss']
})
export class ChampionsTableComponent {
  readonly champions = input.required<ChampionV2[]>();
  readonly view = input<View>('cards');

  readonly viewSolution = output<ChampionV2>();
  readonly removeChampion = output<ChampionV2>();
  readonly clearAll = output<void>();
  readonly viewChange = output<View>();

  protected readonly trophyIcon = Trophy;
  protected readonly eyeIcon = Eye;
  protected readonly trashIcon = Trash2;
  protected readonly gridIcon = LayoutGrid;
  protected readonly tableIcon = TableIcon;

  protected readonly filterAlgorithm = signal<AlgorithmType | 'all'>('all');
  protected readonly filterN = signal<number | null>(null);

  protected readonly algorithms: ('all' | AlgorithmType)[] = ['all', 'backtracking', 'ga', 'nn', 'brain'];

  protected readonly filtered = computed(() => {
    const list = this.champions();
    const fa = this.filterAlgorithm();
    const fn = this.filterN();
    return list.filter(c => (fa === 'all' || c.algorithm === fa) && (fn === null || c.n === fn));
  });

  protected algorithmLabel(algorithm: AlgorithmType | 'all'): string {
    return algorithm === 'all' ? 'Todos' : ALGORITHM_LABELS[algorithm];
  }

  protected metricFor(c: ChampionV2): string {
    if (c.algorithm === 'ga' && c.generations != null) return `${c.generations} gerações`;
    if ((c.algorithm === 'nn' || c.algorithm === 'brain') && c.iterations != null) return `${c.iterations} iterações`;
    return '—';
  }

  protected colorFor(algorithm: AlgorithmType): string {
    return `var(--nq-chart-${algorithm})`;
  }

  protected uniqueNs(): number[] {
    const set = new Set(this.champions().map(c => c.n));
    return [...set].sort((a, b) => a - b);
  }
}
