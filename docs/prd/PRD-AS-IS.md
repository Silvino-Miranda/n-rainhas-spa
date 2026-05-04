# PRD AS-IS — N-Rainhas SPA

> **Tipo:** Product Requirements Document — fotografia do estado atual (AS-IS).
> **Escopo:** Documentar o produto **como ele existe hoje**, sem propor melhorias, refactors ou roadmap.
> **Data:** 2026-05-06
> **Branch base:** `main` · **Último commit:** `6cd8244 — Add home preview`
> **Equipe AIOX que produziu este PRD:** @architect (Aria), @ux-design-expert (Uma), @data-engineer (Dara), @analyst (Alex), consolidação por @pm (Morgan), orquestração por @aiox-master (Orion).

---

## 1. Sumário Executivo

**N-Rainhas SPA** é uma aplicação web single-page Angular 21 que resolve o **Problema das N-Rainhas** (posicionar N rainhas em tabuleiro NxN sem ataques mútuos) através de **quatro estratégias algorítmicas distintas** apresentadas lado-a-lado: Backtracking determinístico, Algoritmo Genético (AG), Rede Neural de Hopfield híbrida e rede Brain.js feedforward. O aplicativo permite ao usuário comparar visualmente comportamento, performance e convergência das estratégias, persistindo um ranking de "campeões" por algoritmo e tamanho de tabuleiro em `localStorage`.

Não há backend dedicado — toda a computação ocorre no navegador.

---

## 2. Contexto e Domínio

### 2.1 Problema modelado
Problema clássico das N-Rainhas: dado um tabuleiro NxN, posicionar N rainhas de forma que nenhuma compartilhe linha, coluna ou diagonal com outra.

### 2.2 Restrições de domínio assumidas pelo produto
- N suportado: **1 a 15** (`queens-solver.component.ts:72`).
- **N=2 e N=3** não possuem solução — tratado como caso de borda exibido em alerta dedicado (`no-solution-alert.component`).
- N=1 e N≥4 possuem ao menos uma solução.

### 2.3 Proposta de valor (descritiva)
Fornecer uma bancada de comparação interativa entre algoritmos clássicos e heurísticos para o mesmo problema, com visualização do tabuleiro resultante, gráfico de evolução/treinamento e histórico de melhores resultados.

---

## 3. Persona-Alvo (inferida a partir de UI e README)

| Atributo | Valor |
|---|---|
| Perfil | Estudante / pesquisador de IA, otimização combinatória ou algoritmos heurísticos |
| Objetivo | Comparar comportamento de estratégias de resolução em problema combinatório clássico |
| Conhecimento prévio | Familiaridade com os termos "backtracking", "algoritmo genético", "rede neural" |
| Dispositivo | Desktop (layout responsivo até 900px com colapso de colunas) |

---

## 4. Escopo Funcional Atual

### 4.1 Capacidades do produto
1. Configurar o tamanho do tabuleiro N (input numérico).
2. Disparar resolução por um dos quatro algoritmos disponíveis.
3. Visualizar a solução em tabuleiro estilo xadrez.
4. Visualizar gráfico de evolução/treinamento (AG, NN, Brain.js).
5. Persistir automaticamente o melhor resultado por algoritmo e por N (campeão).
6. Visualizar tabela de campeões salvos.
7. Reabrir solução salva no tabuleiro principal.
8. Limpar todos os campeões.
9. Inicializar o AG a partir de um campeão prévio (modo "evoluir a partir do salvo").

### 4.2 Fora do escopo (não implementado)
- Login / multiusuário
- Persistência remota / backend
- Roteamento / múltiplas páginas
- Internacionalização (UI em PT-BR fixo)
- Exportação automática de resultados (existe `exportData()` em serviço, mas sem botão de UI)

---

## 5. Requisitos Funcionais (RF)

