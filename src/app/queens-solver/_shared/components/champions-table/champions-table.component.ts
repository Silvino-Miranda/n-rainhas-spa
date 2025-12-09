import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChampionResult, AlgorithmType } from '../../services/local-storage.service';

@Component({
  selector: 'app-qs-champions-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './champions-table.component.html',
  styleUrls: ['./champions-table.component.scss']
})
export class ChampionsTableComponent {
  @Input() champions: ChampionResult[] = [];
  @Output() viewSolution = new EventEmitter<ChampionResult>();
  @Output() clearAll = new EventEmitter<void>();

  onView(result: ChampionResult): void {
    this.viewSolution.emit(result);
  }

  onClear(): void {
    this.clearAll.emit();
  }

  getAlgorithmLabel(algorithm: AlgorithmType): string {
    const labels: Record<AlgorithmType, string> = {
      backtracking: 'Backtracking',
      ga: 'Genético',
      nn: 'Rede Neural',
      brain: 'Brain.js'
    };
    return labels[algorithm] || algorithm;
  }

  getAlgorithmEmoji(algorithm: AlgorithmType): string {
    const emojis: Record<AlgorithmType, string> = {
      backtracking: '♟️',
      ga: '🧬',
      nn: '🧠',
      brain: '🔵'
    };
    return emojis[algorithm] || '❓';
  }

  getAlgorithmBadgeClass(algorithm: AlgorithmType): string {
    const classes: Record<AlgorithmType, string> = {
      backtracking: 'bg-secondary',
      ga: 'bg-success',
      nn: 'bg-warning text-dark',
      brain: 'bg-info'
    };
    return classes[algorithm] || 'bg-secondary';
  }
}
