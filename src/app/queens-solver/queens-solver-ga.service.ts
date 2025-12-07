import { Injectable } from '@angular/core';

/**
 * Interface para o resultado do AG com histórico de evolução
 */
export interface GAResult {
  board: number[][];
  generations: number;
  fitness: number;
  evolutionHistory: { generation: number; bestFitness: number; avgFitness: number }[];
}

/**
 * Serviço para resolver o problema das N-Rainhas usando Algoritmo Genético (AG)
 * 
 * Representação do cromossomo: array de N inteiros, onde cada índice representa
 * uma coluna e o valor representa a linha onde a rainha está posicionada.
 * Exemplo para N=4: [1, 3, 0, 2] significa rainhas em (0,1), (1,3), (2,0), (3,2)
 * 
 * Esta representação garante automaticamente que não há duas rainhas na mesma coluna.
 */
@Injectable({
  providedIn: 'root'
})
export class QueensSolverGaService {
  // Parâmetros do AG
  private populationSize = 100;
  private mutationRate = 0.1;
  private crossoverRate = 0.8;
  private elitismCount = 2;
  private maxGenerations = 10000;

  /**
   * Resolve o problema das N-Rainhas usando Algoritmo Genético
   * @param n Número de rainhas
   * @returns Objeto com a solução (matriz NxN), estatísticas e histórico de evolução
   */
  solve(n: number): GAResult | null {
    // Casos especiais
    if (n === 1) {
      return { 
        board: [[1]], 
        generations: 0, 
        fitness: 0,
        evolutionHistory: [{ generation: 0, bestFitness: 0, avgFitness: 0 }]
      };
    }
    if (n === 2 || n === 3) {
      return null; // Não existe solução
    }

    // Ajustar parâmetros baseado no tamanho do problema
    this.adjustParameters(n);

    // Histórico de evolução para o gráfico
    const evolutionHistory: { generation: number; bestFitness: number; avgFitness: number }[] = [];

    // Inicializar população
    let population = this.initializePopulation(n);
    
    for (let generation = 0; generation < this.maxGenerations; generation++) {
      // Avaliar fitness de cada indivíduo
      const fitnessScores = population.map(individual => this.calculateFitness(individual));
      
      // Calcular estatísticas para o histórico
      const bestFitness = Math.min(...fitnessScores);
      const avgFitness = fitnessScores.reduce((a, b) => a + b, 0) / fitnessScores.length;
      
      // Registrar no histórico
      evolutionHistory.push({
        generation: generation + 1,
        bestFitness,
        avgFitness: Math.round(avgFitness * 100) / 100
      });

      // Verificar se encontramos uma solução perfeita (fitness = 0 conflitos)
      const bestIndex = fitnessScores.indexOf(bestFitness);
      if (fitnessScores[bestIndex] === 0) {
        return {
          board: this.chromosomeToBoard(population[bestIndex]),
          generations: generation + 1,
          fitness: 0,
          evolutionHistory
        };
      }

      // Criar nova geração
      const newPopulation: number[][] = [];

      // Elitismo: manter os melhores indivíduos
      const sortedIndices = fitnessScores
        .map((fitness, index) => ({ fitness, index }))
        .sort((a, b) => a.fitness - b.fitness)
        .map(item => item.index);

      for (let i = 0; i < this.elitismCount; i++) {
        newPopulation.push([...population[sortedIndices[i]]]);
      }

      // Preencher o resto da população com crossover e mutação
      while (newPopulation.length < this.populationSize) {
        // Seleção por torneio
        const parent1 = this.tournamentSelection(population, fitnessScores);
        const parent2 = this.tournamentSelection(population, fitnessScores);

        // Crossover
        let [child1, child2] = this.crossover(parent1, parent2);

        // Mutação
        child1 = this.mutate(child1);
        child2 = this.mutate(child2);

        newPopulation.push(child1);
        if (newPopulation.length < this.populationSize) {
          newPopulation.push(child2);
        }
      }

      population = newPopulation;
    }

    // Retornar a melhor solução encontrada (mesmo que não seja perfeita)
    const finalFitness = population.map(individual => this.calculateFitness(individual));
    const bestIndex = finalFitness.indexOf(Math.min(...finalFitness));
    
    if (finalFitness[bestIndex] === 0) {
      return {
        board: this.chromosomeToBoard(population[bestIndex]),
        generations: this.maxGenerations,
        fitness: 0,
        evolutionHistory
      };
    }

    return null; // Não encontrou solução perfeita
  }

  /**
   * Ajusta os parâmetros do AG baseado no tamanho do problema
   */
  private adjustParameters(n: number): void {
    if (n <= 8) {
      this.populationSize = 100;
      this.maxGenerations = 1000;
    } else if (n <= 12) {
      this.populationSize = 200;
      this.maxGenerations = 5000;
    } else {
      this.populationSize = 300;
      this.maxGenerations = 10000;
    }
  }

