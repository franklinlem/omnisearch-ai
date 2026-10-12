# Guia de Publicação no GitHub e Deploy no Coolify (`franklem.uk`) 🚀

> **OmniSearch AI: Deploy de Homologação e Produção com Cloudflare, Coolify, Traefik e pgvector.**

---

## 🌐 1. Configuração de DNS na Cloudflare (`franklem.uk`)

O projeto foi configurado com **Proxy Interno no Next.js** (`rewrites` em `next.config.ts`). Isso significa que o frontend encaminha internamente todas as chamadas `/api/...` e `/static/...` para o container `backend:8000` dentro da rede privada do Docker!

### Por que isso é melhor para você?
1. **Você NÃO precisa criar subdomínios separados para a API (`api...`).**
2. **Atenção ao SSL Gratuito da Cloudflare:** O certificado gratuito da Cloudflare cobre `*.franklem.uk` (1º nível), mas **não** cobre sub-subdomínios com ponto extra como `homolog.omnisearch.franklem.uk` quando a nuvem laranja está ativa. Por isso, usamos **hífen (`-`)**:

### Registros DNS para criar na Cloudflare:

| Tipo | Nome (Name) | Conteúdo (Target) | Proxy Status | Uso |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `omnisearch` | `IP_DA_SUA_VPS_CONTABO` | Proxied (Nuvem Laranja) ou DNS Only | **Produção** (`https://omnisearch.franklem.uk`) |
| **A** | `homolog-omnisearch` | `IP_DA_SUA_VPS_CONTABO` | Proxied (Nuvem Laranja) ou DNS Only | **Homologação** (`https://homolog-omnisearch.franklem.uk`) |

*(Nota: Se você quiser usar apenas `omnisearch.franklem.uk` inicialmente para testar tudo, basta criar apenas o registro `omnisearch`!)*

---

## 🐙 2. Passo 1: Disponibilizar o Repositório no GitHub

1. Acesse [github.com/new](https://github.com/new) e crie o repositório privado **`omnisearch-ai`**.
2. No terminal local:

```bash
cd /home/franklin/Documentos/OmniSearch

# Adicionar o remote do seu GitHub
git remote add origin git@github.com:SEU_USUARIO/omnisearch-ai.git

# Enviar as branches main e develop
git push -u origin main
git push -u origin develop
```

---

## 🚢 3. Passo 2: Configurar Homologação no Coolify (Branch `develop`)

1. No painel do Coolify, clique em **+ New Resource** -> **Application** -> **Docker Compose**.
2. Selecione o repositório **`omnisearch-ai`** e a branch **`develop`**.
3. No serviço **`frontend`**, configure o domínio:
   - **Domains:** `https://homolog-omnisearch.franklem.uk` (porta `3000`).
   - *(O serviço `backend` não precisa de domínio público exposto, pois o `frontend` conversa com ele internamente via `http://backend:8000`).*
4. Na aba **Environment Variables**, adicione:
   ```env
   POSTGRES_DB=omnisearch_staging_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=senha_forte_staging_123
   DATABASE_URL=postgresql+asyncpg://postgres:senha_forte_staging_123@db:5432/omnisearch_staging_db
   BACKEND_INTERNAL_URL=http://backend:8000
   MODEL_NAME=google/siglip-base-patch16-384
   ```
5. Clique em **Deploy**.

---

## 🏆 4. Passo 3: Configurar Produção no Coolify (Branch `main`)

Depois de validar em homologação:

1. Faça o merge da `develop` na `main`:
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```
2. Crie o recurso de produção no Coolify apontando para a branch **`main`**.
3. No serviço **`frontend`**, configure o domínio:
   - **Domains:** `https://omnisearch.franklem.uk` (porta `3000`).
4. Configure as **Environment Variables** de produção:
   ```env
   POSTGRES_DB=omnisearch_prod_db
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=senha_forte_producao_2026
   DATABASE_URL=postgresql+asyncpg://postgres:senha_forte_producao_2026@db:5432/omnisearch_prod_db
   BACKEND_INTERNAL_URL=http://backend:8000
   MODEL_NAME=google/siglip-base-patch16-384
   ```
5. Clique em **Deploy**.
