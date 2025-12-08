import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChampionsTableModule } from './_shared/components/champions-table/champions-table.module';
import { FormControlsModule } from './_shared/components/form-controls/form-controls.module';
import { LoadingStateModule } from './_shared/components/loading-state/loading-state.module';
import { NoSolutionAlertModule } from './_shared/components/no-solution-alert/no-solution-alert.module';
import { ResultsBoardModule } from './_shared/components/results-board/results-board.module';
import { TrainingChartModule } from './_shared/components/training-chart/training-chart.module';

import { QueensSolverComponent } from './queens-solver.component';

@NgModule({
  declarations: [QueensSolverComponent],
  imports: [
    CommonModule,
    FormControlsModule,
    ChampionsTableModule,
    LoadingStateModule,
    NoSolutionAlertModule,
    ResultsBoardModule,
    TrainingChartModule
  ],
  exports: [QueensSolverComponent]
})
export class QueensSolverModule {}
