import { Injectable } from '@angular/core';

// Importar brain.js
declare var require: any;
const brain = require('brain.js');

/**
 * Interface para o resultado da Rede Neural Brain.js
 */
export interface BrainResult {
  board: number[][];
  iterations: number;
  error: number;
  trainingHistory: { iteration: number; error: number; validQueens: number }[];
}

/**
 * Serviço para resolver o problema das N-Rainhas usando Brain.js
 * 
 * Abordagem: Usa uma rede neural feedforward treinada com exemplos de soluções
 * válidas, combinada com busca local (min-conflicts) para garantir convergência.
 */
@Injectable({
  providedIn: 'root'
})
export class QueensSolverBrainService {
  private maxIterations = 2000;
  private net: any = null;

  /**
   * Resolve o problema das N-Rainhas usando Brain.js
   */
  solve(n: number): BrainResult | null {
    // Casos especiais
    if (n === 1) {
      return {
        board: [[1]],
        iterations: 0,
        error: 0,
        trainingHistory: [{ iteration: 0, error: 0, validQueens: 1 }]
      };
    }
    if (n === 2 || n === 3) {
      return null;
    }

    // Ajustar iterações baseado no tamanho
    this.maxIterations = n <= 8 ? 1000 : n <= 12 ? 2000 : 3000;

    // Tentar múltiplas vezes
    for (let attempt = 0; attempt < 5; attempt++) {
      const result = this.trainAndSolve(n);
      if (result) {
        return result;
      }
    }

    return null;
  }

  /**
   * Treina a rede e tenta resolver
   */
  private trainAndSolve(n: number): BrainResult | null {
    const trainingHistory: { iteration: number; error: number; validQueens: number }[] = [];

    // Criar rede neural feedforward
    this.net = new brain.NeuralNetwork({
      hiddenLayers: [n * 2, n * 2],
      activation: 'sigmoid',
      learningRate: 0.3
    });

    // Gerar dados de treinamento baseados em soluções conhecidas
    const trainingData = this.generateTrainingData(n);

    // Treinar a rede
    this.net.train(trainingData, {
      iterations: 500,
      errorThresh: 0.005,
      log: false
    });

    // Usar a rede treinada combinada com busca local
    let queens = this.initializeWithNetwork(n);
    let bestQueens = [...queens];
    let bestConflicts = this.countConflicts(queens);

    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      const conflicts = this.countConflicts(queens);
      
      // Registrar histórico
      if (iteration % 10 === 0) {
        trainingHistory.push({
          iteration,
          error: conflicts / n,
          validQueens: n - this.countQueensWithConflicts(queens)
        });
      }

      // Solução encontrada!
      if (conflicts === 0) {
        trainingHistory.push({ iteration, error: 0, validQueens: n });
        return {
          board: this.queensToBoard(queens),
          iterations: iteration,
          error: 0,
          trainingHistory
        };
      }

      // Guardar melhor
      if (conflicts < bestConflicts) {
        bestConflicts = conflicts;
        bestQueens = [...queens];
      }

      // Escolher estratégia
      const rand = Math.random();
      
      if (rand < 0.3) {
        // Usar predição da rede neural
        queens = this.networkGuidedStep(queens, n);
      } else if (rand < 0.7) {
        // Min-conflicts tradicional
        queens = this.minConflictsStep(queens);
      } else {
        // Perturbação aleatória
        queens = this.randomMove(queens);
      }
    }

    // Tentar finalizar com min-conflicts puro a partir do melhor estado
    queens = [...bestQueens];
    for (let i = 0; i < 500; i++) {
      const conflicts = this.countConflicts(queens);
      if (conflicts === 0) {
        trainingHistory.push({ iteration: this.maxIterations + i, error: 0, validQueens: n });
        return {
          board: this.queensToBoard(queens),
          iterations: this.maxIterations + i,
          error: 0,
          trainingHistory
        };
      }
      queens = this.minConflictsStep(queens);
    }

