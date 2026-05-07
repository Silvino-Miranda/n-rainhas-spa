import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  LucideAngularModule,
  Minus,
  Plus,
  Sparkles,
  X,
  GitMerge,
  Dna,
  Brain,
  Network,
  Sprout
} from 'lucide-angular';
import type { AlgorithmType } from '../../../../shared/models/algorithm.types';

const ALGORITHMS: AlgorithmType[] = ['backtracking', 'ga', 'nn', 'brain'];
const MIN_QUEENS = 1;
const MAX_QUEENS = 15;

const ALGO_LABELS: Record<AlgorithmType, string> = {
  backtracking: 'Backtracking',
  ga: 'Algoritmo Genético',
  nn: 'Hopfield Híbrida',
  brain: 'Brain.js'
};

@Component({
  selector: 'app-form-controls',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-controls.component.html',
  styleUrls: ['./form-controls.component.scss']
})
export class FormControlsComponent {
  readonly n = input.required<number>();
  readonly isRunning = input(false);
  readonly runningAlgorithm = input<AlgorithmType | null>(null);
  readonly progress = input(0);
  readonly hasSeed = input(false);
  readonly evolveFromSeed = input(true);

  readonly nChange = output<number>();
  readonly run = output<{ algorithm: AlgorithmType; useSeed: boolean }>();
  readonly cancel = output<AlgorithmType>();
  readonly evolveFromSeedChange = output<boolean>();
  readonly demo = output<void>();

  protected readonly minusIcon = Minus;
  protected readonly plusIcon = Plus;
  protected readonly demoIcon = Sparkles;
  protected readonly cancelIcon = X;
  protected readonly seedIcon = Sprout;

  protected readonly algorithms = ALGORITHMS;

  protected readonly invalid = computed(() => {
    const value = this.n();
    return value < MIN_QUEENS || value > MAX_QUEENS || Number.isNaN(value);
  });

  protected readonly errorMessage = computed(() => {
    const value = this.n();
    if (Number.isNaN(value)) return 'Número inválido';
    if (value < MIN_QUEENS) return `N >= ${MIN_QUEENS}`;
    if (value > MAX_QUEENS) return `N <= ${MAX_QUEENS}`;
    return '';
  });

  protected updateN(raw: string | number): void {
    const next = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
    if (Number.isNaN(next)) return;
    this.nChange.emit(Math.min(MAX_QUEENS, Math.max(MIN_QUEENS, next)));
  }

  protected step(delta: number): void {
    this.updateN(this.n() + delta);
  }

  protected dispatchRun(algorithm: AlgorithmType): void {
    if (this.invalid() || this.isRunning()) return;
    this.run.emit({ algorithm, useSeed: algorithm === 'ga' && this.hasSeed() && this.evolveFromSeed() });
  }

  protected algorithmIcon(algorithm: AlgorithmType): unknown {
    switch (algorithm) {
      case 'backtracking': return GitMerge;
      case 'ga':           return Dna;
      case 'nn':           return Brain;
      case 'brain':        return Network;
    }
  }

  protected algorithmLabel(algorithm: AlgorithmType): string {
    return ALGO_LABELS[algorithm];
  }

  protected algorithmColor(algorithm: AlgorithmType): string {
    return `var(--nq-chart-${algorithm})`;
  }

  protected isAlgorithmRunning(algorithm: AlgorithmType): boolean {
    return this.isRunning() && this.runningAlgorithm() === algorithm;
  }

  protected isAlgorithmDisabled(_algorithm: AlgorithmType): boolean {
    return this.isRunning() || this.invalid();
  }

  protected toggleSeed(): void {
    this.evolveFromSeedChange.emit(!this.evolveFromSeed());
  }
}
