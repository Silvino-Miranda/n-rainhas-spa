import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControlsComponent } from './form-controls.component';

@NgModule({
  declarations: [FormControlsComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [FormControlsComponent]
})
export class FormControlsModule {}
