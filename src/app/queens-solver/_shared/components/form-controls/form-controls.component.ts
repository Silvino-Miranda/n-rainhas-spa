import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-qs-form-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-controls.component.html',
  styleUrls: ['./form-controls.component.scss']
})
export class FormControlsComponent {
  form = input.required<FormGroup>();
  isLoading = input(false);
  algorithmUsed = input<'backtracking' | 'ga' | 'nn' | 'brain' | null>(null);
  minQueens = input(1);
  maxQueens = input(15);
  evolveFromSaved = input(true);
  showEvolveFromSaved = input(false);

  backtracking = output<void>();
  ga = output<void>();
  nn = output<void>();
  brain = output<void>();
  evolveFromSavedChange = output<boolean>();

  onBacktracking(): void {
    this.backtracking.emit();
  }

  onGa(): void {
    this.ga.emit();
  }

  onNn(): void {
    this.nn.emit();
  }

  onBrain(): void {
    this.brain.emit();
  }

  onToggleEvolve(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.evolveFromSavedChange.emit(checked);
  }
}
