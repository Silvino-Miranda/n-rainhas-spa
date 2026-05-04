import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  viewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type {
  AlgorithmType,
  BrainPoint,
  EvolutionPoint,
  TrainingPoint
} from '../../../../shared/models/algorithm.types';

const ALGO_COLOR: Record<AlgorithmType, string> = {
  backtracking: 'var(--nq-chart-bt)',
  ga: 'var(--nq-chart-ga)',
  nn: 'var(--nq-chart-nn)',
  brain: 'var(--nq-chart-brain)'
};

@Component({
  selector: 'app-training-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="nq-chart" aria-label="Gráfico de evolução do algoritmo">
      <header class="nq-chart__header">
        <h3>Evolução do treinamento</h3>
        <span class="nq-chart__count">{{ totalPoints() }} pontos</span>
      </header>
      <div class="nq-chart__canvas-wrapper">
        <canvas #canvas></canvas>
      </div>
    </section>
  `,
  styles: [`
    .nq-chart {
      display: flex;
      flex-direction: column;
      gap: var(--nq-space-3);
      padding: var(--nq-space-5);
      background: var(--nq-surface-card);
      border: 1px solid var(--nq-surface-border);
      border-radius: var(--nq-radius-lg);
    }
    .nq-chart__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
    }
    .nq-chart__header h3 {
      font-family: var(--nq-font-display);
      font-size: var(--nq-text-lg);
    }
    .nq-chart__count {
      font-family: var(--nq-font-mono);
      font-size: var(--nq-text-xs);
      color: var(--nq-text-secondary);
    }
    .nq-chart__canvas-wrapper {
      position: relative;
      height: 280px;
    }
    canvas { width: 100% !important; height: 100% !important; }
  `]
})
export class TrainingChartComponent implements AfterViewInit, OnDestroy {
  readonly algorithm = input.required<AlgorithmType>();
  readonly evolutionHistory = input<EvolutionPoint[]>([]);
  readonly trainingHistory = input<TrainingPoint[]>([]);
  readonly brainHistory = input<BrainPoint[]>([]);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private chart: unknown = null;
  private chartModulePromise: Promise<typeof import('chart.js/auto')> | null = null;

  constructor() {
    effect(() => {
      // re-render whenever inputs change
      void this.algorithm();
      void this.evolutionHistory();
      void this.trainingHistory();
      void this.brainHistory();
      this.render();
    });
  }

  protected totalPoints(): number {
    return this.evolutionHistory().length + this.trainingHistory().length + this.brainHistory().length;
  }

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private async render(): Promise<void> {
    if (!this.isBrowser) return;
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    if (!this.chartModulePromise) {
      this.chartModulePromise = import('chart.js/auto');
    }
    const Chart = (await this.chartModulePromise).default;

    const datasets = this.buildDatasets();
    if (datasets.labels.length === 0) {
      this.destroyChart();
      return;
    }

    type ChartCtor = new (
      ctx: HTMLCanvasElement,
      config: Record<string, unknown>
    ) => { destroy(): void; data: unknown; update(): void };
    const ChartTyped = Chart as unknown as ChartCtor;

    if (this.chart) {
      const c = this.chart as { data: { labels: unknown[]; datasets: unknown[] }; update: () => void };
      c.data.labels = datasets.labels;
      c.data.datasets = datasets.datasets;
      c.update();
      return;
    }

    this.chart = new ChartTyped(canvas, {
      type: 'line',
      data: { labels: datasets.labels, datasets: datasets.datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        scales: {
          x: {
            ticks: { color: 'rgba(152,150,160,0.85)', font: { family: 'JetBrains Mono' } },
            grid: { color: 'rgba(152,150,160,0.08)' }
          },
          y: {
            ticks: { color: 'rgba(152,150,160,0.85)', font: { family: 'JetBrains Mono' } },
            grid: { color: 'rgba(152,150,160,0.08)' }
          }
        },
        plugins: {
          legend: { labels: { color: 'rgba(240,237,230,0.9)', font: { family: 'DM Sans' } } },
          tooltip: { mode: 'index', intersect: false }
        }
      }
    });
  }

  private destroyChart(): void {
    if (this.chart) {
      (this.chart as { destroy: () => void }).destroy();
      this.chart = null;
    }
  }

  private buildDatasets(): { labels: number[]; datasets: Record<string, unknown>[] } {
    const algo = this.algorithm();
    const color = ALGO_COLOR[algo];

    if (algo === 'ga') {
      const points = this.evolutionHistory();
      return {
        labels: points.map(p => p.generation),
        datasets: [
          { label: 'Melhor fitness (conflitos)', data: points.map(p => p.bestFitness), borderColor: color, backgroundColor: 'transparent', tension: 0.2 },
          { label: 'Fitness médio', data: points.map(p => p.avgFitness), borderColor: 'rgba(152,150,160,0.6)', backgroundColor: 'transparent', borderDash: [4, 4], tension: 0.2 }
        ]
      };
    }
    if (algo === 'nn') {
      const points = this.trainingHistory();
      return {
        labels: points.map(p => p.iteration),
        datasets: [
          { label: 'Energia (conflitos)', data: points.map(p => p.energy), borderColor: color, backgroundColor: 'transparent', tension: 0.2 },
          { label: 'Rainhas válidas', data: points.map(p => p.validQueens), borderColor: 'rgba(152,150,160,0.6)', backgroundColor: 'transparent', borderDash: [4, 4], yAxisID: 'y' }
        ]
      };
    }
    if (algo === 'brain') {
      const points = this.brainHistory();
      return {
        labels: points.map(p => p.iteration),
        datasets: [
          { label: 'Erro normalizado', data: points.map(p => p.error), borderColor: color, backgroundColor: 'transparent', tension: 0.2 },
          { label: 'Rainhas válidas', data: points.map(p => p.validQueens), borderColor: 'rgba(152,150,160,0.6)', backgroundColor: 'transparent', borderDash: [4, 4] }
        ]
      };
    }
    return { labels: [], datasets: [] };
  }
}