  /**
   * Inicializa a população com indivíduos aleatórios
   * Cada indivíduo é uma permutação de 0 a N-1 (garante uma rainha por linha)
   */
  private initializePopulation(n: number): number[][] {
    const population: number[][] = [];
    
    for (let i = 0; i < this.populationSize; i++) {
      // Criar uma permutação aleatória
      const individual = Array.from({ length: n }, (_, index) => index);
      this.shuffleArray(individual);
      population.push(individual);
    }
    
    return population;
  }

  /**
   * Embaralha um array (Fisher-Yates shuffle)
   */
  private shuffleArray(array: number[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Calcula o fitness de um indivíduo (número de conflitos nas diagonais)
   * Quanto menor o fitness, melhor (0 = solução perfeita)
   */
  private calculateFitness(chromosome: number[]): number {
    let conflicts = 0;
    const n = chromosome.length;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        // Verificar conflitos nas diagonais
        // Duas rainhas estão na mesma diagonal se |row1 - row2| === |col1 - col2|
        if (Math.abs(chromosome[i] - chromosome[j]) === Math.abs(i - j)) {
          conflicts++;
        }
      }
    }

    return conflicts;
  }

  /**
   * Seleção por torneio: escolhe k indivíduos aleatórios e retorna o melhor
   */
  private tournamentSelection(population: number[][], fitnessScores: number[], tournamentSize = 5): number[] {
    let bestIndex = Math.floor(Math.random() * population.length);
    let bestFitness = fitnessScores[bestIndex];

    for (let i = 1; i < tournamentSize; i++) {
      const candidateIndex = Math.floor(Math.random() * population.length);
      if (fitnessScores[candidateIndex] < bestFitness) {
        bestIndex = candidateIndex;
        bestFitness = fitnessScores[candidateIndex];
      }
    }

    return [...population[bestIndex]];
  }

  /**
   * Crossover: Order Crossover (OX) para preservar a permutação
   */
  private crossover(parent1: number[], parent2: number[]): [number[], number[]] {
    if (Math.random() > this.crossoverRate) {
      return [[...parent1], [...parent2]];
    }

    const n = parent1.length;
    
    // Selecionar dois pontos de corte aleatórios
    let point1 = Math.floor(Math.random() * n);
    let point2 = Math.floor(Math.random() * n);
    if (point1 > point2) {
      [point1, point2] = [point2, point1];
    }

    // Criar filhos usando Order Crossover
    const child1 = this.orderCrossover(parent1, parent2, point1, point2);
    const child2 = this.orderCrossover(parent2, parent1, point1, point2);

    return [child1, child2];
  }

  /**
   * Implementação do Order Crossover (OX)
   */
  private orderCrossover(parent1: number[], parent2: number[], point1: number, point2: number): number[] {
    const n = parent1.length;
    const child: number[] = new Array(n).fill(-1);
    
    // Copiar segmento do parent1
    for (let i = point1; i <= point2; i++) {
      child[i] = parent1[i];
    }
    
    // Preencher o resto com valores do parent2 na ordem
    const usedValues = new Set(child.filter(v => v !== -1));
    let childIndex = (point2 + 1) % n;
    let parent2Index = (point2 + 1) % n;
    
    while (usedValues.size < n) {
      if (!usedValues.has(parent2[parent2Index])) {
        child[childIndex] = parent2[parent2Index];
        usedValues.add(parent2[parent2Index]);
        childIndex = (childIndex + 1) % n;
      }
      parent2Index = (parent2Index + 1) % n;
    }
    
    return child;
  }

  /**
   * Mutação: troca duas posições aleatórias (swap mutation)
   */
  private mutate(chromosome: number[]): number[] {
    if (Math.random() > this.mutationRate) {
      return chromosome;
    }

    const mutated = [...chromosome];
    const n = mutated.length;
    
    // Swap mutation: trocar duas posições aleatórias
    const pos1 = Math.floor(Math.random() * n);
    let pos2 = Math.floor(Math.random() * n);
    while (pos2 === pos1) {
      pos2 = Math.floor(Math.random() * n);
    }
    
    [mutated[pos1], mutated[pos2]] = [mutated[pos2], mutated[pos1]];
    
    return mutated;
  }

  /**
   * Converte o cromossomo (array de posições) para uma matriz NxN
   */
  private chromosomeToBoard(chromosome: number[]): number[][] {
    const n = chromosome.length;
    const board: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    
    for (let col = 0; col < n; col++) {
      const row = chromosome[col];
      board[row][col] = 1;
    }
    
    return board;
  }
}