### RF-01 · Configuração do tamanho do tabuleiro
- O usuário informa N via campo numérico.
- Validações: `min = 1` (`MIN_QUEENS`), `max = 15` (`MAX_QUEENS`).
- Mensagem de erro inline em texto vermelho (`form-controls.component`).

### RF-02 · Resolução por Backtracking
- Trigger: botão dedicado.
- Saída: tabuleiro com solução, tempo em ms.
- Implementado em `queens-solver.service.ts` (`placeQueens` :17, validação em `isValid` :46).
- Determinístico — mesma N produz mesma solução.

### RF-03 · Resolução por Algoritmo Genético
- Trigger: botão dedicado.
- Parâmetros internos (não expostos na UI):
  - População inicial: 100–300 indivíduos
  - Máximo de gerações: 10.000
  - Mutação: 10% · Crossover: 80% (Order Crossover) · Elitismo: 2
- Saída: tabuleiro, número de gerações, histórico de fitness médio e melhor fitness por geração.
- Permite **seed** a partir de campeão prévio do mesmo N (`evolveFromSaved` checkbox).
- Implementado em `queens-solver-ga.service.ts`.

### RF-04 · Resolução por Rede Neural Híbrida (Hopfield + Min-Conflicts)
- Trigger: botão dedicado.
- Combina min-conflicts, troca neural com critério Metropolis/simulated annealing e perturbação aleatória.
- Até 5 tentativas com reinicialização.
- Saída: tabuleiro, número de iterações, histórico de treinamento.
- Implementado em `queens-solver-nn.service.ts`.

### RF-05 · Resolução por Brain.js
- Trigger: botão dedicado.
- Rede feedforward com 2 camadas ocultas (N*2 neurônios, ativação sigmoid).
- Treinamento prévio com 50 amostras geradas por min-conflicts.
- Etapa final híbrida: predição da rede + min-conflicts + perturbação.
- Saída: tabuleiro, iterações, histórico de aprendizado.
- Implementado em `queens-solver-brain.service.ts`.

### RF-06 · Caso "sem solução" (N=2, N=3)
- Renderiza `NoSolutionAlertComponent` com fundo rosa, texto vermelho-escuro e dica explicativa.

### RF-07 · Estado de carregamento
- Botões desabilitados durante processamento (`form.invalid || isLoading()`).
- `LoadingStateComponent` com spinner CSS e texto contextual por algoritmo ("Calculando...", "Evoluindo...", "Treinando...", "Aprendendo...").

### RF-08 · Visualização da solução
- `ResultsBoardComponent`: tabuleiro 50×50px por célula, cores Lichess (`#f0d9b5` claro, `#b58863` escuro), célula com rainha em verde (`#90EE90` / `#228B22`), ícone `♛` com `text-shadow` dourado.
- Stats: rainhas, algoritmo, tempo, gerações ou iterações conforme algoritmo.

### RF-09 · Gráfico de evolução/treinamento
- `TrainingChartComponent` baseado em Chart.js, renderiza apenas para AG, NN, Brain.js.
- Backtracking não gera gráfico (sem histórico de iterações).

### RF-10 · Persistência de campeões
- Após resolução bem-sucedida, `LocalStorageService.saveChampion()` persiste o melhor resultado por algoritmo e por N.
- Comparação por métrica (`generations | iterations | solveTime`) — só salva se for melhor que o anterior (`local-storage.service.ts:49`).

### RF-11 · Tabela de campeões
- `ChampionsTableComponent` lista todos os campeões salvos (algoritmo, N, métrica, tempo, data).
- Aparece apenas se `getAllChampions().length > 0`.
- Header com `sticky` em fundo amarelo, gradiente âmbar.

### RF-12 · Recarregar solução salva
- Botão "Ver" em cada linha da tabela emite `viewSolution`, recarrega tabuleiro e histórico anexado.

### RF-13 · Limpar campeões
- Botão "Limpar Todos" emite `clearAll` → `LocalStorageService.clearAll()` esvazia chave `nqueens_champions`.

