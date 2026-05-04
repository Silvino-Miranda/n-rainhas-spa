import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="nq-empty">
      <svg class="nq-empty__art" viewBox="0 0 96 96" aria-hidden="true">
        @for (row of rows; track $index; let r = $index) {
          @for (col of rows; track $index; let c = $index) {
            <rect
              [attr.x]="c * 24"
              [attr.y]="r * 24"
              width="24" height="24"
              [attr.fill]="(r === accentRow && c === accentCol) ? 'var(--nq-brand-primary)' : 'transparent'"
              [attr.fill-opacity]="(r === accentRow && c === accentCol) ? '0.25' : 0"
              stroke="var(--nq-surface-border)"
            />
          }
        }
      </svg>
      <h3 class="nq-empty__title">{{ title() }}</h3>
      <p class="nq-empty__description">{{ description() }}</p>
    </div>
  `,
  styles: [`
    .nq-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--nq-space-3);
      padding: var(--nq-space-10) var(--nq-space-5);
      text-align: center;
      color: var(--nq-text-secondary);
    }
    .nq-empty__art { width: 96px; height: 96px; }
    .nq-empty__title {
      font-family: var(--nq-font-display);
      font-size: var(--nq-text-xl);
      color: var(--nq-text-primary);
    }
    .nq-empty__description {
      max-width: 320px;
      font-size: var(--nq-text-sm);
    }
  `]
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();

  protected readonly rows = [0, 1, 2, 3];
  protected readonly accentRow = 0;
  protected readonly accentCol = 3;
}
