# Self-hosted deploy (K3s VPS) — opcional

> **Status atual:** o deploy oficial é via **GitHub Pages** (`.github/workflows/ci.yml` job `deploy`). Os arquivos descritos aqui **não são usados pelo Pages** — ficam aqui para quando você quiser hospedar a app na sua VPS K3s.

## Arquivos envolvidos

| Caminho | Função |
|---|---|
| `Dockerfile` | Multi-stage: build com pnpm + serve estático com nginx alpine. |
| `docker/nginx.conf` | Server estático: SPA fallback, gzip, cache imutável de assets, `/healthz`, security headers. |
| `.dockerignore` | Mantém imagem enxuta (exclui `.git`, `.aiox-core`, `dist`, etc.). |
| `compose.yaml` | Stack local de teste (`docker compose up --build`). |
| `k8s/namespace.yaml` | Namespace `n-rainhas`. |
| `k8s/deployment.yaml` | 2 réplicas, `runAsNonRoot`, readOnly rootFS, probes em `/healthz`, requests/limits enxutos. |
| `k8s/service.yaml` | `ClusterIP` 80 → container 8080. |
| `k8s/ingress.yaml` | Traefik (já vem com K3s). Substituir `n-rainhas.example.com`. |
| `k8s/kustomization.yaml` | Aglutina os manifests; permite trocar `image:tag` em uma linha. |

## Build local

```bash
docker build -t n-rainhas-spa:dev .
docker run --rm -p 8080:8080 n-rainhas-spa:dev
# abrir http://localhost:8080
```

Ou com compose:

```bash
docker compose up --build
```

## Publicar no registry (GHCR)

```bash
docker build -t ghcr.io/silvino-miranda/n-rainhas-spa:1.0.0 .
docker push ghcr.io/silvino-miranda/n-rainhas-spa:1.0.0
```

Para builds reproduzíveis com caminho diferente do root, passe `BASE_HREF`:

```bash
docker build --build-arg BASE_HREF=/n-rainhas/ -t n-rainhas-spa:subpath .
```

## Aplicar no K3s

```bash
# 1. Trocar a imagem no kustomization (uma linha)
cd k8s
kustomize edit set image ghcr.io/silvino-miranda/n-rainhas-spa=ghcr.io/silvino-miranda/n-rainhas-spa:1.0.0

# 2. Trocar o host no ingress.yaml para o seu domínio real
sed -i 's/n-rainhas.example.com/n-rainhas.seudominio.com/' ingress.yaml

# 3. Aplicar
kubectl apply -k .

# 4. Verificar
kubectl -n n-rainhas get pods,svc,ingress
kubectl -n n-rainhas logs deploy/n-rainhas-web -f
```

## TLS (cert-manager)

Se ainda não tem cert-manager:

```bash
helm repo add jetstack https://charts.jetstack.io && helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set installCRDs=true
```

Depois cria um `ClusterIssuer` Let's Encrypt e descomenta:

- `cert-manager.io/cluster-issuer: letsencrypt-prod` em `ingress.yaml`
- O bloco `tls:` em `ingress.yaml`

## Atualizar versão em produção

```bash
docker build -t ghcr.io/silvino-miranda/n-rainhas-spa:1.0.1 .
docker push ghcr.io/silvino-miranda/n-rainhas-spa:1.0.1
kubectl -n n-rainhas set image deploy/n-rainhas-web web=ghcr.io/silvino-miranda/n-rainhas-spa:1.0.1
kubectl -n n-rainhas rollout status deploy/n-rainhas-web
```

Ou rebuild + `kubectl apply -k k8s/` se preferir manter tudo em git.

## Observações

- O container **não roda como root** (`runAsUser: 101 / runAsGroup: 101`, usuário `nginx`). Por isso a porta é **8080**, não 80.
- `readOnlyRootFilesystem: true` — diretórios writable (`/var/cache/nginx`, `/var/run`, `/tmp`) montados via `emptyDir`.
- Probes em `/healthz` (location dedicada no nginx, retorna 200 instantâneo).
- Cache: assets com hash → `Cache-Control: public, max-age=1y, immutable`. `index.html` → `no-cache`.
- gzip habilitado para JS/CSS/SVG/JSON/wasm. Brotli não vem na imagem base — adicionar `nginx-brotli` no Dockerfile se quiser.
- Bundle inicial v2: ~80 kB transfer (do PRD). Com gzip nativo do nginx fica ainda mais leve no fio.
