import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AlgorithmCardComponent } from './algorithm-card.component';

describe('AlgorithmCardComponent', () => {
  it('renders the GA label and description', () => {
    const fixture = TestBed.createComponent(AlgorithmCardComponent);
    fixture.componentRef.setInput('algorithm', 'ga');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Algoritmo Genético');
    expect(text).toContain('Evolução');
  });

  it('emits run when the CTA is clicked', () => {
    const fixture = TestBed.createComponent(AlgorithmCardComponent);
    fixture.componentRef.setInput('algorithm', 'backtracking');
    fixture.detectChanges();
    let received: string | null = null;
    fixture.componentInstance.run.subscribe(v => (received = v));
    const cta = (fixture.nativeElement as HTMLElement).querySelector('.nq-algo-card__cta') as HTMLButtonElement;
    cta.click();
    expect(received).toBe('backtracking');
  });

  it('renders the cancel button while running', () => {
    const fixture = TestBed.createComponent(AlgorithmCardComponent);
    fixture.componentRef.setInput('algorithm', 'nn');
    fixture.componentRef.setInput('isRunning', true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.nq-algo-card__cancel')).not.toBeNull();
    expect(root.querySelector('.nq-algo-card__cta')).toBeNull();
  });

  it('emits cancel when the cancel button is pressed', () => {
    const fixture = TestBed.createComponent(AlgorithmCardComponent);
    fixture.componentRef.setInput('algorithm', 'brain');
    fixture.componentRef.setInput('isRunning', true);
    fixture.detectChanges();
    let received: string | null = null;
    fixture.componentInstance.cancel.subscribe(v => (received = v));
    const btn = (fixture.nativeElement as HTMLElement).querySelector('.nq-algo-card__cancel') as HTMLButtonElement;
    btn.click();
    expect(received).toBe('brain');
  });
});