### RF-14 · Migração de formato legado
- `LocalStorageService.migrateFromOldFormat()` (:274) converte chave antiga `nqueens_best_ga_result` para o novo schema hierárquico em primeiro acesso.

---

## 6. Requisitos Não-Funcionais (RNF) observados

### RNF-01 · Stack tecnológica
| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Angular (standalone API + Signals) | ^21.0.3 |
| Linguagem | TypeScript | ~5.9.3 |
| UI | Bootstrap 5.2 + jQuery 3.6 | — |
| IA | brain.js | ^2.0.0-beta.24 |
| Reatividade | RxJS ~6.6, zone.js ~0.15.1 | — |
| Testes | Karma + Jasmine | ~6.3 / ~3.9 |
| Estilos | SCSS | — |

### RNF-02 · Arquitetura runtime
- SPA single-page **sem roteamento** (`AppComponent` renderiza `<app-queens-solver>` diretamente).
- Sem lazy loading — bundle único.
- Componentes **standalone** (sem `NgModule`).
- Estado gerenciado com **Angular Signals** (`WritableSignal`) no componente container.
- Serviços `providedIn: 'root'` (singletons globais).

### RNF-03 · Performance / orçamento de bundle
- Configuração `production` (`angular.json`):
  - Budget warn: 1.5 MB
  - Budget error: 2 MB
  - `outputHashing: all`, otimizações habilitadas, `fileReplacements` para `environment.prod.ts`.
- Configuração `development`: source maps, sem otimização.

### RNF-04 · Limites de processamento
- N ≤ 15 (limitação dura na UI).
- Algoritmos rodam no thread principal — sem Web Workers.

### RNF-05 · Persistência
- Apenas `localStorage` do navegador.
- Chave única: `nqueens_champions`.
- Sem expiração, sem sincronização externa.

### RNF-06 · Acessibilidade / i18n
- Idioma fixo PT-BR.
- Sem ARIA labels declarados nos templates auditados.
- Datas formatadas em locale `pt-BR`.

### RNF-07 · Testes
- Configuração Karma com `code-coverage` habilitado em `angular.json` (target `test`).
- Specs presentes:
  - `app.component.spec.ts`
  - `queens-solver.component.spec.ts`
  - `queens-solver.service.spec.ts`
- Sem suite explícita para serviços GA/NN/Brain.

### RNF-08 · CI/CD
- `Jenkinsfile` presente na raiz, mas **referencia o projeto `API-Opcoes-nest`** em todos os stages — **não executa build nem testes deste SPA**. (Observação factual; ver §10.)

---

## 7. Arquitetura

### 7.1 Estrutura de pastas (relevante)
```
src/
├── main.ts                       # bootstrapApplication(AppComponent)
├── index.html
├── styles.scss                   # vazio
└── app/
    ├── app.component.{ts,html,scss}
    └── queens-solver/
        ├── queens-solver.component.{ts,html,scss}
        └── _shared/
            ├── components/
            │   ├── champions-table/
            │   ├── form-controls/
            │   ├── loading-state/
            │   ├── no-solution-alert/
            │   ├── results-board/
            │   └── training-chart/
            └── services/
                ├── local-storage.service.ts
                ├── queens-solver.service.ts        # backtracking
                ├── queens-solver-ga.service.ts     # genético
                ├── queens-solver-nn.service.ts     # hopfield híbrido
                └── queens-solver-brain.service.ts  # brain.js
```

### 7.2 Diagrama de dependências (textual)
```
AppComponent
└── QueensSolverComponent (container, signals)
    ├── FormControlsComponent ─────► emite ações (backtracking | ga | nn | brain | evolveFromSavedChange)
    ├── LoadingStateComponent
    ├── NoSolutionAlertComponent
    ├── ResultsBoardComponent
    ├── TrainingChartComponent
    ├── ChampionsTableComponent ───► viewSolution | clearAll
    │
    └── injeta: QueensSolverService, QueensSolverGaService,
                QueensSolverNnService, QueensSolverBrainService,
                LocalStorageService
```

