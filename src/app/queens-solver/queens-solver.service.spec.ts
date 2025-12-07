import { TestBed } from '@angular/core/testing';

import { QueensSolverService } from './queens-solver.service';


describe('QueensSolverService', () => {
  let service: QueensSolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueensSolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Casos sem solução: n = 2 e n = 3
  it('should return null for n = 2 (no solution exists)', () => {
    expect(service.solve(2)).toBeNull();
  });

  it('should return null for n = 3 (no solution exists)', () => {
    expect(service.solve(3)).toBeNull();
  });

  // Caso trivial: n = 1
  it('should solve for n = 1', () => {
    const result = service.solve(1);
    expect(result).toEqual([[1]]);
  });

  // Casos com solução
  it('should solve for n = 4', () => {
    const result = service.solve(4);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(4);
    expect(isValidSolution(result!)).toBeTrue();
  });

  it('should solve for n = 5', () => {
    const result = service.solve(5);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(5);
    expect(isValidSolution(result!)).toBeTrue();
  });

  it('should solve for n = 6', () => {
    const result = service.solve(6);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(6);
    expect(isValidSolution(result!)).toBeTrue();
  });

  it('should solve for n = 8 (classic problem)', () => {
    const result = service.solve(8);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(8);
    expect(isValidSolution(result!)).toBeTrue();
  });
});

/**
 * Função auxiliar para validar se uma solução é válida
 * Verifica se nenhuma rainha ataca outra
 */
function isValidSolution(board: number[][]): boolean {
  const n = board.length;
  const queens: [number, number][] = [];

  // Encontrar posições das rainhas
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] === 1) {
        queens.push([i, j]);
      }
    }
  }

  // Verificar se temos N rainhas
  if (queens.length !== n) {
    return false;
  }

  // Verificar se nenhuma rainha ataca outra
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const [r1, c1] = queens[i];
      const [r2, c2] = queens[j];

      // Mesma linha
      if (r1 === r2) return false;
      // Mesma coluna
      if (c1 === c2) return false;
      // Mesma diagonal
      if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) return false;
    }
  }

  return true;
}
