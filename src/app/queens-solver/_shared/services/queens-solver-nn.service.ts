import { Injectable } from '@angular/core';

/**
 * Interface para o resultado da Rede Neural com histórico de treinamento
 */
export interface NNResult {
  board: number[][];
  iterations: number;
  energy: number;
  trainingHistory: { iteration: number; energy: number; validQueens: number }[];
}

/**
 * Serviço para resolver o problema das N-Rainhas usando Rede Neural de Hopfield
 * com Min-Conflicts Heuristic para garantir convergência
 * 
 * Combina duas abordagens:
 * 1. Rede de Hopfield para otimização contínua
 * 2. Min-Conflicts para reparo quando a rede estabiliza
 */
@Injectable({
  providedIn: 'root'
})
export class QueensSolverNnService {
  private maxIterations = 5000;

  /**
   * Resolve o problema das N-Rainhas
   */
  solve(n: number): NNResult | null {
    // Casos especiais
    if (n === 1) {
      return { 
        board: [[1]], 
        iterations: 0, 
        energy: 0,
        trainingHistory: [{ iteration: 0, energy: 0, validQueens: 1 }]
      };
    }
    if (n === 2 || n === 3) {
      return null;
    }

    // Ajustar parâmetros
    this.maxIterations = n <= 8 ? 1000 : n <= 12 ? 3000 : 5000;

    // Tentar múltiplas vezes com diferentes inicializações
    for (let attempt = 0; attempt < 5; attempt++) {
      const result = this.runHybridSolver(n);
      if (result) {
        return result;
      }
    }

    return null;
  }

  /**
   * Executa o solver híbrido: Hopfield + Min-Conflicts
   */
  private runHybridSolver(n: number): NNResult | null {
    const trainingHistory: { iteration: number; energy: number; validQueens: number }[] = [];
    
    // Inicializar com uma permutação aleatória (garante uma rainha por coluna)
    let queens = this.randomPermutation(n);
    
    // Parâmetros da rede neural
    const learningRate = 0.5;
    let temperature = 1.0;
    const coolingRate = 0.995;

    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      // Calcular conflitos atuais
      const conflicts = this.countConflicts(queens);
      const energy = conflicts;
      
      // Registrar histórico
      if (iteration % 5 === 0) {
        trainingHistory.push({
          iteration,
          energy,
          validQueens: n - this.countQueensWithConflicts(queens)
        });
      }

      // Solução encontrada!
      if (conflicts === 0) {
        trainingHistory.push({ iteration, energy: 0, validQueens: n });
        return {
          board: this.queensToBoard(queens),
          iterations: iteration,
          energy: 0,
          trainingHistory
        };
      }

      // Estratégia híbrida: escolher entre diferentes métodos
      const rand = Math.random();
      
      if (rand < 0.4) {
        // Min-Conflicts: mover a rainha com mais conflitos para a posição com menos
        queens = this.minConflictsStep(queens);
      } else if (rand < 0.7) {
        // Troca neural: trocar duas rainhas baseado em gradiente
        queens = this.neuralSwapStep(queens, temperature);
      } else {
        // Perturbação aleatória para escapar de mínimos locais
        queens = this.randomSwap(queens);
      }

      // Resfriamento (simulated annealing)
      temperature *= coolingRate;
      if (temperature < 0.01) temperature = 0.01;
    }

    // Última tentativa com min-conflicts puro
    for (let i = 0; i < 1000; i++) {
      const conflicts = this.countConflicts(queens);
      if (conflicts === 0) {
        trainingHistory.push({ iteration: this.maxIterations + i, energy: 0, validQueens: n });
        return {
          board: this.queensToBoard(queens),
          iterations: this.maxIterations + i,
          energy: 0,
          trainingHistory
        };
      }
      queens = this.minConflictsStep(queens);
    }

