import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QueensSolverService } from './queens-solver.service';
import { QueensSolverGaService, GAResult } from './queens-solver-ga.service';

@Component({
  selector: 'app-queens-solver',
  templateUrl: './queens-solver.component.html',
  styleUrls: ['./queens-solver.component.scss']
})
export class QueensSolverComponent {
  @ViewChild('evolutionChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  form: FormGroup;
  
  // Estado da aplicação
  solution: number[][] | null = null;
  isLoading = false;
  noSolution = false;
  solveTime = 0;
  queensCount = 0;
  
  // Propriedades para AG
  generations = 0;
  algorithmUsed: 'backtracking' | 'ga' | null = null;
  evolutionHistory: { generation: number; bestFitness: number; avgFitness: number }[] = [];

  // Limites para o número de rainhas
  readonly MIN_QUEENS = 1;
  readonly MAX_QUEENS = 15; // Limitar para evitar travamento do navegador

  constructor(
    private formBuilder: FormBuilder,
    private queensSolver: QueensSolverService,
    private queensSolverGa: QueensSolverGaService
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

  onSubmitGA(): void {
    if (this.form.invalid) {
      return;
    }

    const queensNumber = this.form.get('queensNumber')?.value;
    this.solveWithGA(queensNumber);
  }

  solve(n: number): void {
    this.resetState(n);
    this.algorithmUsed = 'backtracking';
    this.evolutionHistory = [];

    // Usar setTimeout para permitir que a UI atualize antes de resolver
    setTimeout(() => {
      const startTime = performance.now();
      const result = this.queensSolver.solve(n);
      const endTime = performance.now();
      
      this.solveTime = Math.round((endTime - startTime) * 100) / 100;
      this.isLoading = false;
      this.generations = 0;

      if (result) {
        this.solution = result;
        this.noSolution = false;
      } else {
        this.solution = null;
        this.noSolution = true;
      }
    }, 10);
  }

  solveWithGA(n: number): void {
    this.resetState(n);
    this.algorithmUsed = 'ga';

    setTimeout(() => {
      const startTime = performance.now();
      const result = this.queensSolverGa.solve(n);
      const endTime = performance.now();
      
      this.solveTime = Math.round((endTime - startTime) * 100) / 100;
      this.isLoading = false;

      if (result) {
        this.solution = result.board;
        this.generations = result.generations;
        this.evolutionHistory = result.evolutionHistory;
        this.noSolution = false;
        // Desenhar gráfico após Angular atualizar a view
        setTimeout(() => this.drawChart(), 0);
      } else {
        this.solution = null;
        this.generations = 0;
        this.evolutionHistory = [];
        this.noSolution = true;
      }
    }, 10);
  }

  private resetState(n: number): void {
    this.solution = null;
    this.noSolution = false;
    this.isLoading = true;
    this.queensCount = n;
    this.generations = 0;
    this.evolutionHistory = [];
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

  /**
   * Desenha o gráfico de evolução do AG no canvas
   */
  drawChart(): void {
    if (!this.chartCanvas || this.evolutionHistory.length === 0) return;

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Limpar canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Dados
    const data = this.evolutionHistory;
    const maxFitness = Math.max(...data.map(d => Math.max(d.bestFitness, d.avgFitness)), 1);
    const maxGen = data.length;

    // Desenhar grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Eixos
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Labels dos eixos
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Gerações', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Conflitos (Fitness)', 0, 0);
    ctx.restore();

    // Escala Y
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      const val = Math.round(maxFitness * (5 - i) / 5);
      ctx.fillText(val.toString(), padding - 8, y + 4);
    }

    // Escala X
    ctx.textAlign = 'center';
    const xSteps = Math.min(5, maxGen);
    for (let i = 0; i <= xSteps; i++) {
      const x = padding + (chartWidth / xSteps) * i;
      const gen = Math.round((maxGen / xSteps) * i);
      ctx.fillText(gen.toString(), x, height - padding + 20);
    }

    // Linha da média (azul tracejada)
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (maxGen - 1 || 1)) * chartWidth;
      const y = height - padding - (d.avgFitness / maxFitness) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Linha do melhor fitness (verde)
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (maxGen - 1 || 1)) * chartWidth;
      const y = height - padding - (d.bestFitness / maxFitness) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Legenda
    const legendX = width - 130;
    const legendY = padding + 10;
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(legendX - 10, legendY - 5, 120, 50);
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 5, 120, 50);

    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#28a745';
    ctx.fillRect(legendX, legendY + 5, 20, 3);
    ctx.fillStyle = '#333';
    ctx.fillText('Melhor', legendX + 25, legendY + 10);
    
    ctx.strokeStyle = '#007bff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 25);
    ctx.lineTo(legendX + 20, legendY + 25);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#333';
    ctx.fillText('Média', legendX + 25, legendY + 28);
  }
}
