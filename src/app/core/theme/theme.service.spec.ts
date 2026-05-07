import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
  });

  it('starts in dark when no preference is saved', () => {
    const svc = TestBed.inject(ThemeService);
    expect(svc.theme()).toBe('dark');
  });

  it('reads a saved theme from localStorage on instantiation', () => {
    localStorage.setItem('nq-theme', 'light');
    const svc = TestBed.inject(ThemeService);
    expect(svc.theme()).toBe('light');
  });

  it('toggle flips between dark and light', () => {
    const svc = TestBed.inject(ThemeService);
    svc.toggle();
    expect(svc.theme()).toBe('light');
    svc.toggle();
    expect(svc.theme()).toBe('dark');
  });

  it('set persists the choice to localStorage and mirrors data-theme', async () => {
    const svc = TestBed.inject(ThemeService);
    svc.set('light');
    // Allow the effect microtask to flush.
    await Promise.resolve();
    TestBed.tick();
    expect(localStorage.getItem('nq-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
