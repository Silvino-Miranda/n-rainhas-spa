import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { NoSolutionAlertComponent } from './no-solution-alert.component';

describe('NoSolutionAlertComponent', () => {
  it('renders the title with the provided N', () => {
    const fixture = TestBed.createComponent(NoSolutionAlertComponent);
    fixture.componentRef.setInput('n', 3);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Sem solução para N=3');
  });

  it('describes why N=2/N=3 has no solution', () => {
    const fixture = TestBed.createComponent(NoSolutionAlertComponent);
    fixture.componentRef.setInput('n', 2);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('N=2');
    expect(text).toContain('N=3');
  });

  it('uses role=alert for assistive tech', () => {
    const fixture = TestBed.createComponent(NoSolutionAlertComponent);
    fixture.componentRef.setInput('n', 3);
    fixture.detectChanges();
    const alert = (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
  });
});
