import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent } from './shared/ui/app-shell/app-shell.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-shell>
      <router-outlet />
    </app-shell>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: var(--nq-surface-bg);
      color: var(--nq-text-primary);
    }
  `]
})
export class AppComponent {}
