import { Injectable, signal, effect, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'nq-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _theme = signal<Theme>('dark');
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

  initialize(): void {
    if (!this.isBrowser) return;
    let initial: Theme = 'dark';
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        initial = saved;
      } else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
        initial = 'light';
      }
    } catch {
      /* fall back to dark */
    }
    this._theme.set(initial);
  }

  toggle(): void {
    this._theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }

  set(theme: Theme): void {
    this._theme.set(theme);
  }
}
