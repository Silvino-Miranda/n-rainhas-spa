# Backlog de ideias — N-Rainhas SPA

> Lista viva de melhorias além do PRD v2 já entregue. Prioridade reflete bang/buck (impacto × esforço). Atualize ao puxar uma ideia para implementação ou descartar.

**Convenção:** marcar com `🎯` quando puxar para sprint, `✅` quando entregue, `❌` se descartado.

---

## 🔥 Quick wins (1–3h cada)

| Status | Ideia | Impacto |
|---|---|---|
| | Atalhos de teclado (B/G/N/J pra algoritmos, Esc cancel, +/- N, D demo) | Power-user adore |
| | URL params (`?n=8&algo=ga&run=1`) — share link com run reprodutível | Compartilhamento |
| | Modo apresentação (rota fullscreen sem topbar) | Demo em aula |
| | PWA / Service Worker (`ng add @angular/pwa`) — offline + install | UX moderna |
| | View Transitions API entre rotas Solver/Champions/About | Polish visual |
| | Confetti ao bater campeão pessoal (canvas-confetti, ~3KB) | Engajamento |
| | Open Graph card dinâmico — share gera thumb com solução | Viral |

---

## 🎓 Domain-rich (educacional, 4–12h)

| Status | Ideia | Por quê |
|---|---|---|
| | Compare mode (4 mini-boards lado-a-lado + tabela comparativa) | Gap do PRD v2 |
| | Replay step-by-step GA/NN com slider de tempo | Ver evolução acontecendo |
| | Visualização de conflitos (N=2/3 ou em runs falhos) — linhas vermelhas conectando rainhas atacadas | Clareza pedagógica |
| | Gallery de soluções únicas (N=4→2, N=8→92, N=12→14200) com filtro simétricas/fundamentais | Demonstra combinatória |
| | Drawer "Como funciona" por algoritmo — pseudocode + complexidade | Onboarding técnico |
| | Curva tempo × N — gráfico secundário rodando todos algoritmos N=4..15 | Mostra scaling |
| | Stress test — roda mesmo N várias vezes, média/stdev/distribuição | Comparação rigorosa |
| | Heatmap de posições mais visitadas no espaço de busca | Visualização avançada |

---

## ⚡ Performance (4–16h)

| Status | Ideia | Ganho |
|---|---|---|
| | WASM solver (Rust → wasm pra backtracking) | 10–50× speedup em N grande |
| | SharedArrayBuffer + workers paralelos pra GA (population partitioning) | 4× em CPU multi-core |
| | N até 20+ com warning de tempo | Stress real |
| | Lighthouse score badge no README | Disciplina |
| | AVIF/WebP nas screenshots | Página README mais leve |

---

## 🌍 i18n (8h)

| Status | Ideia | Impacto |
|---|---|---|
| | `@angular/localize` — PT/EN/ES | Audiência global |
| | Toggle de idioma na AppShell | UX |

---

## 📊 Observabilidade (2–6h)

| Status | Ideia | Por quê |
|---|---|---|
| | Plausible/Umami opt-in — qual algoritmo + N mais usados | Aprende uso real |
| | Performance API marks ao redor de cada step do solver | Profile fino |
| | Toggle debug visual (canal `console.debug` já existe; expor via UI) | Demo educacional |

---

## 🛠 Dev/DX (4–12h)

| Status | Ideia | Valor |
|---|---|---|
| | Storybook pros componentes do DS (AlgorithmCard, ResultsBoard, etc.) | Showcase + dev solo |
| | Playwright E2E — golden path: N=8 → run BT → ver tabuleiro → champions | Gap do PRD v2 |
| | Visual regression (Playwright snapshots) | Anti-regressão DS |
| | Coverage badge + meta ≥80% | Disciplina |
| | Bundle size badge | Visibilidade |
| | ADRs (Architecture Decision Records) em `docs/adr/` | Memória institucional |
| | Conventional commits + changelog automático | Release ops |

---

## 🎉 Easter eggs (1h cada)

| Status | Ideia |
|---|---|
| | Konami code → 4 algoritmos rodam ao mesmo tempo |
| | N=8 com solução visualmente simétrica → pisca dourado especial |
| | Trofeuzinho de pixel ao bater 5 campeões diferentes |

---

## 🌐 Backend-needed (1–3 dias cada)

> Estes precisam de servidor (Supabase, Cloudflare Workers + KV, Firebase, Pocketbase…). Avaliar custo operacional vs valor.

| Status | Ideia | Por quê |
|---|---|---|
| | Leaderboard global — ranking menor tempo por N | Competição |
| | Compartilhar campeão com link permanente (KV store) | Engajamento |
| | Compete mode — desafia tempo de outro user em tempo real | Multiplayer leve |

---

## 📝 Documentação extra (1–2h)

| Status | Ideia |
|---|---|
| | GIF animado 30s no README mostrando uma run completa |
| | Vídeo demo no YouTube linkado no README |
| | Storybook publicado como sub-rota Pages (`/storybook/`) |

---

## Top-5 sugeridos pra começar

1. ⚡ **Atalhos de teclado** — 1h, power-user adoration
2. 🎓 **Compare mode** — fecha gap PRD, valor educacional alto
3. 🎉 **Confetti em novo campeão** — 30min, instantly fun
4. 🔗 **URL params** — share reproducible runs
5. 📱 **PWA via `ng add`** — offline + install + Lighthouse 100

---

## Como usar este arquivo

- Não é roadmap formal — é **parking lot** de ideias.
- Ao puxar uma para sprint: marca `🎯` na coluna Status, abre issue/branch.
- Ao terminar: marca `✅` e linka commit ou PR à direita.
- Ao descartar: marca `❌` e adiciona uma linha com o motivo logo abaixo.
- Quando algo virar PRD formal, mover para `docs/prd/` e remover daqui.
