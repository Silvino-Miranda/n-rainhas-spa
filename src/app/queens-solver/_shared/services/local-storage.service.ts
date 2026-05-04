import { Injectable } from '@angular/core';

/**
 * Tipos de algoritmos suportados
 */
export type AlgorithmType = 'backtracking' | 'ga' | 'nn' | 'brain';

/**
 * Interface para um resultado campeão salvo
 */
export interface ChampionResult {
  n: number;
  algorithm: AlgorithmType;
  generations?: number; // Para GA
  iterations?: number; // Para NN e Brain.js
  solveTime: number;
  date: string;
  board: number[][];
  evolutionHistory?: { generation: number; bestFitness: number; avgFitness: number }[];
  trainingHistory?: { iteration: number; energy: number; validQueens: number }[];
  brainHistory?: { iteration: number; error: number; validQueens: number }[];
}

/**
 * Interface para a estrutura de armazenamento
 * Organizado por algoritmo e depois por N
 */
interface StorageStructure {
  [algorithm: string]: {
    [n: number]: ChampionResult;
  };
}

/**
 * Serviço para gerenciar o localStorage dos campeões N-Rainhas
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly STORAGE_KEY = 'nqueens_champions';

  constructor() {}

  /**
   * Salva um resultado campeão
   * Só salva se for melhor que o anterior (menos gerações/iterações ou menor tempo)
   */
  saveChampion(result: ChampionResult): boolean {
    const currentBest = this.getChampion(result.algorithm, result.n);
    
    // Determinar métrica de comparação
    const currentMetric = this.getMetric(currentBest);
    const newMetric = this.getMetric(result);
    
    // Salvar se não existe resultado anterior ou se este é melhor
    if (!currentBest || newMetric < currentMetric) {
      const allResults = this.getAllResultsRaw();
      
      if (!allResults[result.algorithm]) {
        allResults[result.algorithm] = {};
      }
      
      allResults[result.algorithm][result.n] = {
        ...result,
        date: new Date().toLocaleString('pt-BR')
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allResults));
      return true;
    }
    
    return false;
  }

  /**
   * Obtém a métrica de comparação (gerações, iterações ou tempo)
   */
  private getMetric(result: ChampionResult | null): number {
    if (!result) return Infinity;
    
    if (result.generations !== undefined) {
      return result.generations;
    }
    if (result.iterations !== undefined) {
      return result.iterations;
    }
    return result.solveTime;
  }

  /**
   * Obtém o campeão para um algoritmo e N específico
   */
  getChampion(algorithm: AlgorithmType, n: number): ChampionResult | null {
    const allResults = this.getAllResultsRaw();
    return allResults[algorithm]?.[n] || null;
  }

  /**
   * Obtém todos os campeões de um algoritmo específico
   */
  getChampionsByAlgorithm(algorithm: AlgorithmType): ChampionResult[] {
    const allResults = this.getAllResultsRaw();
    const algorithmResults = allResults[algorithm] || {};
    return Object.values(algorithmResults).sort((a, b) => a.n - b.n);
  }

  /**
   * Obtém todos os campeões de todos os algoritmos
   */
  getAllChampions(): ChampionResult[] {
    const allResults = this.getAllResultsRaw();
    const champions: ChampionResult[] = [];
    
    for (const algorithm of Object.keys(allResults)) {
      const algorithmResults = allResults[algorithm] || {};
      champions.push(...Object.values(algorithmResults));
    }
    
    return champions.sort((a, b) => {
      // Ordenar por N primeiro, depois por algoritmo
      if (a.n !== b.n) return a.n - b.n;
      return a.algorithm.localeCompare(b.algorithm);
    });
  }

  /**
   * Obtém todos os campeões agrupados por N
   */
  getChampionsGroupedByN(): Map<number, ChampionResult[]> {
    const champions = this.getAllChampions();
    const grouped = new Map<number, ChampionResult[]>();
    
    for (const champion of champions) {
      if (!grouped.has(champion.n)) {
        grouped.set(champion.n, []);
      }
      grouped.get(champion.n)!.push(champion);
    }
    
    return grouped;
  }

  /**
   * Obtém o melhor campeão para um N específico (menor tempo entre todos os algoritmos)
   */
  getBestChampionForN(n: number): ChampionResult | null {
    const allResults = this.getAllResultsRaw();
    let best: ChampionResult | null = null;
    
    for (const algorithm of Object.keys(allResults)) {
      const result = allResults[algorithm]?.[n];
      if (result) {
        if (!best || result.solveTime < best.solveTime) {
          best = result;
        }
      }
    }
    
    return best;
  }

  /**
   * Verifica se existe um campeão para um algoritmo e N
   */
  hasChampion(algorithm: AlgorithmType, n: number): boolean {
    return !!this.getChampion(algorithm, n);
  }

  /**
   * Remove um campeão específico
   */
  removeChampion(algorithm: AlgorithmType, n: number): void {
    const allResults = this.getAllResultsRaw();
    
    if (allResults[algorithm]?.[n]) {
      delete allResults[algorithm][n];
      
      // Remover algoritmo vazio
      if (Object.keys(allResults[algorithm]).length === 0) {
        delete allResults[algorithm];
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allResults));
    }
  }

  /**
   * Remove todos os campeões de um algoritmo
   */
  clearAlgorithmChampions(algorithm: AlgorithmType): void {
    const allResults = this.getAllResultsRaw();
    delete allResults[algorithm];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allResults));
  }

  /**
   * Limpa todos os campeões
   */
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Obtém estatísticas dos campeões
   */
  getStatistics(): {
    totalChampions: number;
    byAlgorithm: { [key: string]: number };
    bestTimeByN: { [key: number]: { algorithm: AlgorithmType; time: number } };
  } {
    const allResults = this.getAllResultsRaw();
    const stats = {
      totalChampions: 0,
      byAlgorithm: {} as { [key: string]: number },
      bestTimeByN: {} as { [key: number]: { algorithm: AlgorithmType; time: number } }
    };

    for (const algorithm of Object.keys(allResults)) {
      const algorithmResults = allResults[algorithm] || {};
      const count = Object.keys(algorithmResults).length;
      stats.byAlgorithm[algorithm] = count;
      stats.totalChampions += count;

      for (const result of Object.values(algorithmResults)) {
        const n = result.n;
        if (!stats.bestTimeByN[n] || result.solveTime < stats.bestTimeByN[n].time) {
          stats.bestTimeByN[n] = {
            algorithm: result.algorithm,
            time: result.solveTime
          };
        }
      }
    }

    return stats;
  }

  /**
   * Exporta todos os dados como JSON
   */
  exportData(): string {
    return JSON.stringify(this.getAllResultsRaw(), null, 2);
  }

  /**
   * Importa dados de um JSON
   */
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as StorageStructure;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém a estrutura raw do localStorage
   */
  private getAllResultsRaw(): StorageStructure {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Migra dados do formato antigo (apenas GA) para o novo formato
   */
  migrateFromOldFormat(): void {
    const OLD_KEY = 'nqueens_best_ga_result';
    try {
      const oldData = localStorage.getItem(OLD_KEY);
      if (oldData) {
        const parsed = JSON.parse(oldData);
        const newFormat: StorageStructure = { ga: {} };
        
        for (const key of Object.keys(parsed)) {
          const n = parseInt(key);
          const result = parsed[key];
          newFormat.ga[n] = {
            n: result.n,
            algorithm: 'ga',
            generations: result.generations,
            solveTime: result.solveTime,
            date: result.date,
            board: result.board
          };
        }
        
        // Merge com dados existentes
        const currentData = this.getAllResultsRaw();
        if (!currentData.ga) {
          currentData.ga = {};
        }
        
        for (const n of Object.keys(newFormat.ga)) {
          const nNum = parseInt(n);
          if (!currentData.ga[nNum]) {
            currentData.ga[nNum] = newFormat.ga[nNum];
          }
        }
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentData));
        localStorage.removeItem(OLD_KEY); // Remover dados antigos após migração
      }
    } catch {
      // Silently fail migration
    }
  }
}
