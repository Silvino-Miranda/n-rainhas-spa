import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-qs-results-board',
  templateUrl: './results-board.component.html',
  styleUrls: ['./results-board.component.scss']
})
export class ResultsBoardComponent {
  @Input() solution: number[][] | null = null;
  @Input() queensCount = 0;
  @Input() algorithmUsed: 'backtracking' | 'ga' | 'nn' | 'brain' | null = null;
  @Input() generations = 0;
  @Input() iterations = 0;
  @Input() solveTime = 0;

  getCellClass(rowIndex: number, colIndex: number, cellValue: number): string {
    const isLight = (rowIndex + colIndex) % 2 === 0;
    const baseClass = isLight ? 'light' : 'dark';
    return cellValue === 1 ? `${baseClass} queen` : baseClass;
  }

  getAlgorithmLabel(): string {
    if (this.algorithmUsed === 'ga') return 'Genético';
    if (this.algorithmUsed === 'nn') return 'Rede Neural';
    if (this.algorithmUsed === 'brain') return 'Brain.js';
    return 'Backtracking';
  }
}
