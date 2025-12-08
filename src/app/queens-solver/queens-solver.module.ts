import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { QueensSolverComponent } from './queens-solver.component';

@NgModule({
  declarations: [QueensSolverComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [QueensSolverComponent]
})
export class QueensSolverModule {}
