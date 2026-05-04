# DELTA — PRD v2 → estado entregue na branch `develop`

> Branch base: `main` · Branch trabalho: `develop`
> Data: 2026-05-06 · Equipe AIOX
> Build verificado: `npx ng build --configuration production` **passou** com initial transfer de **77.81 kB** (target PRD < 200 KB gz).

Este documento mapeia, ponto a ponto, o que foi entregue desta sessão de implementação contra o `PRD-TO-BE-v2.md`. Tudo o que ainda **não** foi implementado fica listado em **Gaps** com a fase do roadmap original.

---

## ✅ Entregue

### Phase 1 — Scaffold & Infra
- `@angular/build:application` builder substitui `@angular-devkit/build-angular:browser`.
- `provideZonelessChangeDetection()` em `src/main.ts` — `zone.js` removido das deps.
- `provideRouter(routes, withComponentInputBinding())` com lazy-loading.
- `tsconfig.json` com `strict: true`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `isolatedModules`, `moduleResolution: bundler`.
- `tsconfig.worker.json` novo, isolando lib `WebWorker`.
- `Jenkinsfile` deletado (apontava para outro projeto).
- `karma.conf.js` deletado (defaults do builder cobrem).
- `polyfills.ts` deletado.

### Phase 2 — Design System "Scientific Noir"
- `src/app/design-system/tokens/_tokens.scss`: paleta completa, tipografia (DM Serif Display + DM Sans + JetBrains Mono via Google Fonts), espaçamento base-4, raios, sombras, motion, z-index.
- `[data-theme="light"]` override + `prefers-color-scheme` + `prefers-reduced-motion` + `prefers-contrast`.
- `_reset.scss` com focus-visible global, sr-only, scrollbar themed.
- `ThemeService` (signal-based) com `effect()` que mirrors `data-theme` no `<html>` + persiste em `localStorage`. `APP_INITIALIZER` aplica antes do primeiro render.

### Phase 3 — Persistência v2 (IndexedDB)
- `idb-keyval@^6.2.1` instalado.
- `PersistenceService` com 3 stores (`champions`, `preferences`, `__metadata__`).
- Migração idempotente v1→v2 lê chave legada `nqueens_champions` do localStorage, reescreve em IDB e marca `__migrated_v1_to_v2__`.
- API completa: `getChampions(filter?)`, `saveChampion()` (best-by-metric), `deleteChampion()`, `clearAllChampions()`, `getPreferences()`, `setPreference()`, `exportAll()`, `importAll()`.
- `changeTick` signal para reatividade.

### Phase 4 — Reorganização + Signal Store
- Layout feature-first: `core/`, `shared/`, `design-system/`, `data-access/`, `features/`.
- Pasta legada `src/app/queens-solver/` **completamente removida**.
- `QueensSolverStore` signal-based com selectors derivados (`isRunning`, `hasSolution`, `hasNoSolution`, etc.) e ações (`startSolve`, `updateProgress`, `appendEvolution/Training/Brain`, `completeSolve`, `failSolve`, `cancel`, `loadFromChampion`, `reset`).

### Phase 5 — Web Workers
- 4 workers DedicatedWorker dedicados (`backtracking.worker.ts`, `ga.worker.ts`, `nn.worker.ts`, `brain.worker.ts`).
- Solvers portados como **funções puras** em `workers/_solvers/{utils,backtracking,ga,nn,brain}.ts` — semântica original preservada (Order Crossover GA, Hopfield+min-conflicts híbrido, Brain.js feedforward).
- Protocolo tipado em `workers/protocol.ts`.
- `worker-client.ts` envolve `postMessage` em `Observable<WorkerMessage>`; `unsubscribe()` envia `cancel` e chama `worker.terminate()`.
- `SolverOrchestratorService` despacha via `new Worker(new URL('...', import.meta.url), { type: 'module' })`, alimenta o store com progress/tick/result e auto-persiste solução quando `prefs.autoSaveChampions === true`.

### Phase 6 — Componentes com novo DS
- `AppShellComponent` — sticky top bar com logo, nav (Solver / Campeões / Sobre), GitHub link, ThemeToggle, backdrop blur.
- `ThemeToggleComponent` — Sun/Moon Lucide com aria-label dinâmico.
- `EmptyStateComponent` — SVG inline 4×4 monocromático com 1 acento âmbar.
- `AlgorithmCardComponent` — substitui 4 botões brutos. Card com ícone Lucide colorido pelo algoritmo, descrição de 1 linha, CTA "Executar", barra de progresso integrada, botão Cancelar (aparece durante execução), borda pulsante.
- `FormControlsComponent` — stepper +/- para N (sem spinners nativos), erro inline, checkbox "Evoluir do salvo" (só para AG quando há campeão), botão "Rodar demo".
- `ResultsBoardComponent` — tabuleiro flutuante com sombra, célula 36–60px adaptativa, **queen-reveal escalonada** (60ms × coluna), stats em mono.
- `LoadingStateComponent` — anel SVG + barra de progresso opcional + texto contextual por algoritmo.
- `NoSolutionAlertComponent` — card com left-border 3px danger + ícone Lucide `Ban`.
- `TrainingChartComponent` — Chart.js carregado dinamicamente (`import('chart.js/auto')`), cores por algoritmo via tokens, dark-aware, recria dataset reativamente via `effect()`.
- `ChampionsTableComponent` — **card grid (default)** + tabela (toggle), filtros por algoritmo e por N, ações Ver/Remover/Limpar tudo, accessible.
- `QueensSolverComponent` (página) — hero, FormControls, área de resultado (loading|no-solution|results-board+chart|empty), Champions na base.
- `ChampionsComponent` (página dedicada) e `AboutComponent` (lazy routes).
- `lucide-angular@^1.0.0` instalado (ícones tree-shaken).