### 7.3 Pontos de entrada
| Ponto | Arquivo:linha |
|---|---|
| Bootstrap | `src/main.ts:11` (`bootstrapApplication(AppComponent)`) |
| Root | `src/app/app.component.ts:6` |
| Template raiz | `src/app/app.component.html:1` (`<app-queens-solver>`) |
| Container | `src/app/queens-solver/queens-solver.component.ts:40` |

---

## 8. Inventário UI/UX

### 8.1 Componentes
| Componente | Selector | Papel | Inputs principais | Outputs |
|---|---|---|---|---|
| `AppComponent` | `app-root` | Shell | — | — |
| `QueensSolverComponent` | `app-queens-solver` | Orquestrador (signals) | — | — |
| `FormControlsComponent` | `app-qs-form-controls` | Form e botões dos algoritmos | `form`, `isLoading`, `algorithmUsed`, `minQueens`, `maxQueens`, `evolveFromSaved`, `showEvolveFromSaved` | `backtracking`, `ga`, `nn`, `brain`, `evolveFromSavedChange` |
| `LoadingStateComponent` | `app-qs-loading-state` | Spinner contextual | `isLoading`, `algorithmUsed` | — |
| `NoSolutionAlertComponent` | `app-qs-no-solution-alert` | Alerta N=2/N=3 | `queensCount` | — |
| `ResultsBoardComponent` | `app-qs-results-board` | Tabuleiro xadrez | `solution`, `queensCount`, `algorithmUsed`, `generations`, `iterations`, `solveTime` | — |
| `TrainingChartComponent` | `app-qs-training-chart` | Gráfico Chart.js | `algorithmUsed`, `evolutionHistory`, `trainingHistory`, `brainHistory`, `generations`, `iterations`, `queensCount` | — |
| `ChampionsTableComponent` | `app-qs-champions-table` | Tabela de campeões | `champions` | `viewSolution`, `clearAll` |

### 8.2 Fluxo do usuário (caminho dourado)
1. Abre app → vê formulário com input numérico e 4 botões.
2. Define N → seleciona algoritmo → clica botão.
3. Botões desabilitam, spinner contextual surge.
4. Resultado:
   - Solução → tabuleiro + stats + (se aplicável) gráfico ao lado.
   - Sem solução (N=2, N=3) → alerta dedicado.
5. Se há campeão salvo para aquele N e algoritmo é GA → checkbox "Evoluir a partir do salvo" aparece (default `true`).
6. Resultado é persistido se for melhor que campeão anterior.
7. Tabela de campeões aparece na base com botões "Ver" e "Limpar Todos".
8. "Ver" recarrega solução e seu histórico no tabuleiro principal.

### 8.3 Estilo visual
- **Framework:** Bootstrap (`btn`, `btn-primary/success/warning/info`, `form-control`, `table`, `badge`, `container`).
- **Tabuleiro:** células 50×50px, cores Lichess, rainha em verde com ícone `♛` e `text-shadow` dourado.
- **Cores destacadas:**
  - Checkbox "Evoluir": gradiente verde `#e8f5e9 → #c8e6c9`, borda `#4caf50`.
  - Tabela campeões: gradiente amarelo `#fff9e6 → #fff3cd`, borda âmbar `#ffc107`, header sticky.
  - Erros de form: `#f8d7da` / `#721c24`.
  - Spinner: borda azul `#3498db`, animação `@keyframes spin`.
- **Layout:** flexbox board+chart com breakpoint em 900px (empilha em uma coluna).
- **Tipografia:** sem fonte custom — herda do sistema/Bootstrap.

