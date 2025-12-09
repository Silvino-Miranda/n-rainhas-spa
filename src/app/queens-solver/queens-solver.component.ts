import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  form: UntypedFormGroup;
  
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
    private formBuilder: UntypedFormBuilder,
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

}
