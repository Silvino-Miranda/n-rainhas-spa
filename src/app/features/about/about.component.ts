import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="nq-about nq-content-grid">
      <header>
        <span class="nq-about__eyebrow">Sobre</span>
        <h1>N-Rainhas — Scientific Noir Edition</h1>
      </header>

      <section>
        <h2>O problema</h2>
        <p>
          Posicionar N rainhas em um tabuleiro NxN sem que nenhuma ataque outra
          (mesma linha, coluna ou diagonal). Não há solução para N=2 e N=3.
        </p>
      </section>

      <section>
        <h2>Quatro estratégias</h2>
        <dl>
          <dt>Backtracking</dt>
          <dd>Recursão exata com poda — sempre encontra solução, mas custo cresce com N.</dd>
          <dt>Algoritmo Genético</dt>
          <dd>População de cromossomos (permutações), Order Crossover, swap mutation, elitismo.</dd>
          <dt>Hopfield Híbrida</dt>
          <dd>Min-conflicts + simulated annealing + perturbação aleatória.</dd>
          <dt>Brain.js</dt>
          <dd>Rede feedforward sigmóide treinada com 50 amostras + heurística.</dd>
        </dl>
      </section>

      <section>
        <h2>Stack v2</h2>
        <ul>
          <li>Angular 21 standalone components, zoneless change detection.</li>
          <li>Signals para estado reativo. Sem RxJS Subjects manuais.</li>
          <li>Web Workers para computação pesada — UI não trava.</li>
          <li>IndexedDB via <code>idb-keyval</code> para persistência local.</li>
          <li>Design System próprio (Scientific Noir) — sem Bootstrap.</li>
          <li>Chart.js carregado via <code>&#64;defer</code>.</li>
        </ul>
      </section>
    </article>
  `,
  styles: [`
    .nq-content-grid {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      padding: 0 var(--nq-space-6);
    }
    .nq-about {
      display: flex;
      flex-direction: column;
      gap: var(--nq-space-8);
      color: var(--nq-text-primary);
    }
    .nq-about__eyebrow {
      font-family: var(--nq-font-mono);
      font-size: var(--nq-text-xs);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--nq-brand-primary);
    }
    .nq-about h1 {
      font-family: var(--nq-font-display);
      font-size: var(--nq-text-4xl);
      margin-top: var(--nq-space-2);
    }
    .nq-about h2 {
      font-family: var(--nq-font-display);
      font-size: var(--nq-text-2xl);
      margin-bottom: var(--nq-space-3);
    }
    .nq-about p, .nq-about li, .nq-about dd {
      color: var(--nq-text-secondary);
      line-height: var(--nq-leading-relaxed);
    }
    .nq-about dl {
      display: grid;
      gap: var(--nq-space-3);
    }
    .nq-about dt {
      font-family: var(--nq-font-mono);
      font-size: var(--nq-text-sm);
      color: var(--nq-text-primary);
    }
    .nq-about ul {
      display: flex;
      flex-direction: column;
      gap: var(--nq-space-2);
      padding-left: var(--nq-space-4);
    }
    .nq-about code {
      background: var(--nq-surface-subtle);
      padding: 2px 6px;
      border-radius: var(--nq-radius-sm);
      font-size: 0.9em;
    }
  `]
})
export class AboutComponent {}
