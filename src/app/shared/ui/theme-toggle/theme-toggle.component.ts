import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LucideAngularModule, Moon, Sun } from 'lucide-angular';
import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="nq-theme-toggle"
      (click)="theme.toggle()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-pressed]="theme.theme() === 'light'"
    >
      <lucide-icon [name]="iconFor()" [size]="20" aria-hidden="true"></lucide-icon>
    </button>
  `,
  styles: [`
    .nq-theme-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--nq-radius-full);
      color: var(--nq-text-secondary);
      transition: background var(--nq-duration-fast) var(--nq-ease-standard),
                  color var(--nq-duration-fast) var(--nq-ease-standard),
                  transform var(--nq-duration-base) var(--nq-ease-emphasized);
    }
    .nq-theme-toggle:hover {
      background: var(--nq-surface-subtle);
      color: var(--nq-brand-primary);
    }
    .nq-theme-toggle:active { transform: rotate(20deg); }
  `]
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
  private readonly moonIcon = Moon;
  private readonly sunIcon = Sun;

  protected readonly iconFor = computed(() => (this.theme.theme() === 'dark' ? this.moonIcon : this.sunIcon));
  protected readonly ariaLabel = computed(() =>
    this.theme.theme() === 'dark'
      ? 'Alternar tema. Atual: escuro. Mudar para claro.'
      : 'Alternar tema. Atual: claro. Mudar para escuro.'
  );
}
