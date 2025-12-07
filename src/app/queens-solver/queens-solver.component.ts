import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QueensSolverService } from './queens-solver.service';

@Component({
  selector: 'app-queens-solver',
  templateUrl: './queens-solver.component.html',
  styleUrls: ['./queens-solver.component.scss']
})
export class QueensSolverComponent {
  form: FormGroup;
  // armazene a solução das N rainhas aqui
  solution: number[][] = [];

  // injete o service de resolução das N rainhas
  constructor(private formBuilder: FormBuilder,
    private queensSolver: QueensSolverService) {
    this.form = this.formBuilder.group({
      queensNumber: ['', Validators.required]
    });
  }

  onSubmit(): void {
    const queensNumber = this.form.get('queensNumber').value;
    // chame o método de resolução das N rainhas aqui

    console.log(queensNumber);

    this.solve(queensNumber);
  }

  // chame o service de resolução das N rainhas quando o usuário clicar no botão
  solve(n: number): void {
    this.solution = this.queensSolver.solve(n);
    console.log(this.solution);
  }
}