    return null;
  }

  /**
   * Gera dados de treinamento para a rede
   */
  private generateTrainingData(n: number): any[] {
    const data: any[] = [];
    
    // Gerar exemplos de configurações boas usando min-conflicts
    for (let sample = 0; sample < 50; sample++) {
      let queens = this.randomPermutation(n);
      
      // Melhorar com min-conflicts
      for (let i = 0; i < 100; i++) {
        if (this.countConflicts(queens) === 0) break;
        queens = this.minConflictsStep(queens);
      }
      
      // Se encontrou solução ou quase, usar como exemplo
      if (this.countConflicts(queens) <= 1) {
        // Criar entrada: posição normalizada das rainhas
        const input: { [key: string]: number } = {};
        for (let col = 0; col < n; col++) {
          input[`c${col}`] = queens[col] / (n - 1);
        }
        
        // Saída: mesmas posições (autoencoder-like)
        const output: { [key: string]: number } = {};
        for (let col = 0; col < n; col++) {
          output[`c${col}`] = queens[col] / (n - 1);
        }
        
        data.push({ input, output });
      }
    }
    
    // Se não conseguiu dados suficientes, gerar alguns aleatórios
    while (data.length < 10) {
      const queens = this.randomPermutation(n);
      const input: { [key: string]: number } = {};
      const output: { [key: string]: number } = {};
      
      for (let col = 0; col < n; col++) {
        input[`c${col}`] = queens[col] / (n - 1);
        output[`c${col}`] = queens[col] / (n - 1);
      }
      
      data.push({ input, output });
    }
    
    return data;
  }

  /**
   * Inicializa usando predições da rede neural
   */
  private initializeWithNetwork(n: number): number[] {
    const queens: number[] = [];
    const usedRows = new Set<number>();
    
    // Usar a rede para sugerir posições iniciais
    const input: { [key: string]: number } = {};
    for (let col = 0; col < n; col++) {
      input[`c${col}`] = 0.5; // Começar com valor neutro
    }
    
    try {
      const output = this.net.run(input);
      
      for (let col = 0; col < n; col++) {
        let suggestedRow = Math.round((output[`c${col}`] || Math.random()) * (n - 1));
        suggestedRow = Math.max(0, Math.min(n - 1, suggestedRow));
        
        // Se a linha já foi usada, encontrar a mais próxima disponível
        while (usedRows.has(suggestedRow)) {
          suggestedRow = (suggestedRow + 1) % n;
        }
        
        queens.push(suggestedRow);
        usedRows.add(suggestedRow);
      }
    } catch {
      // Fallback para permutação aleatória
      return this.randomPermutation(n);
    }
    
    return queens;
  }

  /**
   * Passo guiado pela rede neural
   */
  private networkGuidedStep(queens: number[], n: number): number[] {
    const result = [...queens];
    
    // Encontrar coluna com conflito
    const conflictCols: number[] = [];
    for (let col = 0; col < n; col++) {
      if (this.getConflictsForQueen(queens, col) > 0) {
        conflictCols.push(col);
      }
    }
    
    if (conflictCols.length === 0) return result;
    
    const col = conflictCols[Math.floor(Math.random() * conflictCols.length)];
    
    // Usar a rede para sugerir nova posição
    const input: { [key: string]: number } = {};
    for (let c = 0; c < n; c++) {
      input[`c${c}`] = queens[c] / (n - 1);
    }
    
    try {
      const output = this.net.run(input);
      let suggestedRow = Math.round((output[`c${col}`] || Math.random()) * (n - 1));
      suggestedRow = Math.max(0, Math.min(n - 1, suggestedRow));
      
      // Testar se melhora
      const tempQueens = [...queens];
      tempQueens[col] = suggestedRow;
      
      if (this.countConflicts(tempQueens) < this.countConflicts(queens)) {
        result[col] = suggestedRow;
      } else {
        // Fallback para min-conflicts
        return this.minConflictsStep(queens);
      }
    } catch {
      return this.minConflictsStep(queens);
    }
    
    return result;
  }

  /**
   * Passo Min-Conflicts
   */
  private minConflictsStep(queens: number[]): number[] {
    const n = queens.length;
    const result = [...queens];
    
    const conflictCols: number[] = [];
    for (let col = 0; col < n; col++) {
      if (this.getConflictsForQueen(queens, col) > 0) {
        conflictCols.push(col);
      }
    }
    
    if (conflictCols.length === 0) return result;
    
    const col = conflictCols[Math.floor(Math.random() * conflictCols.length)];
    
    let minConflicts = Infinity;
    const bestRows: number[] = [];
    
    for (let row = 0; row < n; row++) {
      const tempQueens = [...queens];
      tempQueens[col] = row;
      const conflicts = this.getConflictsForQueen(tempQueens, col);
      
      if (conflicts < minConflicts) {
        minConflicts = conflicts;
        bestRows.length = 0;
        bestRows.push(row);
      } else if (conflicts === minConflicts) {
        bestRows.push(row);
      }
    }
    
    result[col] = bestRows[Math.floor(Math.random() * bestRows.length)];
    return result;
  }

  /**
   * Movimento aleatório
   */
  private randomMove(queens: number[]): number[] {
    const n = queens.length;
    const result = [...queens];
    const col = Math.floor(Math.random() * n);
    result[col] = Math.floor(Math.random() * n);
    return result;
  }

  /**
   * Conta conflitos para uma rainha
   */
  private getConflictsForQueen(queens: number[], col: number): number {
    const n = queens.length;
    const row = queens[col];
    let conflicts = 0;
    
    for (let otherCol = 0; otherCol < n; otherCol++) {
      if (otherCol === col) continue;
      const otherRow = queens[otherCol];
      if (row === otherRow) conflicts++;
      if (Math.abs(row - otherRow) === Math.abs(col - otherCol)) conflicts++;
    }
    
    return conflicts;
  }

  /**
   * Conta total de conflitos
   */
  private countConflicts(queens: number[]): number {
    const n = queens.length;
    let conflicts = 0;
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (queens[i] === queens[j]) conflicts++;
        if (Math.abs(queens[i] - queens[j]) === Math.abs(i - j)) conflicts++;
      }
    }
    
    return conflicts;
  }

  /**
   * Conta rainhas com conflitos
   */
  private countQueensWithConflicts(queens: number[]): number {
    const n = queens.length;
    let count = 0;
    for (let col = 0; col < n; col++) {
      if (this.getConflictsForQueen(queens, col) > 0) count++;
    }
    return count;
  }

  /**
   * Permutação aleatória
   */
  private randomPermutation(n: number): number[] {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Converte para tabuleiro
   */
  private queensToBoard(queens: number[]): number[][] {
    const n = queens.length;
    const board: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let col = 0; col < n; col++) {
      board[queens[col]][col] = 1;
    }
    return board;
  }
}
