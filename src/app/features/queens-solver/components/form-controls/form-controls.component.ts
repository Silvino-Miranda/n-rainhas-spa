import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { LucideAngularModule, Minus, Plus, Sparkles } from 'lucide-angular';
import { AlgorithmCardComponent } from '../algorithm-card/algorithm-card.component';
import type { AlgorithmType } from '../../../../shared/models/algorithm.types';

const ALGORITHMS: AlgorithmType[] = ['backtracking', 'ga', 'nn', 'brain'];
const MIN_QUEENS = 1;
const MAX_QUEENS = 15;

@Component({
  selector: 'app-form-controls',
  standalone: true,
  imports: [LucideAngularModule, AlgorithmCardComponent],
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
  protected readonly algorithms = ALGORITHMS;

  protected readonly invalid = computed(() => {
    const value = this.n();
    return value < MIN_QUEENS || value > MAX_QUEENS || Number.isNaN(value);
  });

  protected readonly errorMessage = computed(() => {
    const value = this.n();
    if (Number.isNaN(value)) return 'Informe um número válido.';
    if (value < MIN_QUEENS) return `N deve ser maior ou igual a ${MIN_QUEENS}.`;
    if (value > MAX_QUEENS) return `N deve ser menor ou igual a ${MAX_QUEENS}.`;
    return '';
  });

  protected updateN(raw: string | number): void {
    const next = typeof raw === 'number' ? raw : Number.parseInt(raw, 10);
    if (Number.isNaN(next)) return;
    this.nChange.emit(Math.min(MAX_QUEENS, Math.max(MIN_QUEENS, next)));
  }

  protected step(delta: number): void {
    this.updateN(this.n() + delta);
  }

  protected dispatchRun(algorithm: AlgorithmType): void {
    if (this.invalid()) return;
    this.run.emit({ algorithm, useSeed: algorithm === 'ga' && this.hasSeed() && this.evolveFromSeed() });
  }

  protected isAlgorithmRunning(algorithm: AlgorithmType): boolean {
    return this.isRunning() && this.runningAlgorithm() === algorithm;
  }

  protected isAlgorithmDisabled(algorithm: AlgorithmType): boolean {
    return (this.isRunning() && this.runningAlgorithm() !== algorithm) || this.invalid();
  }
}