### 8.4 Estados de feedback
| Estado | Componente | Apresentação |
|---|---|---|
| Loading | `LoadingStateComponent` | Spinner CSS + texto contextual |
| Sem solução | `NoSolutionAlertComponent` | Div `.message.no-solution` |
| Sucesso | `ResultsBoardComponent` | Tabuleiro + stats em fundo `#e9ecef` |
| Validação | inline no container | `.text-danger` |
| Histórico vazio | `ChampionsTableComponent` | Não renderiza |
| Sem gráfico | `TrainingChartComponent` | Não renderiza para Backtracking |

---

## 9. Persistência e Modelo de Dados

### 9.1 Mecanismo
- API: `window.localStorage`.
- Chave única: **`nqueens_champions`**.
- Estrutura hierárquica:
  ```
  {
    [algorithm]: {     // 'backtracking' | 'ga' | 'nn' | 'brain'
      [n]: ChampionResult
    }
  }
  ```
- Migração suportada de chave legada `nqueens_best_ga_result` (`local-storage.service.ts:274`).

### 9.2 Modelo `ChampionResult` (`local-storage.service.ts:11–22`)
| Campo | Tipo | Notas |
|---|---|---|
| `n` | `number` | Tamanho do tabuleiro |
| `algorithm` | `'backtracking' \| 'ga' \| 'nn' \| 'brain'` | — |
| `generations` \| `iterations` | `number?` | Métrica do algoritmo |
| `solveTime` | `number` | ms |
| `date` | `string` | Locale pt-BR |
| `board` | `number[][]` | 1 = rainha, 0 = vazio |
| `evolutionHistory` \| `trainingHistory` \| `brainHistory` | `any[]?` | Histórico por algoritmo |

### 9.3 API pública do `LocalStorageService`
| Método | Propósito |
|---|---|
| `saveChampion(result)` | Salva se métrica < melhor anterior; retorna `boolean` |
| `getChampion(algorithm, n)` | Recupera um campeão |
| `getAllChampions()` | Lista ordenada por N + algoritmo |
| `getChampionsGroupedByN()` | `Map<N, ChampionResult[]>` |
| `getBestChampionForN(n)` | Melhor tempo entre algoritmos |
| `getChampionsByAlgorithm(algorithm)` | Filtra por algoritmo |
| `getStatistics()` | Totais e melhores tempos por N |
| `removeChampion(algorithm, n)` | Remoção pontual |
| `clearAlgorithmChampions(algorithm)` | Limpa todos de um algoritmo |
| `clearAll()` | Esvazia a chave |
| `exportData()` | Serializa para JSON (**sem botão na UI**) |
| `importData(json)` | Importa JSON (**sem botão na UI**) |

### 9.4 Ciclo de vida
1. Após resolver → `saveChampion()` compara métrica, persiste se melhor.
2. Ao carregar app → `getAllChampions()` / `getStatistics()` alimentam tabela.
3. Tabela emite `viewSolution` → recarrega tabuleiro e histórico.
4. Limpeza apenas via UI manual (`clearAll`).

`QueensSolverService` (backtracking) produz somente `board: number[][]` — não persiste; persistência é responsabilidade do componente container.

---

## 10. Build, CI e Distribuição

### 10.1 Scripts npm (`package.json`)
| Script | Comando |
|---|---|
| `start` | `ng serve` |
| `build` | `ng build` |
| `watch` | `ng build --watch --configuration development` |
| `test` | `ng test` |

### 10.2 `angular.json` (target `build`)
- Builder: `@angular-devkit/build-angular:browser`.
- Output: `dist/n-rainhas`.
- Configurações:
  - `production`: budgets (warn 1.5MB / error 2MB), `outputHashing: all`, `fileReplacements` para `environment.prod.ts`.
  - `development`: `sourceMap: true`, sem otimização.

### 10.3 `Jenkinsfile`
- Pipeline declarativo presente na raiz.
- **Todos os stages referenciam o projeto `API-Opcoes-nest` (NestJS) — nenhum stage executa build, lint ou testes do SPA Angular deste repositório.** (Observação descritiva, sem juízo de valor.)

