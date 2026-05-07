import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ResultsBoardComponent } from './results-board.component';

const SOLUTION_4 = [
  [0, 0, 1, 0],
  [1, 0, 0, 0],
  [0, 0, 0, 1],
  [0, 1, 0, 0]
];

describe('ResultsBoardComponent', () => {
  it('renders a NxN grid with N queens', () => {
    const fixture = TestBed.createComponent(ResultsBoardComponent);
    fixture.componentRef.setInput('board', SOLUTION_4);
    fixture.componentRef.setInput('algorithm', 'backtracking');
    fixture.componentRef.setInput('solveTime', 1.5);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const cells = root.querySelectorAll('.nq-board__cell');
    expect(cells.length).toBe(16);
    const queens = root.querySelectorAll('.nq-board__cell.has-queen');
    expect(queens.length).toBe(4);
  });

  it('shows the algorithm label and solve time in the stats', () => {
    const fixture = TestBed.createComponent(ResultsBoardComponent);
    fixture.componentRef.setInput('board', SOLUTION_4);
    fixture.componentRef.setInput('algorithm', 'ga');
    fixture.componentRef.setInput('solveTime', 12.7);
    fixture.componentRef.setInput('generations', 42);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Algoritmo Genético');
    expect(text).toContain('12.7');
    expect(text).toContain('42 gerações');
  });

  it('targetSize forces the cell size to floor(target / N)', () => {
    const fixture = TestBed.createComponent(ResultsBoardComponent);
    fixture.componentRef.setInput('board', SOLUTION_4);
    fixture.componentRef.setInput('algorithm', 'backtracking');
    fixture.componentRef.setInput('solveTime', 0);
    fixture.componentRef.setInput('targetSize', 280);
    fixture.detectChanges();
    const grid = (fixture.nativeElement as HTMLElement).querySelector('.nq-board__grid') as HTMLElement;
    expect(grid.style.getPropertyValue('--nq-board-size')).toBe('70px');
  });

  it('switches to flex-row layout when statsPosition=beside', () => {
    const fixture = TestBed.createComponent(ResultsBoardComponent);
    fixture.componentRef.setInput('board', SOLUTION_4);
    fixture.componentRef.setInput('algorithm', 'backtracking');
    fixture.componentRef.setInput('solveTime', 0);
    fixture.componentRef.setInput('statsPosition', 'beside');
    fixture.detectChanges();
    const board = (fixture.nativeElement as HTMLElement).querySelector('.nq-board');
    expect(board?.classList.contains('is-beside')).toBe(true);
  });
});
