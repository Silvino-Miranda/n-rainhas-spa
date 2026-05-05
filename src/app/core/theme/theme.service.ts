import { Injectable, signal, effect, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'nq-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // Resolve the initial theme synchronously so the constructor effect does
  // not overwrite the persisted value on its first run.
  private readonly _theme = signal<Theme>(this.resolveInitialTheme());
  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      const value = this._theme();
      this.doc.documentElement.setAttribute('data-theme', value);
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        /* storage may be unavailable (private mode) */
      }
    });
  }

  /** Kept for APP_INITIALIZER compatibility; initial value already resolved. */
  initialize(): void {
    /* no-op */
  }

  toggle(): void {
    this._theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }

  set(theme: Theme): void {
    this._theme.set(theme);
  }

  private resolveInitialTheme(): Theme {
    if (!this.isBrowser) return 'dark';
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* storage may be unavailable */
    }
    try {
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
    } catch {
      /* matchMedia may be unavailable */
    }
    return 'dark';
  }
}
