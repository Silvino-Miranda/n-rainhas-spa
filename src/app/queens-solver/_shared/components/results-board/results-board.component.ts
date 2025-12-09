import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qs-results-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-board.component.html',
  styleUrls: ['./results-board.component.scss']
})
export class ResultsBoardComponent {
  solution = input<number[][] | null>(null);
  queensCount = input(0);
  algorithmUsed = input<'backtracking' | 'ga' | 'nn' | 'brain' | null>(null);
  generations = input(0);
  iterations = input(0);
  solveTime = input(0);

  getCellClass(rowIndex: number, colIndex: number, cellValue: number): string {
    const isLight = (rowIndex + colIndex) % 2 === 0;
    const baseClass = isLight ? 'light' : 'dark';
    return cellValue === 1 ? `${baseClass} queen` : baseClass;
  }

  getAlgorithmLabel(): string {
    const algo = this.algorithmUsed();
    if (algo === 'ga') return 'Genético';
    if (algo === 'nn') return 'Rede Neural';
    if (algo === 'brain') return 'Brain.js';
    return 'Backtracking';
  }
}
