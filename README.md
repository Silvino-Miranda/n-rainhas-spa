# ♛ N-Rainhas SPA

Aplicação Angular que resolve o problema das N-Rainhas utilizando quatro algoritmos distintos, com visualização interativa do tabuleiro e gráficos de evolução/treinamento.

## ⚡ Tecnologias Modernas (Angular 21)

Esta aplicação foi refatorada para utilizar os recursos mais recentes do Angular:

- **Standalone Components** – arquitetura modular sem NgModules
- **Signals** – gerenciamento de estado reativo e granular (`WritableSignal`, `input()`, `output()`, `effect()`)
- **Control Flow** – nova sintaxe de template (`@if`, `@for`) para melhor performance e legibilidade
- **Typed Forms** – formulários reativos estritamente tipados

## 🎯 Funcionalidades

- **Backtracking clássico** – solução determinística garantida
- **Algoritmo Genético** – evolução de população com seleção, crossover e mutação
- **Rede Neural de Hopfield** – minimização de energia para encontrar soluções
- **Brain.js** – rede neural treinada para aprender padrões de soluções

### Extras

- Tabuleiro de xadrez interativo com destaque das rainhas
- Gráficos de fitness/energia/erro ao longo das iterações
- Ranking de campeões persistido em **localStorage**
- Opção de evoluir a partir de soluções salvas (seed do AG)

## 🚀 Como executar

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
ng serve
```

Acesse `http://localhost:4200/`.

## 🛠️ Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `ng serve` | Servidor de desenvolvimento com live-reload |
| `ng build` | Build de produção em `dist/` |
| `ng test` | Testes unitários via Karma |

## 📁 Estrutura do projeto

```
src/app/queens-solver/
├── queens-solver.component.ts      # Container principal (Standalone)
└── _shared/
    ├── components/                 # Componentes Standalone reutilizáveis
    │   ├── form-controls/          # Formulário e botões de algoritmos
    │   ├── champions-table/        # Tabela de campeões salvos
    │   ├── loading-state/          # Indicador de carregamento
    │   ├── no-solution-alert/      # Alerta para casos sem solução
    │   ├── results-board/          # Tabuleiro e estatísticas
    │   └── training-chart/         # Gráficos de evolução/treinamento
    └── services/                   # Serviços dos algoritmos e localStorage
```

## 📝 Licença

MIT