### 10.4 Distribuição
- Sem deploy automatizado configurado para este SPA neste repositório.
- Sem script de release.

---

## 11. Restrições e Limitações Observadas

| # | Restrição | Origem |
|---|---|---|
| L-01 | N máximo = 15 rainhas | UI hardcoded (`queens-solver.component.ts:72`) |
| L-02 | Sem solução para N=2 e N=3 | Domínio do problema |
| L-03 | Computação no thread principal (sem Web Workers) | Implementação atual |
| L-04 | Persistência somente no navegador | `localStorage` único storage |
| L-05 | Sem autenticação ou multi-usuário | Arquitetura |
| L-06 | Sem roteamento — uma única tela | `AppComponent` template |
| L-07 | UI fixa em PT-BR, sem i18n | Templates e formatos de data |
| L-08 | `Jenkinsfile` aponta para outro projeto | Conteúdo do arquivo |
| L-09 | `exportData` / `importData` existem no service mas não na UI | `LocalStorageService` vs templates |
| L-10 | jQuery declarado como dependência | `package.json:22` |

---

## 12. Apêndices

### 12.1 Resumo dos algoritmos (descritivo)

#### A. Backtracking (`queens-solver.service.ts`)
- Recursão com poda por colunas; valida linha, diagonal principal e anti-diagonal.
- Determinístico; mesma N produz a mesma solução.

#### B. Algoritmo Genético (`queens-solver-ga.service.ts`)
- Cromossomo = permutação de linhas (uma rainha por coluna).
- Operadores: seleção por torneio (:258), Order Crossover (:300), swap mutation (:329), elitismo de 2 (:98–104).
- Suporta **seed** com solução salva (:62–63).
- Limites: população 100–300, máx 10.000 gerações.

#### C. Rede Neural Hopfield Híbrida (`queens-solver-nn.service.ts`)
- Combina min-conflicts (:137), troca neural com critério Metropolis/simulated annealing (:181–225) e perturbação aleatória (:231).
- 5 tentativas com reinicialização (:48).

#### D. Brain.js Feedforward (`queens-solver-brain.service.ts`)
- Rede `NeuralNetwork` com 2 camadas ocultas (N*2 neurônios, sigmoid) (:68–72).
- Treinamento com 50 amostras geradas por min-conflicts (:155–201).
- Inferência híbrida: predição da rede + min-conflicts + perturbação (:119–131).

### 12.2 Parâmetros configuráveis pelo usuário (UI)
| Parâmetro | Tipo | Default | Validação |
|---|---|---|---|
| `queensNumber` | número | — | min `MIN_QUEENS`, max 15 |
| `evolveFromSaved` | checkbox | `true` (quando exibido) | Aparece somente se `hasSavedResultForCurrentN()` |

### 12.3 Parâmetros internos (não expostos)
- AG: população=100, mutação=10%, crossover=80%, elitismo=2, máx 10.000 gerações.
- NN Hopfield: 1.000–5.000 iterações adaptativas conforme N.
- Brain.js: 2 camadas ocultas (`N*2`), sigmoid, 50 amostras de treino.

### 12.4 Arquivos auditados nesta consolidação
- `package.json`, `angular.json`, `Jenkinsfile`, `README.md`
- `src/main.ts`, `src/index.html`, `src/styles.scss`
- `src/app/app.component.{ts,html,scss}`
- `src/app/queens-solver/queens-solver.component.{ts,html,scss}`
- `src/app/queens-solver/_shared/components/**/*.{ts,html}`
- `src/app/queens-solver/_shared/services/*.ts`

---

**Fim do PRD AS-IS.** Este documento descreve o estado atual do produto sem propor mudanças. Próximas iterações (TO-BE, gaps, roadmap) ficam fora do escopo deste artefato e devem ser produzidas em PRDs posteriores.
