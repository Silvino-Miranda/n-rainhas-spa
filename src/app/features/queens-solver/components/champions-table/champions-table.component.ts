import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { LucideAngularModule, Trophy, Eye, Trash2, LayoutGrid, Table as TableIcon } from 'lucide-angular';
import { ALGORITHM_LABELS, type AlgorithmType, type ChampionV2 } from '../../../../shared/models/algorithm.types';

type View = 'cards' | 'table';
type SortKey =
  | 'time-asc'
  | 'time-desc'
  | 'n-asc'
  | 'n-desc'
  | 'algorithm'
  | 'date-desc'
  | 'date-asc';

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
  protected readonly sortBy = signal<SortKey>('time-asc');

  protected readonly algorithms: ('all' | AlgorithmType)[] = ['all', 'backtracking', 'ga', 'nn', 'brain'];
  protected readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'time-asc', label: 'Tempo (mais rápido)' },
    { key: 'time-desc', label: 'Tempo (mais lento)' },
    { key: 'n-asc', label: 'N crescente' },
    { key: 'n-desc', label: 'N decrescente' },
    { key: 'algorithm', label: 'Algoritmo (A→Z)' },
    { key: 'date-desc', label: 'Mais recente' },
    { key: 'date-asc', label: 'Mais antigo' }
  ];

  protected readonly filtered = computed(() => {
    const list = this.champions();
    const fa = this.filterAlgorithm();
    const fn = this.filterN();
    const filtered = list.filter(
      c => (fa === 'all' || c.algorithm === fa) && (fn === null || c.n === fn)
    );
    const sorted = [...filtered];
    switch (this.sortBy()) {
      case 'time-asc':
        sorted.sort((a, b) => a.solveTime - b.solveTime);
        break;
      case 'time-desc':
        sorted.sort((a, b) => b.solveTime - a.solveTime);
        break;
      case 'n-asc':
        sorted.sort((a, b) => a.n - b.n || a.solveTime - b.solveTime);
        break;
      case 'n-desc':
        sorted.sort((a, b) => b.n - a.n || a.solveTime - b.solveTime);
        break;
      case 'algorithm':
        sorted.sort((a, b) => a.algorithm.localeCompare(b.algorithm) || a.n - b.n);
        break;
      case 'date-desc':
        sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'date-asc':
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
    }
    return sorted;
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
