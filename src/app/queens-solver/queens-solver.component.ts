import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QueensSolverService } from './_shared/services/queens-solver.service';
import { QueensSolverGaService, GAResult } from './_shared/services/queens-solver-ga.service';
import { QueensSolverNnService, NNResult } from './_shared/services/queens-solver-nn.service';
import { QueensSolverBrainService, BrainResult } from './_shared/services/queens-solver-brain.service';
import { LocalStorageService, ChampionResult, AlgorithmType } from './_shared/services/local-storage.service';

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
  algorithmUsed: 'backtracking' | 'ga' | 'nn' | 'brain' | null = null;
  evolutionHistory: { generation: number; bestFitness: number; avgFitness: number }[] = [];
  evolveFromSaved = true; // Checkbox para evoluir a partir do resultado salvo
  
  // Propriedades para Rede Neural
  iterations = 0;
  trainingHistory: { iteration: number; energy: number; validQueens: number }[] = [];
  
  // Propriedades para Brain.js
  brainHistory: { iteration: number; error: number; validQueens: number }[] = [];

  // Limites para o número de rainhas
  readonly MIN_QUEENS = 1;
  readonly MAX_QUEENS = 15; // Limitar para evitar travamento do navegador

  constructor(
    private formBuilder: FormBuilder,
    private queensSolver: QueensSolverService,
    private queensSolverGa: QueensSolverGaService,
    private queensSolverNn: QueensSolverNnService,
    private queensSolverBrain: QueensSolverBrainService,
    private localStorage: LocalStorageService
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
    
    // Migrar dados do formato antigo (se existirem)
    this.localStorage.migrateFromOldFormat();
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

  onSubmitNN(): void {
    if (this.form.invalid) {
      return;
    }

    const queensNumber = this.form.get('queensNumber')?.value;
    this.solveWithNN(queensNumber);
  }

  onSubmitBrain(): void {
    if (this.form.invalid) {
      return;
    }

    const queensNumber = this.form.get('queensNumber')?.value;
    this.solveWithBrain(queensNumber);
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
        
        // Salvar campeão no localStorage
        this.saveChampion('backtracking', n, this.solveTime, result);
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
      // Recuperar o melhor indivíduo salvo para este N (se a opção estiver marcada)
      const savedResult = this.evolveFromSaved ? this.getGAChampionForN(n) : null;
      const initialBoard = savedResult?.board || undefined;
      
      const startTime = performance.now();
      const result = this.queensSolverGa.solve(n, initialBoard);
      const endTime = performance.now();
      
      this.solveTime = Math.round((endTime - startTime) * 100) / 100;
      this.isLoading = false;

      if (result) {
        this.solution = result.board;
        this.generations = result.generations;
        this.evolutionHistory = result.evolutionHistory;
        this.noSolution = false;
        
        // Salvar campeão no localStorage
        this.saveChampion('ga', n, this.solveTime, result.board, result.generations);
        
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

  solveWithNN(n: number): void {
    this.resetState(n);
    this.algorithmUsed = 'nn';

    setTimeout(() => {
      const startTime = performance.now();
      const result = this.queensSolverNn.solve(n);
      const endTime = performance.now();
      
      this.solveTime = Math.round((endTime - startTime) * 100) / 100;
      this.isLoading = false;

      if (result) {
        this.solution = result.board;
        this.iterations = result.iterations;
        this.trainingHistory = result.trainingHistory;
        this.noSolution = false;
        
        // Salvar campeão no localStorage
        this.saveChampion('nn', n, this.solveTime, result.board, undefined, result.iterations);
        
        // Desenhar grafico apos Angular atualizar a view
        setTimeout(() => this.drawNNChart(), 0);
      } else {
        this.solution = null;
        this.iterations = 0;
        this.trainingHistory = [];
        this.noSolution = true;
      }
    }, 10);
  }

  solveWithBrain(n: number): void {
    this.resetState(n);
    this.algorithmUsed = 'brain';

    setTimeout(() => {
      const startTime = performance.now();
      const result = this.queensSolverBrain.solve(n);
      const endTime = performance.now();
      
      this.solveTime = Math.round((endTime - startTime) * 100) / 100;
      this.isLoading = false;

      if (result) {
        this.solution = result.board;
        this.iterations = result.iterations;
        this.brainHistory = result.trainingHistory;
        this.noSolution = false;
        
        // Salvar campeão no localStorage
        this.saveChampion('brain', n, this.solveTime, result.board, undefined, result.iterations);
        
        // Desenhar gráfico após Angular atualizar a view
        setTimeout(() => this.drawBrainChart(), 0);
      } else {
        this.solution = null;
        this.iterations = 0;
        this.brainHistory = [];
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
    this.iterations = 0;
    this.trainingHistory = [];
    this.brainHistory = [];
  }

  /**
   * Salva um campeão no localStorage
   */
  private saveChampion(algorithm: AlgorithmType, n: number, solveTime: number, board: number[][], generations?: number, iterations?: number): void {
    const champion: ChampionResult = {
      n,
      algorithm,
      solveTime,
      board,
      date: new Date().toLocaleString('pt-BR'),
      ...(generations !== undefined && { generations }),
      ...(iterations !== undefined && { iterations })
    };
    
    this.localStorage.saveChampion(champion);
  }

  /**
   * Obtém todos os campeões para exibição na tabela
   */
  getAllChampions(): ChampionResult[] {
    return this.localStorage.getAllChampions();
  }

  /**
   * Obtém campeões de um algoritmo específico
   */
  getChampionsByAlgorithm(algorithm: AlgorithmType): ChampionResult[] {
    return this.localStorage.getChampionsByAlgorithm(algorithm);
  }

  /**
   * Carrega uma solução salva para exibição
   */
  loadSavedSolution(result: ChampionResult): void {
    this.solution = result.board;
    this.queensCount = result.n;
    this.algorithmUsed = result.algorithm;
    this.solveTime = result.solveTime;
    this.noSolution = false;
    
    if (result.generations !== undefined) {
      this.generations = result.generations;
    }
    if (result.iterations !== undefined) {
      this.iterations = result.iterations;
    }
    
    // Limpar históricos já que não temos salvos
    this.evolutionHistory = [];
    this.trainingHistory = [];
    this.brainHistory = [];
  }

  /**
   * Limpa todos os resultados salvos
   */
  clearAllResults(): void {
    this.localStorage.clearAll();
  }

  /**
   * Remove campeões de um algoritmo específico
   */
  clearAlgorithmResults(algorithm: AlgorithmType): void {
    this.localStorage.clearAlgorithmChampions(algorithm);
  }

  /**
   * Verifica se existe um resultado salvo do GA para o N atual do formulário
   */
  hasSavedResultForCurrentN(): boolean {
    const n = this.form.get('queensNumber')?.value;
    return n ? this.localStorage.hasChampion('ga', n) : false;
  }

  /**
   * Obtém o campeão GA para um N específico (para evoluir a partir dele)
   */
  private getGAChampionForN(n: number): ChampionResult | null {
    return this.localStorage.getChampion('ga', n);
  }

  /**
   * Retorna o nome amigável do algoritmo
   */
  getAlgorithmLabel(algorithm: AlgorithmType): string {
    const labels: { [key in AlgorithmType]: string } = {
      'backtracking': 'Backtracking',
      'ga': 'Genético',
      'nn': 'Rede Neural',
      'brain': 'Brain.js'
    };
    return labels[algorithm] || algorithm;
  }

  /**
   * Retorna o emoji do algoritmo
   */
  getAlgorithmEmoji(algorithm: AlgorithmType): string {
    const emojis: { [key in AlgorithmType]: string } = {
      'backtracking': '♟️',
      'ga': '🧬',
      'nn': '🧠',
      'brain': '🔵'
    };
    return emojis[algorithm] || '❓';
  }

  /**
   * Retorna a classe CSS para a badge do algoritmo
   */
  getAlgorithmBadgeClass(algorithm: AlgorithmType): string {
    const classes: { [key in AlgorithmType]: string } = {
      'backtracking': 'bg-secondary',
      'ga': 'bg-success',
      'nn': 'bg-warning text-dark',
      'brain': 'bg-info'
    };
    return classes[algorithm] || 'bg-secondary';
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

  /**
   * Desenha o gráfico de treinamento da Rede Neural no canvas
   */
  drawNNChart(): void {
    if (!this.chartCanvas || this.trainingHistory.length === 0) return;

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
    const data = this.trainingHistory;
    const maxEnergy = Math.max(...data.map(d => d.energy), 1);
    const maxIter = data.length;

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
    ctx.fillText('Iterações', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Energia', 0, 0);
    ctx.restore();

    // Escala Y
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      const val = Math.round(maxEnergy * (5 - i) / 5 * 10) / 10;
      ctx.fillText(val.toString(), padding - 8, y + 4);
    }

    // Escala X
    ctx.textAlign = 'center';
    const xSteps = Math.min(5, maxIter);
    for (let i = 0; i <= xSteps; i++) {
      const x = padding + (chartWidth / xSteps) * i;
      const iter = Math.round((maxIter * 10 / xSteps) * i); // *10 porque registramos a cada 10 iterações
      ctx.fillText(iter.toString(), x, height - padding + 20);
    }

    // Linha de energia (roxo)
    ctx.strokeStyle = '#9c27b0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (maxIter - 1 || 1)) * chartWidth;
      const y = height - padding - (d.energy / maxEnergy) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Linha de rainhas válidas (laranja tracejada) - normalizada para caber no gráfico
    const maxQueens = this.queensCount;
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (maxIter - 1 || 1)) * chartWidth;
      // Invertemos porque queremos que N rainhas válidas = 0 conflitos (topo do gráfico)
      const normalizedQueens = (maxQueens - d.validQueens) / maxQueens * maxEnergy;
      const y = height - padding - (normalizedQueens / maxEnergy) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Legenda
    const legendX = width - 150;
    const legendY = padding + 10;
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(legendX - 10, legendY - 5, 140, 50);
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 5, 140, 50);

    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#9c27b0';
    ctx.fillRect(legendX, legendY + 5, 20, 3);
    ctx.fillStyle = '#333';
    ctx.fillText('Energia', legendX + 25, legendY + 10);
    
    ctx.strokeStyle = '#ff9800';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 25);
    ctx.lineTo(legendX + 20, legendY + 25);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#333';
    ctx.fillText('Conflitos', legendX + 25, legendY + 28);
  }

  /**
   * Desenha o gráfico de treinamento do Brain.js no canvas
   */
  drawBrainChart(): void {
    if (!this.chartCanvas || this.brainHistory.length === 0) return;

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
    const data = this.brainHistory;
    const maxError = Math.max(...data.map(d => d.error), 0.1);
    const maxIter = data.length;

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
    ctx.fillText('Iterações', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Erro', 0, 0);
    ctx.restore();

    // Escala Y
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      const val = Math.round(maxError * (5 - i) / 5 * 100) / 100;
      ctx.fillText(val.toString(), padding - 8, y + 4);
    }

    // Escala X
    ctx.textAlign = 'center';
    const xSteps = Math.min(5, maxIter);
    for (let i = 0; i <= xSteps; i++) {
      const x = padding + (chartWidth / xSteps) * i;
      const iter = Math.round((maxIter * 10 / xSteps) * i);
      ctx.fillText(iter.toString(), x, height - padding + 20);
    }

    // Linha de erro (azul)
    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (maxIter - 1 || 1)) * chartWidth;
      const y = height - padding - (d.error / maxError) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Linha de rainhas válidas (verde tracejada)
    const maxQueens = this.queensCount;
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (maxIter - 1 || 1)) * chartWidth;
      const normalizedQueens = (maxQueens - d.validQueens) / maxQueens * maxError;
      const y = height - padding - (normalizedQueens / maxError) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Legenda
    const legendX = width - 150;
    const legendY = padding + 10;
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(legendX - 10, legendY - 5, 140, 50);
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX - 10, legendY - 5, 140, 50);

    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#2196f3';
    ctx.fillRect(legendX, legendY + 5, 20, 3);
    ctx.fillStyle = '#333';
    ctx.fillText('Erro', legendX + 25, legendY + 10);
    
    ctx.strokeStyle = '#4caf50';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 25);
    ctx.lineTo(legendX + 20, legendY + 25);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#333';
    ctx.fillText('Conflitos', legendX + 25, legendY + 28);
  }
}
