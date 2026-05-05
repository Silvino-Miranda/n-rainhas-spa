import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LucideAngularModule, AlertTriangle } from 'lucide-angular';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="nq-confirm"
      [class.is-danger]="data.tone === 'danger'"
      role="alertdialog"
      aria-modal="true"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="messageId"
    >
      <header class="nq-confirm__header">
        <span class="nq-confirm__icon" aria-hidden="true">
          <lucide-icon [name]="alertIcon" [size]="22" [strokeWidth]="2"></lucide-icon>
        </span>
        <h2 [id]="titleId" class="nq-confirm__title">{{ data.title }}</h2>
      </header>
      <p [id]="messageId" class="nq-confirm__message">{{ data.message }}</p>
      <footer class="nq-confirm__footer">
        <button
          type="button"
          class="nq-confirm__btn nq-confirm__btn--ghost"
          (click)="dialogRef.close(false)"
        >
          {{ data.cancelLabel ?? 'Cancelar' }}
        </button>
        <button
          type="button"
          class="nq-confirm__btn nq-confirm__btn--primary"
          (click)="dialogRef.close(true)"
          autofocus
        >
          {{ data.confirmLabel ?? 'Confirmar' }}
        </button>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .nq-confirm {
      width: min(440px, 92vw);
      background: var(--nq-surface-card);
      border: 1px solid var(--nq-surface-border);
      border-radius: var(--nq-radius-lg);
      box-shadow: var(--nq-shadow-4);
      padding: var(--nq-space-6);
      display: flex;
      flex-direction: column;
      gap: var(--nq-space-4);
    }
    .nq-confirm__header {
      display: flex;
      align-items: center;
      gap: var(--nq-space-3);
    }
    .nq-confirm__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--nq-radius-full);
      background: color-mix(in oklab, var(--nq-warning) 18%, transparent);
      color: var(--nq-warning);
    }
    .nq-confirm.is-danger .nq-confirm__icon {
      background: color-mix(in oklab, var(--nq-danger) 18%, transparent);
      color: var(--nq-danger);
    }
    .nq-confirm__title {
      font-family: var(--nq-font-display);
      font-size: var(--nq-text-xl);
      color: var(--nq-text-primary);
      line-height: var(--nq-leading-tight);
    }
    .nq-confirm__message {
      color: var(--nq-text-secondary);
      font-size: var(--nq-text-sm);
      line-height: var(--nq-leading-relaxed);
    }
    .nq-confirm__footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--nq-space-2);
      margin-top: var(--nq-space-2);
    }
    .nq-confirm__btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--nq-space-2) var(--nq-space-5);
      border-radius: var(--nq-radius-md);
      font-family: var(--nq-font-body);
      font-size: var(--nq-text-sm);
      font-weight: var(--nq-weight-semi);
      transition: filter var(--nq-duration-fast) var(--nq-ease-standard),
                  background var(--nq-duration-fast) var(--nq-ease-standard),
                  color var(--nq-duration-fast) var(--nq-ease-standard);
    }
    .nq-confirm__btn--ghost {
      background: transparent;
      border: 1px solid var(--nq-surface-border);
      color: var(--nq-text-secondary);
    }
    .nq-confirm__btn--ghost:hover {
      color: var(--nq-text-primary);
      background: var(--nq-surface-subtle);
    }
    .nq-confirm__btn--primary {
      background: var(--nq-brand-primary);
      color: var(--nq-text-inverse);
    }
    .nq-confirm__btn--primary:hover {
      filter: brightness(1.06);
    }
    .nq-confirm.is-danger .nq-confirm__btn--primary {
      background: var(--nq-danger);
      color: #fff;
    }
  `]
})
export class ConfirmDialogComponent {
  protected readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly alertIcon = AlertTriangle;
  protected readonly titleId = `nq-confirm-title-${Math.random().toString(36).slice(2, 8)}`;
  protected readonly messageId = `nq-confirm-message-${Math.random().toString(36).slice(2, 8)}`;
}

export function openConfirmDialog(dialog: Dialog, data: ConfirmDialogData): Promise<boolean> {
  return new Promise(resolve => {
    const ref = dialog.open<boolean, ConfirmDialogData>(ConfirmDialogComponent, {
      data,
      hasBackdrop: true,
      backdropClass: 'nq-dialog-backdrop',
      panelClass: 'nq-dialog-panel',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      disableClose: false
    });
    ref.closed.subscribe(result => resolve(result === true));
  });
}
