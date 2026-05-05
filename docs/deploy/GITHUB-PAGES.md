# GitHub Pages — runbook

> **Resumo:** o workflow `.github/workflows/ci.yml` faz build + deploy automático em push para `main` ou `develop`. **Mas Pages precisa ser ativado uma única vez manualmente.** Este documento detalha tudo.

---

## Por que setup manual

`actions/configure-pages` aceita `enablement: true`, **mas** essa flag exige scope `Administration: write` na token. O `GITHUB_TOKEN` default do workflow nunca recebe esse scope (mesmo declarando `permissions: pages: write`). Resultado:

```
HttpError: Resource not accessible by integration
Create Pages site failed.
```

Caminhos pra resolver:

| Opção | Esforço | Segurança | Recomendado |
|---|---|---|---|
| **Setup manual (UI)** | 30s, 1 vez | máxima | ✅ |
| PAT (Personal Access Token) com scope `repo` + admin | médio | tem que rotacionar token | só pra automação massiva |
| GitHub App | alto | máxima | overkill pra repo único |

Adotamos a opção 1.

---

## Passo a passo (uma vez por repo)

### 1. Habilitar Pages

1. Abrir: `https://github.com/Silvino-Miranda/n-rainhas-spa/settings/pages`
2. **Build and deployment** → **Source**: selecionar **GitHub Actions** (não "Deploy from a branch").
3. Salvar (clica fora ou aperta Enter — interface salva automático).

### 2. Confirmar permissões do workflow

1. Abrir: `https://github.com/Silvino-Miranda/n-rainhas-spa/settings/actions`
2. Em **Workflow permissions**:
   - Marcar **Read and write permissions** (ou manter `Read-only` se preferir e usar permissions explícitas no YAML — já estão).
3. Em **Allow GitHub Actions to create and approve pull requests**: opcional, não relacionado.

### 3. (Opcional) Criar environment "github-pages"

GitHub cria automaticamente quando o primeiro `actions/deploy-pages@v4` roda com sucesso. Mas se quiser pré-configurar:

1. Abrir: `https://github.com/Silvino-Miranda/n-rainhas-spa/settings/environments`
2. **New environment** → nome **github-pages**
3. Em **Deployment branches**: adicionar `main` e `develop` (cada um numa linha separada).
4. Em **Environment protection rules**: opcional adicionar reviewers.

### 4. Push para develop ou main

Após os passos 1 e 2, qualquer push em `main` ou `develop` aciona:
- ✅ build (lint + typecheck + test + ng build)
- ✅ lighthouse (warn-only)
- ✅ deploy → publica no Pages

URL final: `https://silvino-miranda.github.io/n-rainhas-spa/`

---

## Troubleshooting

### `Get Pages site failed. ... Not Found`

Pages **nunca foi ativado**. Voltar ao passo 1.

### `Resource not accessible by integration` (na criação)

`enablement: true` foi passado mas a token não tem `Administration: write`. Ou remove `enablement: true` (estado atual do workflow) **e** ativa Pages manualmente, ou usa PAT (ver abaixo).

### `error 405 — Branch deploy is required` ou `repository is private`

GitHub Pages em repos **privados** exige plano Pro/Team/Enterprise. Em conta Free, repo precisa ser público.

### Deploy roda mas site retorna 404 em rotas internas (`/champions`, `/about`)

O workflow já copia `index.html` para `404.html` (passo `SPA fallback`). Confirme que o artifact uploadado contém ambos:
```bash
gh run view <run-id> --log | grep 404.html
```
Se faltou, o passo `cp` falhou silenciosamente — abre issue.

### Site carrega mas assets quebram

Verifica `--base-href`. Está parametrizado a partir de `github.event.repository.name` → resolve `/n-rainhas-spa/`. Se renomear o repo, o base-href atualiza sozinho.

### Lighthouse falha mas deploy passou

Lighthouse roda com `continue-on-error: true`. Não bloqueia deploy. Acessa o relatório no link público que a action posta.

---

## Alternativa: PAT (não recomendado, mas existe)

Se não quiser ativar manualmente, dá pra usar PAT com scope necessário:

1. `https://github.com/settings/tokens` → **Generate new token (classic)**
2. Scopes: `repo` (full) + `admin:repo_hook` (não estritamente necessário, mas comum em fluxos pages)
   - Para fine-grained: `Administration: Read and write` no repo específico.
3. Copia o token.
4. Em `https://github.com/Silvino-Miranda/n-rainhas-spa/settings/secrets/actions` → **New repository secret**: nome `PAGES_PAT`, valor o token.
5. No workflow:
   ```yaml
   - name: Setup Pages
     uses: actions/configure-pages@v5
     with:
       enablement: true
       token: ${{ secrets.PAGES_PAT }}
   ```

Risco: PAT vaza? alguém com push pode rodar workflow_dispatch e usar a token. Setup manual é menos arriscado.

---

## Mudar de branch principal (futuro)

Quando o projeto tiver fluxo `develop → PR → main` consolidado:

1. Editar `.github/workflows/ci.yml` jobs `lighthouse` e `deploy`:
   - Remover a cláusula `|| github.ref == 'refs/heads/develop'`.
2. Push direto em `main` deixa de existir; deploy só após merge de PR.
3. (Opcional) Configurar branch protection em `main`: `Settings → Branches → Add rule → main → Require pull request reviews`.

---

## Observabilidade pós-deploy

| O que | Onde |
|---|---|
| Histórico de deploys | `https://github.com/Silvino-Miranda/n-rainhas-spa/deployments` |
| Logs do último run | `Actions` tab → último run → job `Deploy to GitHub Pages` |
| URL do site (com hash de commit) | output do step `deploy-pages` (`page_url`) |
| Lighthouse report | comentário automático no PR ou artifact uploaded |

---

## Manutenção

- Sempre que mover entre branches que ainda não estão no `if:` do deploy, deploy é skipado (intencional).
- Se rotacionar o repositório (rename), base-href e host atualizam sozinhos via `${{ github.event.repository.name }}`.
- Quando `actions/checkout@v5`, `actions/setup-node@v5`, etc. saírem com Node 24 nativo, remover o env `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` do workflow.
