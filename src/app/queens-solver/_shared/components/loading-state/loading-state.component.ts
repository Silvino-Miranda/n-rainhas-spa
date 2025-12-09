import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qs-loading-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-state.component.html',
  styleUrls: ['./loading-state.component.scss']
})
export class LoadingStateComponent {
  isLoading = input(false);
  algorithmUsed = input<'backtracking' | 'ga' | 'nn' | 'brain' | null>(null);
}