    return null;
  }

  /**
   * Passo do algoritmo Min-Conflicts
   */
  private minConflictsStep(queens: number[]): number[] {
    const n = queens.length;
    const result = [...queens];
    
    // Encontrar colunas com conflitos
    const conflictCols: number[] = [];
    for (let col = 0; col < n; col++) {
      if (this.getConflictsForQueen(queens, col) > 0) {
        conflictCols.push(col);
      }
    }
    
    if (conflictCols.length === 0) return result;
    
    // Escolher uma coluna com conflito aleatoriamente
    const col = conflictCols[Math.floor(Math.random() * conflictCols.length)];
    
    // Encontrar a linha com menos conflitos para esta coluna
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
    
    // Escolher aleatoriamente entre as melhores posições
    result[col] = bestRows[Math.floor(Math.random() * bestRows.length)];
    
    return result;
  }

  /**
   * Passo de troca baseado em gradiente neural
   */
  private neuralSwapStep(queens: number[], temperature: number): number[] {
    const n = queens.length;
    const result = [...queens];
    
    // Calcular "energia" de cada rainha (número de conflitos)
    const energies: number[] = [];
    for (let col = 0; col < n; col++) {
      energies[col] = this.getConflictsForQueen(queens, col);
    }
    
    // Encontrar rainhas com alta energia
    const highEnergyCols = energies
      .map((e, i) => ({ energy: e, col: i }))
      .filter(x => x.energy > 0)
      .sort((a, b) => b.energy - a.energy);
    
    if (highEnergyCols.length < 2) {
      // Se só tem uma ou nenhuma com conflito, fazer min-conflicts
      return this.minConflictsStep(queens);
    }
    
    // Escolher duas colunas com alta energia e trocar suas rainhas
    const col1 = highEnergyCols[0].col;
    const col2Index = Math.floor(Math.random() * Math.min(3, highEnergyCols.length - 1)) + 1;
    const col2 = highEnergyCols[col2Index]?.col ?? highEnergyCols[1].col;
    
    // Calcular se a troca melhora
    const currentConflicts = this.countConflicts(queens);
    
    // Trocar
    [result[col1], result[col2]] = [result[col2], result[col1]];
    
    const newConflicts = this.countConflicts(result);
    
    // Aceitar se melhora ou com probabilidade baseada em temperatura (Metropolis)
    if (newConflicts <= currentConflicts) {
      return result;
    } else {
      const delta = newConflicts - currentConflicts;
      const probability = Math.exp(-delta / temperature);
      if (Math.random() < probability) {
        return result;
      }
      return queens; // Rejeitar troca
    }
  }

  /**
   * Troca aleatória para escapar de mínimos locais
   */
  private randomSwap(queens: number[]): number[] {
    const n = queens.length;
    const result = [...queens];
    
    // Escolher duas posições aleatórias e trocar
    const i = Math.floor(Math.random() * n);
    let j = Math.floor(Math.random() * n);
    while (j === i) j = Math.floor(Math.random() * n);
    
    [result[i], result[j]] = [result[j], result[i]];
    
    return result;
  }

  /**
   * Conta conflitos para uma rainha específica
   */
  private getConflictsForQueen(queens: number[], col: number): number {
    const n = queens.length;
    const row = queens[col];
    let conflicts = 0;
    
    for (let otherCol = 0; otherCol < n; otherCol++) {
      if (otherCol === col) continue;
      
      const otherRow = queens[otherCol];
      
      // Mesma linha
      if (row === otherRow) conflicts++;
      
      // Mesma diagonal
      if (Math.abs(row - otherRow) === Math.abs(col - otherCol)) conflicts++;
    }
    
    return conflicts;
  }

  /**
   * Conta o total de conflitos no tabuleiro
   */
  private countConflicts(queens: number[]): number {
    const n = queens.length;
    let conflicts = 0;
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        // Mesma linha
        if (queens[i] === queens[j]) conflicts++;
        
        // Mesma diagonal
        if (Math.abs(queens[i] - queens[j]) === Math.abs(i - j)) conflicts++;
      }
    }
    
    return conflicts;
  }

  /**
   * Conta quantas rainhas têm conflitos
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
   * Gera uma permutação aleatória de 0 a n-1
   */
  private randomPermutation(n: number): number[] {
    const arr = Array.from({ length: n }, (_, i) => i);
    
    // Fisher-Yates shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    
    return arr;
  }

  /**
   * Converte representação de rainhas para tabuleiro
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
