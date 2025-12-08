import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChampionsTableComponent } from './champions-table.component';

@NgModule({
  declarations: [ChampionsTableComponent],
  imports: [CommonModule],
  exports: [ChampionsTableComponent]
})
export class ChampionsTableModule {}
