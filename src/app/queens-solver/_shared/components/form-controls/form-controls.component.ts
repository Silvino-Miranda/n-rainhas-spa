import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-qs-form-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-controls.component.html',
  styleUrls: ['./form-controls.component.scss']
})
export class FormControlsComponent {
  @Input() form!: UntypedFormGroup;
  @Input() isLoading = false;
  @Input() algorithmUsed: 'backtracking' | 'ga' | 'nn' | 'brain' | null = null;
  @Input() minQueens = 1;
  @Input() maxQueens = 15;
  @Input() evolveFromSaved = true;
  @Input() showEvolveFromSaved = false;

  @Output() backtracking = new EventEmitter<void>();
  @Output() ga = new EventEmitter<void>();
  @Output() nn = new EventEmitter<void>();
  @Output() brain = new EventEmitter<void>();
  @Output() evolveFromSavedChange = new EventEmitter<boolean>();

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
