import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-qs-training-chart',
  templateUrl: './training-chart.component.html',
  styleUrls: ['./training-chart.component.scss']
})
export class TrainingChartComponent implements AfterViewInit, OnChanges {
  @Input() algorithmUsed: 'backtracking' | 'ga' | 'nn' | 'brain' | null = null;
  @Input() evolutionHistory: { generation: number; bestFitness: number; avgFitness: number }[] = [];
  @Input() trainingHistory: { iteration: number; energy: number; validQueens: number }[] = [];
  @Input() brainHistory: { iteration: number; error: number; validQueens: number }[] = [];
  @Input() generations = 0;
  @Input() iterations = 0;
  @Input() queensCount = 0;

  @ViewChild('evolutionChart') chartCanvas?: ElementRef<HTMLCanvasElement>;

  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['algorithmUsed'] || changes['evolutionHistory'] || changes['trainingHistory'] || changes['brainHistory']) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    if (!this.viewReady || !this.chartCanvas) return;

    if (this.algorithmUsed === 'ga' && this.evolutionHistory.length > 0) {
      this.drawGAChart();
    } else if (this.algorithmUsed === 'nn' && this.trainingHistory.length > 0) {
      this.drawNNChart();
    } else if (this.algorithmUsed === 'brain' && this.brainHistory.length > 0) {
      this.drawBrainChart();
    } else {
      this.clearChart();
    }
  }

  private clearChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private drawGAChart(): void {
    if (!this.chartCanvas || this.evolutionHistory.length === 0) return;

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const data = this.evolutionHistory;
    const maxFitness = Math.max(...data.map(d => Math.max(d.bestFitness, d.avgFitness)), 1);
    const maxGen = data.length;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Gerações', width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Conflitos (Fitness)', 0, 0);
    ctx.restore();

    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      const val = Math.round((maxFitness * (5 - i)) / 5);
      ctx.fillText(val.toString(), padding - 8, y + 4);
    }

    ctx.textAlign = 'center';
    const xSteps = Math.min(5, maxGen);
    for (let i = 0; i <= xSteps; i++) {
      const x = padding + (chartWidth / xSteps) * i;
      const gen = Math.round((maxGen / xSteps) * i);
      ctx.fillText(gen.toString(), x, height - padding + 20);
    }

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

  private drawNNChart(): void {
    if (!this.chartCanvas || this.trainingHistory.length === 0) return;

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const data = this.trainingHistory;
    const maxEnergy = Math.max(...data.map(d => d.energy), 1);
    const maxIter = data.length;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Iterações', width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Energia', 0, 0);
    ctx.restore();

    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      const val = Math.round(((maxEnergy * (5 - i)) / 5) * 10) / 10;
      ctx.fillText(val.toString(), padding - 8, y + 4);
    }

    ctx.textAlign = 'center';
    const xSteps = Math.min(5, maxIter);
    for (let i = 0; i <= xSteps; i++) {
      const x = padding + (chartWidth / xSteps) * i;
      const iter = Math.round(((maxIter * 10) / xSteps) * i);
      ctx.fillText(iter.toString(), x, height - padding + 20);
    }

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

    const maxQueens = this.queensCount || 1;
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (maxIter - 1 || 1)) * chartWidth;
      const normalizedQueens = ((maxQueens - d.validQueens) / maxQueens) * maxEnergy;
      const y = height - padding - (normalizedQueens / maxEnergy) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

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

  private drawBrainChart(): void {
    if (!this.chartCanvas || this.brainHistory.length === 0) return;

    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const data = this.brainHistory;
    const maxError = Math.max(...data.map(d => d.error), 0.1);
    const maxIter = data.length;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.fillStyle = '#333333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Iterações', width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Erro', 0, 0);
    ctx.restore();

    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      const val = Math.round(((maxError * (5 - i)) / 5) * 100) / 100;
      ctx.fillText(val.toString(), padding - 8, y + 4);
    }

    ctx.textAlign = 'center';
    const xSteps = Math.min(5, maxIter);
    for (let i = 0; i <= xSteps; i++) {
      const x = padding + (chartWidth / xSteps) * i;
      const iter = Math.round(((maxIter * 10) / xSteps) * i);
      ctx.fillText(iter.toString(), x, height - padding + 20);
    }

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

    const maxQueens = this.queensCount || 1;
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = padding + (i / (maxIter - 1 || 1)) * chartWidth;
      const normalizedQueens = ((maxQueens - d.validQueens) / maxQueens) * maxError;
      const y = height - padding - (normalizedQueens / maxError) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

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
