import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LoadingStateComponent } from './loading-state.component';

describe('LoadingStateComponent', () => {
  it('falls back to a generic label when no algorithm is provided', () => {
    const fixture = TestBed.createComponent(LoadingStateComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Processando');
  });

  it('renders the GA-specific label', () => {
    const fixture = TestBed.createComponent(LoadingStateComponent);
    fixture.componentRef.setInput('algorithm', 'ga');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Evoluindo');
  });

  it('shows the progress bar only when progress > 0', () => {
    const fixture = TestBed.createComponent(LoadingStateComponent);
    fixture.componentRef.setInput('algorithm', 'nn');
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.nq-loading__progress')).toBeNull();

    fixture.componentRef.setInput('progress', 42);
    fixture.detectChanges();
    expect(root.querySelector('.nq-loading__progress')).not.toBeNull();
    const bar = root.querySelector('.nq-loading__progress-bar') as HTMLElement;
    expect(bar.style.width).toBe('42%');
  });
});