### Phase 7 — CI
- `.github/workflows/ci.yml`: checkout → setup-node 22 → npm ci → tsc --noEmit → ng build prod → bundle-size warning gate (>1MB uncompressed) → upload artifact.
- Job opcional Lighthouse CI em PRs com `lighthouserc.json` (assertions warn-only para Performance/A11y/BP, FCP, LCP, TTI).

### Phase 8 — Build verify
- `npm install` ✅
- `ng build --configuration development` ✅ (1.30 MB total, 5 workers compilados)
- `ng build --configuration production` ✅ — **77.81 kB initial transfer**, 281.64 kB raw (orçamento `initial: 500kb warn / 1mb error` honrado).
- Warning brain.js CommonJS suprimido via `allowedCommonJsDependencies: ['brain.js']`.

---

## ⚠️ Gaps remanescentes (não cobertos nesta sessão)

| # | Item | Origem PRD | Por quê não nesta sessão |
|---|---|---|---|
| 1 | **Migração de testes Karma+Jasmine → Vitest** | Phase 4 PRD | Toolchain switch demanda reconfiguração de specs e DX dedicada. Specs antigas removidas; Karma defaults ainda funcionam para escrita de novos specs com `@angular/build:karma`. |
| 2 | **CompareView** (4 mini-tabuleiros lado-a-lado + tabela comparativa) | Phase 4 PRD §10.7 | Botão "Rodar demo" entrega execução sequencial mas não renderiza painel comparativo final. |
| 3 | **Onboarding tooltip-ghost de primeira visita** | PRD §10.1 | UX nice-to-have. |
| 4 | **Pausar/retomar execução** (User story #2) | PRD §6 | Cancelamento funciona; pausa real exigiria checkpoint persistente do estado interno do solver. |
| 5 | **Modo Replay com velocidade x2/x4** (User story #10) | PRD §6 | Demanda re-renderização animada do gráfico a partir do histórico salvo — feature visual extensa. |
| 6 | **Botões de Export/Import JSON na UI** | PRD §16.5 | API pronta em `PersistenceService.exportAll()`/`importAll()`; UI ainda não consumiu. |
| 7 | **Visualização de conflitos** (linhas vermelhas em N=2/3) | User story #6 | Atualmente o NoSolutionAlert é textual. |
| 8 | **Modo Comparar com seed/JSON** | User story #4 | Carregar seed via file picker para AG. |
| 9 | **`prefers-reduced-motion` ajustes finos** | PRD §11 | O reset global já desliga animações; alguns componentes mantêm defaults sem fallback explícito. |
| 10 | **E2E Playwright + visual snapshots** | Phase 4 PRD §18.3 | CI atual cobre type-check + build + Lighthouse warn-only. |

---

## Como rodar localmente

```bash
git checkout develop
npm install
npx ng serve
# abrir http://localhost:4200
```

Para build prod:
```bash
npx ng build --configuration production
# saída em dist/n-rainhas/browser
```

---

## Resumo numérico

| Métrica | Antes (main) | Agora (develop) | Target PRD |
|---|---|---|---|
| Builder | `browser` (legado) | `application` (esbuild) | `application` ✅ |
| Bootstrap CSS+JS | ~170 kB | 0 | 0 ✅ |
| jQuery | ~90 kB | 0 | 0 ✅ |
| zone.js | ~40 kB | 0 (zoneless) | 0 ✅ |
| RxJS | 6.6 (EOL) | 7.8.1 | 7+ ✅ |
| Initial JS transfer (gz est.) | ~380 kB | **77.81 kB** | < 200 kB ✅ |
| TS strict | `false` | `true` | `true` ✅ |
| Persistência | localStorage | IndexedDB | IndexedDB ✅ |
| Solvers | thread principal | 4 Web Workers | Workers ✅ |
| Tema | claro fixo (Bootstrap) | escuro canônico + claro | dark-canonical ✅ |
| Roteamento | nenhum | 3 rotas lazy | lazy ✅ |
| Fontes | system | DM Serif Display + DM Sans + JetBrains Mono | trio editorial ✅ |
| CI | Jenkinsfile (errado) | GitHub Actions | GHA ✅ |

---

— Equipe AIOX · Orquestração Orion 🎯
