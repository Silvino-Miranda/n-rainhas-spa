import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, Ban } from 'lucide-angular';

@Component({
  selector: 'app-no-solution-alert',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nq-no-solution" role="alert" aria-live="assertive">
      <span class="nq-no-solution__icon" aria-hidden="true">
        <lucide-icon [name]="banIcon" [size]="24" [strokeWidth]="2"></lucide-icon>
      </span>
      <div class="nq-no-solution__body">
        <h3 class="nq-no-solution__title">Sem solução para N={{ n() }}</h3>
        <p class="nq-no-solution__description">
          O problema das N-rainhas não tem solução para N=2 ou N=3. Tente N=1 ou N≥4.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .nq-no-solution {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--nq-space-4);
      padding: var(--nq-space-5);
      background: var(--nq-danger-bg);
      border-left: 3px solid var(--nq-danger);
      border-radius: var(--nq-radius-md);
      animation: nq-fade var(--nq-duration-base) var(--nq-ease-decelerate);
    }
    .nq-no-solution__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--nq-radius-full);
      background: color-mix(in oklab, var(--nq-danger) 18%, transparent);
      color: var(--nq-danger);
    }
    .nq-no-solution__title {
      font-family: var(--nq-font-display);
      font-size: var(--nq-text-xl);
      color: var(--nq-text-primary);
    }
    .nq-no-solution__description {
      margin-top: var(--nq-space-1);
      color: var(--nq-text-secondary);
      font-size: var(--nq-text-sm);
    }
    @keyframes nq-fade { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class NoSolutionAlertComponent {
  readonly n = input.required<number>();
  protected readonly banIcon = Ban;
}
