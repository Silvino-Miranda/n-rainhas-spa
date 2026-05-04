import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/queens-solver/queens-solver.component').then(m => m.QueensSolverComponent),
    title: 'N-Rainhas — Solver'
  },
  {
    path: 'champions',
    loadComponent: () =>
      import('./features/champions/champions.component').then(m => m.ChampionsComponent),
    title: 'N-Rainhas — Campeões'
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'N-Rainhas — Sobre'
  },
  { path: '**', redirectTo: '' }
];
