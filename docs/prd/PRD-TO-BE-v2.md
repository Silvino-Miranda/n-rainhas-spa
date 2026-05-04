# PRD TO-BE — N-Rainhas SPA v2

> **Tipo:** Product Requirements Document — visão de produto futura (TO-BE).
> **Tema:** v2 bonita, elegante e funcional com novo Design System e boas práticas de UI/UX.
> **Codinome do Design System:** **Scientific Noir**.
> **Data:** 2026-05-06
> **Pré-requisito:** [docs/prd/PRD-AS-IS.md](./PRD-AS-IS.md)
> **Equipe AIOX:** @ux-design-expert (Uma), @architect (Aria), @analyst (Alex), @data-engineer (Dara), consolidação por @pm (Morgan), orquestração por @aiox-master (Orion).

---

## Sumário

1. [Visão de Produto v2](#1-visão-de-produto-v2)
2. [Direção Estética — "Scientific Noir"](#2-direção-estética--scientific-noir)
3. [Princípios de Design](#3-princípios-de-design)
4. [Pesquisa UX e Heurísticas](#4-pesquisa-ux-e-heurísticas)
5. [Personas v2](#5-personas-v2)
6. [Top 10 User Stories Priorizadas](#6-top-10-user-stories-priorizadas)
7. [Design System v2](#7-design-system-v2)
8. [Redesign de Componentes](#8-redesign-de-componentes)
9. [Layout e Responsividade](#9-layout-e-responsividade)
10. [Novos Fluxos de Usuário](#10-novos-fluxos-de-usuário)
11. [Acessibilidade WCAG 2.2 AA](#11-acessibilidade-wcag-22-aa)
12. [Sistema de Motion](#12-sistema-de-motion)
13. [Iconografia](#13-iconografia)
14. [Estados Empty / Error / Loading](#14-estados-empty--error--loading)
15. [Arquitetura Frontend v2](#15-arquitetura-frontend-v2)
16. [Persistência v2 (IndexedDB)](#16-persistência-v2-indexeddb)
17. [Performance Budget](#17-performance-budget)
18. [Build, CI/CD e Testes](#18-build-cicd-e-testes)
19. [Métricas de Sucesso](#19-métricas-de-sucesso)
20. [Roadmap de Migração (4 Fases)](#20-roadmap-de-migração-4-fases)
21. [Glossário v2](#21-glossário-v2)

---

## 1. Visão de Produto v2

> "Uma bancada de laboratório digital onde alunos e pesquisadores comparam estratégias de IA para o problema das N-Rainhas — com a precisão de uma publicação científica e a fluidez de um produto moderno."

A v2 reposiciona o produto: deixa de ser uma página com 4 botões de algoritmo e passa a ser uma **plataforma educacional interativa** com narrativa visual, onboarding contextual, modo de comparação lado-a-lado e persistência rica de histórico. **A computação roda em Web Workers** — a UI nunca trava. **O Design System próprio** substitui Bootstrap. **O modo escuro é o canônico**, com modo claro como alternativa.

### O que muda em uma frase
> Sai uma SPA Angular com Bootstrap, jQuery e zone.js; entra uma SPA Angular 21 zoneless, signal-first, com workers, IndexedDB, tokens próprios, tipografia editorial e revelação animada da solução.

---

## 2. Direção Estética — "Scientific Noir"

| Atributo | Decisão |
|---|---|
| Tom | Bancada de laboratório digital — austero, denso em informação, elegante |
| Modo padrão | **Escuro** (`#0F0F12` de fundo). Claro disponível via toggle. |
| Tipografia | Trio editorial: **DM Serif Display** (display) · **DM Sans** (corpo) · **JetBrains Mono** (números/código) |
| Acento | **Âmbar-dourado `#D4A853`** — único momento de cor expressiva, reservado ao sucesso e ao foco |
| Hierarquia | Por **peso e tamanho tipográfico**, não por cor de fundo |
| Estrela da página | O tabuleiro NxN — recebe margem generosa, célula mínima 48px e revelação animada |

---

## 3. Princípios de Design

**P1 — Matemática é bela, deixe ela aparecer.**
Tabuleiro nunca é comprimido. Margens generosas. Animação de entrada escalonada coluna a coluna ao revelar a solução.

**P2 — Calmeza como padrão, expressividade no sucesso.**
Tom neutro-escuro em quase tudo. Acento âmbar-dourado pisca quando a solução chega.

**P3 — Hierarquia por peso, não por cor.**
Display serifado pesado para títulos. Mono caps para badges. Sans regular para corpo. Sem cores chamativas em fundos.

**P4 — Contexto visível, não escondido.**
Stats (algoritmo, tempo, gerações/iterações) sempre visíveis abaixo do tabuleiro. Sem tooltips fugazes para informação importante.

**P5 — Acessibilidade como restrição de design, não afterthought.**
Contraste mínimo 4.5:1, focus-ring sempre visível, `prefers-reduced-motion` colapsa animações, screen-reader anuncia resultado em `aria-live`.

---

## 4. Pesquisa UX e Heurísticas

### 4.1 Gaps observados na AS-IS (heurísticas de Nielsen)

| # | Heurística | Gap observado | Impacto |
|---|---|---|---|
| 1 | Visibilidade do estado | GA até 10.000 gerações não mostra progresso | Usuário não sabe se travou |
| 2 | Linguagem do mundo real | "Hopfield", "Metropolis", "min-conflicts" sem tradução | Iniciante perdido |
| 3 | Prevenção de erros | N=2/N=3 alerta mas não sugere N alternativo | Cliques aleatórios |
| 4 | Liberdade do usuário | Sem cancelamento de execução em andamento | Usuário "preso" |
| 5 | Estética e minimalismo | Tabela amarela + checkbox verde + Bootstrap = paleta inconsistente | Ruído visual |
| 6 | Reconhecimento vs lembrança | Abreviações sem tooltip; "gerações" vs "iterações" sem unidade | Esforço cognitivo |
| 7 | Flexibilidade | Sem filtros na tabela; sem comparação lado-a-lado; sem favoritos | Sem caminho avançado |
| 8 | Ajuda e documentação | Sem onboarding; README não linkado da UI | Curva de aprendizado |

### 4.2 Referências visuais

| Referência | O que herdar |
|---|---|
| **VisuAlgo** | Visualizadores com controle de velocidade e step-through |
| **Lichess Analysis Board** | Tabuleiro com hover states e gráfico convivendo com posição |
| **Observable Notebooks** | Edição reativa, brincar com N sem recarregar |
| **p5.js Web Editor** | Feedback imediato, UI simples |
| **Cargo Lens** | Filtros por categoria, cor por tipo, grafos densos |

---

## 5. Personas v2

### Persona 1 — Aluno-Explorador (Júlia, 21 anos)
- **Objetivo:** comparar 4 algoritmos para entender trade-offs (velocidade × qualidade).
- **Pain AS-IS:** botões intimidantes; não entende "Hopfield"; tabela não a ajuda a aprender.
- **Expectativa v2:** tooltips por algoritmo; gráfico tempo × gerações; resumo legível.

### Persona 2 — Pesquisador-Curioso (Prof. Carlos, 42 anos)
- **Objetivo:** demonstrar em aula que heurísticas batem backtracking em N grande; reproduzir resultados.
- **Pain AS-IS:** sem export para slides; seed limitado; sem pausar/retomar.
- **Expectativa v2:** seed customizável, export JSON+CSV, gravação animada da evolução.

---

## 6. Top 10 User Stories Priorizadas

| # | User Story |
|---|---|
| 1 | Como aluno, eu quero **tooltip de 1 linha em cada algoritmo** para entender sem buscar Google. |
| 2 | Como pesquisador, eu quero **pausar e retomar execução** para lidar com sala de aula. |
| 3 | Como aluno, eu quero **gráfico tempo × qualidade** entre algoritmos para aprender a curva. |
| 4 | Como pesquisador, eu quero **carregar seed via JSON** no AG para testar hipóteses. |
| 5 | Como pesquisador, eu quero **exportar histórico em CSV/JSON** para reproduzir em Python/R. |
| 6 | Como aluno, eu quero **visualização de conflitos** (linhas vermelhas) para entender N=2/N=3. |
| 7 | Como aluno, eu quero **tabela filtrável** (algoritmo, N) para encontrar campeão sem scroll. |
| 8 | Como pesquisador, eu quero **modo Comparar** lado-a-lado dos 4 tabuleiros e gráficos. |
| 9 | Como aluno, eu quero **demo automática** ("rodar todos para N=8") em 1 clique. |
| 10 | Como pesquisador, eu quero **modo replay** com velocidade x2/x4 do gráfico de evolução. |

---

## 7. Design System v2

### 7.1 Tokens — Cores

```css
/* === BRAND === */
--nq-brand-primary:     #D4A853;
--nq-brand-primary-dim: #A07830;
--nq-brand-primary-glow:#D4A85340;

/* === SURFACE — DARK (canônico) === */
--nq-surface-bg:        #0F0F12;
--nq-surface-card:      #1A1A1F;
--nq-surface-subtle:    #242429;
--nq-surface-border:    #2E2E36;
--nq-surface-overlay:   rgba(0,0,0,0.7);

/* === SURFACE — LIGHT === */
--nq-surface-bg-light:    #F7F5F0;
--nq-surface-card-light:  #FFFFFF;
--nq-surface-subtle-light:#EDEBE4;
--nq-surface-border-light:#D6D2C8;

/* === TEXT === */
--nq-text-primary:    #F0EDE6;
--nq-text-secondary:  #9896A0;
--nq-text-inverse:    #0F0F12;
--nq-text-disabled:   #4A4A55;
--nq-text-link:       #D4A853;

/* === SEMANTIC === */
--nq-success: #3DAA72;  --nq-success-bg: #0D2E1F;
--nq-warning: #D4A853;  --nq-warning-bg: #2A1F00;
--nq-danger:  #C0443A;  --nq-danger-bg:  #2A0A08;
--nq-info:    #3A7BD4;  --nq-info-bg:    #08152A;

/* === TABULEIRO === */
--nq-board-light:       #E8D5B0;
--nq-board-dark:        #8B6340;
--nq-board-queen-light: #B8E6C0;
--nq-board-queen-dark:  #2D7A45;
--nq-board-queen-icon:  #D4A853;
--nq-board-border:      #1A1208;

/* === CHART (4 algoritmos) === */
--nq-chart-bt:    #6C8EBF;  /* Backtracking — azul-aço */
--nq-chart-ga:    #8BC34A;  /* Genético — verde-lima */
--nq-chart-nn:    #E08030;  /* Hopfield — laranja-queimado */
--nq-chart-brain: #B060CC;  /* Brain.js — violeta */
```

### 7.2 Tokens — Tipografia

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

--nq-font-display: 'DM Serif Display', Georgia, serif;
--nq-font-body:    'DM Sans', system-ui, sans-serif;
--nq-font-mono:    'JetBrains Mono', 'Fira Code', monospace;

/* Escala (rem) */
--nq-text-xs:   0.75rem;   /* 12px */
--nq-text-sm:   0.875rem;  /* 14px */
--nq-text-base: 1rem;      /* 16px */
--nq-text-lg:   1.125rem;  /* 18px */
--nq-text-xl:   1.25rem;   /* 20px */
--nq-text-2xl:  1.5rem;    /* 24px */
--nq-text-3xl:  1.875rem;  /* 30px */
--nq-text-4xl:  2.25rem;   /* 36px */
--nq-text-5xl:  3rem;      /* 48px */

--nq-leading-tight:  1.2;
--nq-leading-snug:   1.35;
--nq-leading-normal: 1.5;
--nq-leading-relaxed:1.75;

--nq-weight-regular: 400;
--nq-weight-medium:  500;
--nq-weight-semi:    600;
--nq-weight-bold:    700;
```

### 7.3 Tokens — Espaçamento, Raios, Sombras, Motion, Z-index

```css
/* SPACE (base 4px) */
--nq-space-0:0; --nq-space-1:4px; --nq-space-2:8px; --nq-space-3:12px;
--nq-space-4:16px; --nq-space-5:20px; --nq-space-6:24px; --nq-space-8:32px;
--nq-space-10:40px; --nq-space-12:48px; --nq-space-16:64px;
--nq-space-20:80px; --nq-space-24:96px;

/* RADII */
--nq-radius-none:0; --nq-radius-sm:4px; --nq-radius-md:8px;
--nq-radius-lg:12px; --nq-radius-xl:20px; --nq-radius-full:9999px;

/* SHADOWS */
--nq-shadow-1: 0 1px 3px rgba(0,0,0,0.35);
--nq-shadow-2: 0 4px 12px rgba(0,0,0,0.40);
--nq-shadow-3: 0 8px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.30);
--nq-shadow-4: 0 20px 48px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.40);

/* MOTION */
--nq-duration-fast: 120ms;
--nq-duration-base: 240ms;
--nq-duration-slow: 480ms;
--nq-ease-standard:   cubic-bezier(0.4, 0.0, 0.2, 1);
--nq-ease-emphasized: cubic-bezier(0.2, 0.0, 0.0, 1);
--nq-ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);

/* Z-INDEX */
--nq-z-base:0; --nq-z-raised:10; --nq-z-sticky:100;
--nq-z-overlay:200; --nq-z-modal:300; --nq-z-toast:400; --nq-z-top:500;
```

### 7.4 Estratégia de tema

```css
:root {
  color-scheme: dark;
  /* tokens dark aplicados aqui */
}

[data-theme="light"] {
  color-scheme: light;
  --nq-surface-bg:    #F7F5F0;
  --nq-surface-card:  #FFFFFF;
  --nq-surface-subtle:#EDEBE4;
  --nq-surface-border:#D6D2C8;
  --nq-text-primary:  #1A1A1F;
  --nq-text-secondary:#5A5868;
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme]) { /* mesmos overrides */ }
}
```

`ThemeService` aplica `data-theme` em `document.documentElement` durante `APP_INITIALIZER` — sem flash.

---

## 8. Redesign de Componentes

### 8.1 Inventário e mudanças

| Componente | Estado AS-IS | Mudança v2 |
|---|---|---|
| **AppShell** *(novo)* | — | Top bar 56px: logo, ThemeToggle, link GitHub. `position: sticky`. |
| **AlgorithmCard** *(novo)* | 4 botões `btn-*` brutos | Grid 2×2 de cards: ícone 32px, nome, descrição 1 linha, CTA "Executar" |
| **ThemeToggle** *(novo)* | — | Ícone Sun/Moon 20px, troca com `rotate(180deg) + scale` |
| **EmptyState** *(novo)* | Tabela só some | SVG 96px monocromático com 1 acento âmbar + título + descrição |
| **FormControls** | Bootstrap input + 4 botões | Input 72px com underline, +/- custom, AlgorithmCards substituem botões |
| **LoadingState** | Spinner CSS + texto | Anel SVG 40px + barra shimmer + texto contextual mono |
| **NoSolutionAlert** | `#f8d7da` Bootstrap | Card com left-border âmbar + ícone diamante + `role="alert"` |
| **ResultsBoard** | Tabuleiro Bootstrap | Tabuleiro flutuante com `--nq-shadow-3`, célula 48–56px, **queen-reveal escalonada** |
| **TrainingChart** | Chart.js cores default | Cores `--nq-chart-*` por algoritmo, grid 10% opacity, tooltip mono |
| **ChampionsTable** | Tabela amarela | **Card grid 3 colunas** primário, tabela como toggle secundário |
| **CompareView** *(novo)* | — | 4 mini-tabuleiros 24px/célula + tabela comparativa de métricas |

### 8.2 Detalhamento — AlgorithmCard (peça-chave da v2)

| Algoritmo | Ícone Lucide | Descrição (1 linha) |
|---|---|---|
| Backtracking | `git-merge` | "Recursão exata. Sempre encontra." |
| Algoritmo Genético | `dna` | "Evolução iterativa. Aprende com gerações." |
| Hopfield Híbrida | `brain` | "Rede neural com simulated annealing." |
| Brain.js | `network` | "Feedforward treinada + heurística." |

Hover: `translateY(-2px)` + sombra de elevação 2 → 3. Disabled durante loading: `opacity .45`. Card ativo durante execução: borda âmbar pulsante.

---

## 9. Layout e Responsividade

```css
.nq-content-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--nq-space-6);
}

/* Breakpoints */
/* sm 480 · md 768 · lg 1024 · xl 1280 */

@media (min-width: 1024px) {
  .nq-results-layout {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--nq-space-8);
  }
}
@media (max-width: 1023px) {
  .nq-results-layout { display: flex; flex-direction: column; gap: var(--nq-space-6); }
}

.nq-algo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--nq-space-4);
}
```

---

## 10. Novos Fluxos de Usuário

### 10.1 Onboarding contextual
Primeira visita: tooltip-ghost de 14px aponta para input de N com texto "Comece aqui — escolha N (ex: 8)". Descarta com qualquer clique. Persiste em `nq-visited`.

### 10.2 Seleção de algoritmo
4 botões → grid 2×2 de **AlgorithmCards** (ver §8.2).

### 10.3 Run state com progresso
Para GA / NN / Brain: barra horizontal 4px shimmer abaixo do AppShell + texto live "Evoluindo... geração 247 / ~10.000" atualizado a cada 500ms via signal.

### 10.4 Cancelamento
Botão "Cancelar" aparece em cada AlgorithmCard ativo. Clica → `worker.terminate()` → estado volta para `idle`.

### 10.5 Revelação escalonada das rainhas
Cada rainha entra com `scale(0) → scale(1.15) → scale(1)` em 360ms, delay de 60ms × índice da coluna. Total ≤ 900ms para N=15.

### 10.6 Champions: card grid primário
Grid 3 colunas (desktop) / 2 (tablet) / 1 (mobile). Toggle "Ver como tabela" persistido na sessão. Filtros por algoritmo e N.

### 10.7 Modo Comparar
Botão "Comparar todos" → executa 4 algoritmos em sequência → mostra panel side-by-side com 4 mini-tabuleiros + tabela comparativa.

### 10.8 Demo automática
Botão "Rodar demo" → pré-seleciona N=8 → executa os 4 algoritmos → exibe modo Comparar automaticamente.

---

## 11. Acessibilidade WCAG 2.2 AA

| Item | Implementação |
|---|---|
| Contraste corpo | ≥ 4.5:1 (`#F0EDE6` sobre `#0F0F12` = 16:1) |
| Contraste UI | ≥ 3:1 em bordas, ícones, controles |
| Focus-visible | `outline: 2px solid #D4A853; outline-offset: 2px;` global |
| Tab order | AppShell → Input → AlgorithmCards → Resultado → Champions |
| Live region — resultado | `<div aria-live="polite" aria-atomic="true">Solução encontrada: 8 rainhas, Backtracking, 2ms</div>` |
| Live region — loading | `role="status"` atualiza para "Calculando..." |
| Tabuleiro | `role="grid"` + cell labels "Rainha em linha X, coluna Y" |
| `prefers-reduced-motion` | Colapsa `queen-reveal`, `card-hover`, `chart-draw` para `transition: none` |
| `prefers-contrast: more` | Bordas 2px; `--nq-surface-border` para `#6A6878` |
| Semântica | `<main>`, `<header>`, `<section aria-label="Algoritmos">`, `<section aria-label="Resultado">` |
| Erros de form | `aria-describedby` + `aria-invalid` |
| Ícones decorativos | `aria-hidden="true"` quando há label adjacente |

---

## 12. Sistema de Motion

| Nome | Duration | Easing | Onde |
|---|---|---|---|
| `page-enter` | 480ms | `decelerate` | AppShell + main entram com fade + translateY(12px → 0) |
| `card-hover` | 240ms | `standard` | AlgorithmCard sobe 2px e ganha shadow-3 |
| `queen-reveal` | 360ms | `emphasized` | Cada rainha: `scale(0) → 1.15 → 1`, delay escalonado |
| `chart-draw` | 800ms | `easeOutCubic` (Chart.js) | Linhas desenham left-to-right |
| `modal-enter` | 240ms | `decelerate` | Painel Comparar: opacity + scale(.96 → 1) |
| `toast-slide` | 200ms | `decelerate` | Notificação canto inferior-direito, fica 2.5s, sai em fast |

`prefers-reduced-motion: reduce` desliga animações de transformação; mantém apenas `opacity` instantâneo.

---

## 13. Iconografia

**Biblioteca:** `lucide-angular` (~30KB tree-shaken, stroke-based, consistente).

| Uso | Ícone | Tamanho |
|---|---|---|
| Backtracking | `git-merge` | 32px |
| Genético | `dna` | 32px |
| Hopfield | `brain` | 32px |
| Brain.js | `network` | 32px |
| Tema escuro | `moon` | 20px |
| Tema claro | `sun` | 20px |
| GitHub | `github` | 20px |
| Sem solução | `ban` | 24px |
| Campeão | `trophy` | 20px |
| Comparar | `layout-grid` | 20px |
| Exportar | `download` | 16px |
| Limpar tudo | `trash-2` | 16px |

`stroke-width: 1.5` em ícones grandes; `2` em pequenos.

---

## 14. Estados Empty / Error / Loading

Layout unificado: SVG 96px centralizado · título 16px · descrição 14px secundário.

| Estado | SVG | Texto |
|---|---|---|
| Empty (sem campeões) | Tabuleiro 4×4 vazio com 1 casa em âmbar 20% | "Nenhum campeão ainda." / "Execute um algoritmo para começar." |
| Error (N=2 / N=3) | Tabuleiro 3×3 com 2 rainhas em colisão diagonal cruzada em vermelho | "N={n} não tem solução." / "O problema das N-rainhas não tem solução para N=2 ou N=3." |
| Loading | Peça `♛` girando sobre círculo pontilhado | Texto contextual por algoritmo |

`prefers-reduced-motion`: SVG passa a pulsar `opacity .6 ↔ 1` em 2s (sem rotação).

---

## 15. Arquitetura Frontend v2

### 15.1 Pilares

| # | Princípio | Justificativa |
|---|---|---|
| 1 | **Signals everywhere** | Substituir `WritableSignal` espalhados por signal store por feature. |
| 2 | **Zoneless by default** | `provideZonelessChangeDetection()`. Remove zone.js (~40KB gz). |
| 3 | **Workers para compute pesado** | 4 workers dedicados; UI nunca trava em N=15. |
| 4 | **Defer non-critical UI** | `@defer` em Chart.js e ChampionsTable. |
| 5 | **Strict TS + standalone-only** | Ativar `strict: true`. Zero NgModules. |

### 15.2 Stack — out / in

| Out | In | Versão | Razão |
|---|---|---|---|
| `bootstrap@^5.2.3` | CSS custom properties + `@angular/cdk` | `^21.0.0` | Tokens próprios; CDK fornece overlay/a11y/layout sem estilo |
| `jquery@^3.6.0` | (remover) | — | Zero usos no código Angular |
| `rxjs@~6.6.0` | `rxjs` | `^7.8.1` | v6 fora de suporte; v7 melhor tree-shaking |
| `zone.js@~0.15.1` | (remover) | — | Signals dispensam zone patching |
| `karma` + `jasmine` | `vitest` + `@analogjs/vitest-angular` | `^3.1.0` / `^1.14.0` | Karma sem manutenção; Vitest é ~10× mais rápido, ESM nativo |
| `@angular-devkit/build-angular:browser` | `@angular/build:application` | `^21.0.2` | esbuild + Vite dev server |
| (sem workers) | Web Workers nativos + RxJS wrapper | — | 4 workers para os 4 solvers |
| brain.js via `declare var require` | brain.js via ESM `import` (dentro do worker) | `^2.0.0-beta.24` | Compatível com esbuild |

### 15.3 Layout de pastas v2

```
src/
├── main.ts                       # bootstrapApplication + provideZonelessChangeDetection + provideRouter
├── app/
│   ├── app.component.ts          # Shell <router-outlet>
│   ├── app.routes.ts             # Lazy routes
│   ├── core/
│   │   ├── providers/            # provideRouter, zoneless config
│   │   └── guards/
│   ├── shared/
│   │   ├── models/               # ChampionV2, AlgorithmType, SolverResult
│   │   ├── utils/                # worker-client.ts (postMessage→Observable)
│   │   └── ui/                   # Spinner, Alert, Badge primitivos
│   ├── design-system/
│   │   ├── tokens/               # _variables.scss
│   │   ├── components/           # Button, Card, Table, Input
│   │   └── layouts/              # Grid, PageShell
│   ├── data-access/
│   │   └── persistence.service.ts  # IndexedDB via idb-keyval
│   └── features/
│       ├── home/
│       ├── about/
│       ├── champions/
│       └── queens-solver/
│           ├── queens-solver.component.ts
│           ├── state/
│           │   └── queens-solver.store.ts
│           ├── workers/
│           │   ├── backtracking.worker.ts
│           │   ├── ga.worker.ts
│           │   ├── nn.worker.ts
│           │   └── brain.worker.ts
│           ├── services/
│           │   └── solver-orchestrator.service.ts
│           └── components/
│               ├── form-controls/
│               ├── algorithm-card/
│               ├── results-board/
│               ├── training-chart/
│               ├── loading-state/
│               ├── no-solution-alert/
│               ├── champions-table/
│               └── compare-view/
```

### 15.4 Estado por feature (signal store)

```typescript
export interface QueensSolverState {
  board: number[][] | null;
  queensCount: number;
  algorithmUsed: AlgorithmType | null;
  status: 'idle' | 'running' | 'success' | 'no-solution' | 'error';
  solveTime: number;
  generations: number;
  iterations: number;
  evolutionHistory: { generation: number; bestFitness: number; avgFitness: number }[];
  trainingHistory: { iteration: number; energy: number; validQueens: number }[];
  brainHistory:    { iteration: number; error: number; validQueens: number }[];
  progress: number;        // 0-100, reportado pelo worker
  error: string | null;
}

@Injectable()
export class QueensSolverStore {
  private readonly state = signal<QueensSolverState>(initialState);

  readonly board       = computed(() => this.state().board);
  readonly status      = computed(() => this.state().status);
  readonly progress    = computed(() => this.state().progress);
  readonly hasResult   = computed(() => this.state().board !== null && this.state().status === 'success');

  startSolve(algorithm: AlgorithmType, n: number, seed?: number[][]): void { ... }
  updateProgress(p: number): void { ... }
  completeSolve(result: Partial<QueensSolverState>): void { ... }
  failSolve(error: string): void { ... }
  reset(): void { ... }
}
```

### 15.5 Computação em Workers

```
UI                           Worker
 │                              │
 ├─ postMessage({type:'solve',  │
 │  algorithm,n,seed?}) ───────►│ executa solve()
 │                              │
 │ ◄── {type:'progress',v:42} ──┤ a cada 100 gerações
 │ ◄── {type:'result', data} ───┤
 │                              │
 ├─ postMessage({type:'cancel'})│ self.close() / flag
```

Wrapper em `shared/utils/worker-client.ts`:

```typescript
function runInWorker<T>(worker: Worker, payload: unknown): Observable<WorkerMessage<T>> {
  return new Observable(subscriber => {
    worker.onmessage = (e) => {
      if (e.data.type === 'result') { subscriber.next(e.data); subscriber.complete(); }
      else subscriber.next(e.data);
    };
    worker.onerror = (e) => subscriber.error(e);
    worker.postMessage(payload);
    return () => worker.terminate();
  });
}
```

`unsubscribe()` cancela. `toSignal()` integra ao store.

### 15.6 Roteamento (lazy)

```typescript
export const routes: Routes = [
  { path: '',          loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'solver',    loadComponent: () => import('./features/queens-solver/queens-solver.component').then(m => m.QueensSolverComponent) },
  { path: 'champions', loadComponent: () => import('./features/champions/champions.component').then(m => m.ChampionsComponent) },
  { path: 'about',     loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
  { path: '**',        redirectTo: '' },
];
```

---

## 16. Persistência v2 (IndexedDB)

### 16.1 Decisão
**Migrar de `localStorage` para IndexedDB** via **`idb-keyval@^6.2.1`** (~2KB gz). Razão: campeões com históricos densos podem estourar quota de 5–10MB do localStorage; IndexedDB escala para 50MB+ sem prompt.

### 16.2 Schema v2

```typescript
export interface ChampionV2 {
  id: string;                  // `${algorithm}:${n}:${timestamp}`
  schemaVersion: 2;
  algorithm: 'backtracking' | 'ga' | 'nn' | 'brain';
  n: number;
  generations?: number;
  iterations?: number;
  solveTime: number;
  createdAt: number;
  updatedAt: number;
  board: number[][];
  evolutionHistory?: { generation: number; bestFitness: number; avgFitness: number }[];
  trainingHistory?: { iteration: number; energy: number; validQueens: number }[];
  brainHistory?:    { iteration: number; error: number; validQueens: number }[];
}

export interface RunLogV2 {
  id: string;
  schemaVersion: 2;
  algorithm: string;
  n: number;
  solveTime: number;
  successful: boolean;
  createdAt: number;
  seed?: string;
}

export interface PreferencesV2 {
  schemaVersion: 2;
  theme: 'light' | 'dark';
  lastQueensCount: number;
  lastAlgorithm: 'backtracking' | 'ga' | 'nn' | 'brain';
  autoSaveChampions: boolean;
  updatedAt: number;
}

// Stores: champions (idx: algorithm,n,createdAt) · runs (idx: algorithm,n,successful) ·
// preferences (key="global") · __metadata__ (versão + flag de migração)
```

### 16.3 Migração v1 → v2 (idempotente)

```typescript
async migrateFromV1(): Promise<void> {
  const flag = await get('__migrated_v1_to_v2__');
  if (flag) return;

  const v1Raw = localStorage.getItem('nqueens_champions');
  if (v1Raw) {
    const parsed = JSON.parse(v1Raw);
    for (const [algo, nMap] of Object.entries(parsed)) {
      for (const [n, c] of Object.entries(nMap as any)) {
        const v2: ChampionV2 = {
          id: `${algo}:${n}:${Date.now()}`,
          schemaVersion: 2,
          algorithm: algo as any,
          n: Number(n),
          solveTime: c.solveTime,
          createdAt: new Date(c.date).getTime(),
          updatedAt: Date.now(),
          board: c.board,
          generations: c.generations,
          iterations: c.iterations,
          evolutionHistory: c.evolutionHistory,
          trainingHistory: c.trainingHistory,
          brainHistory: c.brainHistory,
        };
        await set(`champions:${v2.id}`, v2);
      }
    }
    localStorage.removeItem('nqueens_champions');
  }
  await set('__migrated_v1_to_v2__', true);
}
```

### 16.4 API `PersistenceService`

```typescript
class PersistenceService {
  // Champions
  getChampions(filter?: { algorithm?: AlgorithmType; n?: number }): Promise<ChampionV2[]>;
  saveChampion(c: ChampionV2): Promise<boolean>;
  deleteChampion(id: string): Promise<void>;
  clearAll(confirm: boolean): Promise<void>;

  // Preferences
  getPreferences(): Promise<PreferencesV2>;
  setPreference<K extends keyof PreferencesV2>(key: K, value: PreferencesV2[K]): Promise<void>;

  // Runs (debug)
  logRun(r: RunLogV2): Promise<void>;

  // Bulk
  exportAll(): Promise<{ champions: ChampionV2[]; preferences: PreferencesV2 }>;
  importAll(json: string): Promise<void>;

  // Reactive
  onChange(): Signal<'champions' | 'preferences' | 'runs'>;
}
```

### 16.5 Privacidade
- 100% client-side. Sem backend.
- Export JSON (download via `<a href="data:...">`).
- Import JSON via `<input type="file">` com validação de `schemaVersion`.
- Reset All com **dupla confirmação** (digitar "LIMPAR TUDO").

### 16.6 Observabilidade
Canal `console.debug` ativável via `localStorage.setItem('__NQUEENS_DEBUG__', '1')` ou `?debug=1`. Emite `CustomEvent('nqueens:persistence', {detail})` para listeners externos.

---

## 17. Performance Budget

| Métrica | Target v2 | Baseline AS-IS estimado |
|---|---|---|
| LCP | **< 1.8s** | ~2.5s |
| TTI | **< 2.5s** | ~3.5s |
| INP | **< 200ms** | Violado em N≥12 |
| JS inicial (gz) | **< 200KB** | ~380KB |
| JS total (gz) | **< 500KB** | ~520KB |
| CSS total (gz) | **< 30KB** | ~25KB |
| Lighthouse Performance | **≥ 90** | — |

**Ganhos imediatos:** −90KB (jQuery) −70KB (Bootstrap JS) −40KB (zone.js) ≈ **−200KB**. `@defer` em Chart.js + brain.js retira ~120KB do bundle inicial.

---

## 18. Build, CI/CD e Testes

### 18.1 Builder novo
```json
"build": {
  "builder": "@angular/build:application",
  "options": {
    "outputPath": "dist/n-rainhas",
    "index": "src/index.html",
    "browser": "src/main.ts",
    "tsConfig": "tsconfig.app.json",
    "polyfills": [],
    "webWorkerTsConfig": "tsconfig.worker.json"
  }
}
```

### 18.2 GitHub Actions (substitui Jenkinsfile)
```yaml
# .github/workflows/ci.yml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx ng lint
      - run: npx tsc --noEmit
      - run: npx vitest run --coverage
      - run: npx ng build --configuration production
      - uses: treosh/lighthouse-ci-action@v12
        with: { budgetPath: ./budget.json }
      - name: Bundle size gate
        run: |
          INITIAL=$(stat -c%s dist/n-rainhas/browser/main-*.js | head -1)
          [ "$INITIAL" -lt 204800 ] || exit 1
```

### 18.3 Pirâmide de testes

| Camada | Ferramenta | Versão | Escopo | Proporção |
|---|---|---|---|---|
| Unit | `vitest` + `@analogjs/vitest-angular` | `^3.1.0` / `^1.14.0` | Solvers puros, store, utils, workers | 70% |
| Component | `@testing-library/angular` | `^17.3.0` | Componentes standalone isolados | 20% |
| E2E | `@playwright/test` | `^1.50.0` | Fluxo: N → resolver → tabuleiro → champions | 8% |
| Visual | Playwright snapshots | mesma | Tabuleiro, gráfico, tabela | 2% |

---

## 19. Métricas de Sucesso

| Métrica | Target v2 |
|---|---|
| Task success rate (resolver N=8 em 4 algoritmos < 1min sem ajuda) | ≥ 95% |
| SUS (System Usability Scale) | ≥ 80 |
| LCP / INP / CLS | < 1.8s / < 200ms / < 0.05 |
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | 100 |
| Returning user (champions consultadas 2× em 7 dias) | ≥ 40% |
| Cobertura de testes | ≥ 80% linhas |

---

## 20. Roadmap de Migração (4 Fases)

### Fase 1 — Scaffold & Infra (sem mudança visual)
- Migrar builder para `@angular/build:application`
- Ativar `strict: true` no `tsconfig.json`, corrigir erros
- `provideZonelessChangeDetection()` + remover `zone.js`
- `provideRouter(routes)` + `app.routes.ts`
- `design-system/tokens/_variables.scss` com tokens
- Substituir `Jenkinsfile` por `.github/workflows/ci.yml`
- Migrar specs Karma → Vitest
- **Gate:** build passa, testes passam, app idêntica visualmente

### Fase 2 — CDK + Workers + Persistência v2
- Instalar `@angular/cdk@^21`, `idb-keyval@^6.2.1`, `lucide-angular`
- Criar 4 workers (`workers/`)
- Criar `SolverOrchestrator` + `worker-client.ts`
- Criar `QueensSolverStore` signal-based
- Atualizar RxJS → 7.8.1
- Migrar brain.js para ESM (dentro do worker)
- Implementar `PersistenceService` IndexedDB com migração v1→v2
- **Gate:** Solvers em workers, UI não trava em N=15, progresso funciona, dados persistem em IDB

### Fase 3 — Rewrite UI (Design System aplicado)
- `design-system/components/` (Button, Card, Table, Input) sem Bootstrap
- AppShell + ThemeToggle + ThemeService com `APP_INITIALIZER`
- AlgorithmCard substitui botões brutos
- ResultsBoard com queen-reveal escalonada
- ChampionsTable em card grid + toggle tabela + filtros
- TrainingChart com cores `--nq-chart-*` + `@defer`
- EmptyState + NoSolutionAlert redesenhados
- ARIA + focus-visible + `prefers-reduced-motion`
- **Gate:** Zero classes Bootstrap, Lighthouse Perf ≥ 90, A11y = 100

### Fase 4 — Modo Comparar + Polish + Retire
- CompareView (4 mini-tabuleiros + tabela métricas)
- Botão "Rodar demo" (N=8 nos 4 algoritmos)
- Cancelamento de execução
- Export/Import JSON (botões na UI)
- Filtros na ChampionsTable
- Remover `bootstrap`, `jquery`, `@types/jquery` de `package.json`
- Adicionar `@angular-eslint` com regra anti-Bootstrap
- Playwright E2E + visual snapshots
- **Gate:** Bundle inicial < 200KB gz, E2E green, baseline visual criado

---

## 21. Glossário v2

| Termo | Definição |
|---|---|
| **Campeão** | Melhor resultado salvo para par (algoritmo, N) |
| **Evolução** | Modo AG que muta um campeão prévio em vez de iniciar do zero |
| **Geração** | Iteração do laço AG (seleção, crossover, mutação, avaliação) |
| **Iteração** | Ciclo de ajuste em NN Hopfield ou Brain.js |
| **Energia** | Métrica de "insatisfação" (Hopfield); ≤0 = solução |
| **Fitness** | Inverso de energia; AG maximiza fitness |
| **Conflito** | Duas rainhas em mesma linha, coluna ou diagonal |
| **Seed** | Solução inicial fornecida ao AG (campeão prévio ou JSON externo) |
| **Worker** | Web Worker dedicado que roda um solver fora do thread principal |

---

## Decisões críticas (resumo executivo)

1. **Remover Bootstrap, jQuery e zone.js completamente.** Tokens próprios + zoneless + signals.
2. **Modo escuro como canônico.** Modo claro disponível, mas estética principal é "Scientific Noir".
3. **Solvers em Web Workers.** UI nunca trava; progresso reativo; cancelamento via `worker.terminate()`.
4. **AlgorithmCards substituem 4 botões brutos.** Muda o modelo mental de "clicar" para "escolher estratégia".
5. **IndexedDB substitui localStorage** via `idb-keyval`. Schema versionado, migração idempotente.
6. **Vitest substitui Karma+Jasmine.** ~10× mais rápido, ESM nativo, integra com esbuild.
7. **GitHub Actions substitui Jenkinsfile errado.** Lint + typecheck + Vitest + build + Lighthouse CI + bundle gate.
8. **Tipografia editorial:** DM Serif Display + DM Sans + JetBrains Mono via Google Fonts.
9. **lucide-angular** como única biblioteca de ícones (12 ícones).
10. **Modo Comparar lado-a-lado** dos 4 algoritmos como recurso diferencial v2.

---

**Fim do PRD TO-BE v2.** Este documento descreve a visão alvo. Próximo artefato esperado: épico e stories de implementação no AIOX (`@pm *create-epic`) com referência cruzada às 4 fases do roadmap.
