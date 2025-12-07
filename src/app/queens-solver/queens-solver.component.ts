import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QueensSolverService } from './queens-solver.service';

@Component({
  selector: 'app-queens-solver',
  templateUrl: './queens-solver.component.html',
  styleUrls: ['./queens-solver.component.scss']
})
export class QueensSolverComponent {
  form: FormGroup;
  
  // Estado da aplicação
  solution: number[][] | null = null;
  isLoading = false;
  noSolution = false;
  solveTime = 0;
  queensCount = 0;

  // Limites para o número de rainhas
  readonly MIN_QUEENS = 1;
  readonly MAX_QUEENS = 15; // Limitar para evitar travamento do navegador

  constructor(
    private formBuilder: FormBuilder,
    private queensSolver: QueensSolverService
  ) {
    this.form = this.formBuilder.group({
      queensNumber: [
        4, // valor padrão
        [
          Validators.required,
          Validators.min(this.MIN_QUEENS),
          Validators.max(this.MAX_QUEENS)
        ]
      ]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const queensNumber = this.form.get('queensNumber')?.value;
    this.solve(queensNumber);
  }

  solve(n: number): void {
    // Reset estado
    this.solution = null;
    this.noSolution = false;
    this.isLoading = true;
    this.queensCount = n;

    // Usar setTimeout para permitir que a UI atualize antes de resolver
    setTimeout(() => {
      const startTime = performance.now();
      const result = this.queensSolver.solve(n);
      const endTime = performance.now();
      
      this.solveTime = Math.round((endTime - startTime) * 100) / 100;
      this.isLoading = false;

      if (result) {
        this.solution = result;
        this.noSolution = false;
      } else {
        this.solution = null;
        this.noSolution = true;
      }
    }, 10);
  }

  /**
   * Retorna a classe CSS para uma célula do tabuleiro
   * Alterna entre 'light' e 'dark' para criar o padrão de xadrez
   */
  getCellClass(rowIndex: number, colIndex: number, cellValue: number): string {
    const isLight = (rowIndex + colIndex) % 2 === 0;
    const baseClass = isLight ? 'light' : 'dark';
    return cellValue === 1 ? `${baseClass} queen` : baseClass;
  }
}
