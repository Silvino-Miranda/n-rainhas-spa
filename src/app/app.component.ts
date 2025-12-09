import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueensSolverComponent } from './queens-solver/queens-solver.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, QueensSolverComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'n-rainhas';
}
