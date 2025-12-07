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
  
  // Melhor resultado do AG salvo no localStorage
  bestGAResult: {
    n: number;
    generations: number;
    solveTime: number;
    date: string;
    board: number[][];
  } | null = null;

  // Limites para o número de rainhas
  readonly MIN_QUEENS = 1;
  readonly MAX_QUEENS = 15; // Limitar para evitar travamento do navegador
  
  private readonly STORAGE_KEY = 'nqueens_best_ga_result';

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
    
    // Carregar melhor resultado do localStorage
    this.loadBestResult();
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
        
        // Salvar melhor resultado no localStorage (incluindo o tabuleiro vencedor)
        this.saveBestResult(n, result.generations, this.solveTime, result.board);
        
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
   * Salva o melhor resultado do AG no localStorage
   * Salva apenas se for melhor (menos gerações) que o resultado anterior para o mesmo N
   */
  private saveBestResult(n: number, generations: number, solveTime: number, board: number[][]): void {
    const currentBest = this.getBestResultForN(n);
    
    // Salvar se não existe resultado anterior ou se este é melhor (menos gerações)
    if (!currentBest || generations < currentBest.generations) {
      const allResults = this.getAllResults();
      allResults[n] = {
        n,
        generations,
        solveTime,
        date: new Date().toLocaleString('pt-BR'),
        board
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allResults));
      this.bestGAResult = allResults[n];
    }
  }

  /**
   * Carrega o melhor resultado do localStorage
   */
  private loadBestResult(): void {
    const allResults = this.getAllResults();
    const keys = Object.keys(allResults).map(Number);
    
    if (keys.length > 0) {
      // Pegar o resultado mais recente ou com maior N
      const maxN = Math.max(...keys);
      this.bestGAResult = allResults[maxN];
    }
  }

  /**
   * Obtém o melhor resultado para um N específico
   */
  private getBestResultForN(n: number): { n: number; generations: number; solveTime: number; date: string; board: number[][] } | null {
    const allResults = this.getAllResults();
    return allResults[n] || null;
  }

  /**
   * Obtém todos os resultados salvos
   */
  private getAllResults(): { [key: number]: { n: number; generations: number; solveTime: number; date: string; board: number[][] } } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Obtém todos os melhores resultados como array para exibição
   */
  getAllBestResults(): { n: number; generations: number; solveTime: number; date: string; board: number[][] }[] {
    const allResults = this.getAllResults();
    return Object.values(allResults).sort((a, b) => a.n - b.n);
  }

  /**
   * Carrega uma solução salva para exibição
   */
  loadSavedSolution(result: { n: number; generations: number; solveTime: number; date: string; board: number[][] }): void {
    this.solution = result.board;
    this.queensCount = result.n;
    this.generations = result.generations;
    this.solveTime = result.solveTime;
    this.algorithmUsed = 'ga';
    this.noSolution = false;
    this.evolutionHistory = []; // Não temos o histórico salvo
  }

  /**
   * Limpa todos os resultados salvos
   */
  clearAllResults(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.bestGAResult = null;
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
