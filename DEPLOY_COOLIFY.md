# Guia de Publicação no GitHub e Deploy no Coolify (VPS Contabo) 🚀

> **OmniSearch AI: Deploy de Homologação e Produção com Docker, Traefik e pgvector no Coolify.**

---

## 📋 1. Estratégia de Ambientes e Branches

Para garantir que outros serviços em execução na sua VPS da Contabo **não sofram nenhuma alteração ou conflito**, adotamos a seguinte separação:

| Ambiente | Branch Git | Domínio Sugerido (Traefik) | Banco de Dados | Objetivo |
| :--- | :--- | :--- | :--- | :--- |
| **Homologação (Staging)** | `develop` | `https://homolog.omnisearch.seu-dominio.com` | `omnisearch_staging_db` | Validação de novos recursos, testes de visão SigLIP e aprovação pré-deploy. |
| **Produção (Production)** | `main` | `https://omnisearch.seu-dominio.com` | `omnisearch_prod_db` | Versão estável pública com alta disponibilidade e dados consolidados. |

---

## 🐙 2. Passo 1: Disponibilizar o Repositório no GitHub

### 2.1 Criar o Repositório Privado no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Nomeie o repositório como: **`omnisearch-ai`**.
3. Selecione a opção **Private** (Privado).
4. **Não** marque a opção de inicializar com README ou .gitignore (já criamos e otimizamos todos os arquivos localmente).
5. Clique em **Create repository**.

### 2.2 Conectar e Fazer Push Local
No terminal do seu computador (no diretório `/home/franklin/Documentos/OmniSearch`):

```bash
cd /home/franklin/Documentos/OmniSearch

# 1. Adicionar o remote do seu repositório privado no GitHub
git remote add origin git@github.com:SEU_USUARIO/omnisearch-ai.git
# (ou via HTTPS): git remote add origin https://github.com/SEU_USUARIO/omnisearch-ai.git

# 2. Enviar a branch principal (main)
git push -u origin main

# 3. Criar e enviar a branch de homologação (develop)
git checkout -b develop
git push -u origin develop
```

---

## 🚢 3. Passo 2: Configuração no Coolify (VPS Contabo)

O Coolify gerencia automaticamente os containers Docker, certificados SSL Let's Encrypt e o roteamento pelo **Traefik**.

### 3.1 Conectar o GitHub ao Coolify
1. No painel do Coolify, vá em **Sources** -> **GitHub**.
2. Conecte sua conta do GitHub via **GitHub App** ou use uma **Deploy Key** gerada pelo Coolify adicionada nas configurações do seu repositório no GitHub (*Settings -> Deploy keys*).

---

### 3.2 Criar a Aplicação de Homologação (Branch `develop`)

1. No Coolify, selecione o seu **Projeto** e clique em **+ New Resource** -> **Application** -> **Docker Compose**.
2. Selecione o repositório privado **`omnisearch-ai`**.
3. Defina a branch como: **`develop`**.
4. Defina o Compose file path: `docker-compose.yml`.
5. Nomeie o recurso no Coolify: `omnisearch-staging`.

#### Configuração de Domínios e Traefik no Coolify (Homologação):
No Coolify, nas configurações do serviço:
* **Frontend:** Configure o domínio FQDN: `https://homolog.omnisearch.seu-dominio.com` (apontando para a porta `3000`).
* **Backend:** Configure o domínio FQDN: `https://api-homolog.omnisearch.seu-dominio.com` (apontando para a porta `8000`).

#### Variáveis de Ambiente no Coolify (Homologação):
Na aba **Environment Variables** da aplicação de homologação:

```env
# Banco de dados isolado de homologação
POSTGRES_DB=omnisearch_staging_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=sua_senha_segura_staging_123
DATABASE_URL=postgresql+asyncpg://postgres:sua_senha_segura_staging_123@db:5432/omnisearch_staging_db

# URLs públicas roteadas pelo Traefik
NEXT_PUBLIC_API_URL=https://api-homolog.omnisearch.seu-dominio.com
BASE_URL=https://api-homolog.omnisearch.seu-dominio.com

# Modelo de IA
MODEL_NAME=google/siglip-base-patch16-384
```

6. Clique em **Deploy** no Coolify.

---

### 3.3 Validar o Funcionamento em Homologação

1. Acesse o domínio de homologação: `https://homolog.omnisearch.seu-dominio.com`.
2. Verifique a saúde da API acessando: `https://api-homolog.omnisearch.seu-dominio.com/health`.
3. Clique no botão **"Carregar Demo"** para popular os 12 produtos e gerar os vetores SigLIP no PostgreSQL.
4. Teste:
   - Busca por texto (ex: *"vestido floral casamento"*).
   - Busca por imagem (upload de foto da galeria ou webcam).
   - Cadastro de um produto no `/admin/upload`.

---

## 🏆 4. Passo 3: Promoção para Produção (Branch `main`)

Após validar e aprovar o funcionamento no ambiente de homologação:

### 4.1 Fazer Merge da `develop` na `main`
No terminal local ou via Pull Request no GitHub:

```bash
git checkout main
git merge develop
git push origin main
```

### 4.2 Criar a Aplicação de Produção no Coolify
1. No Coolify, dentro do mesmo Projeto (ou ambiente *Production*), adicione **+ New Resource** -> **Application** -> **Docker Compose**.
2. Selecione o mesmo repositório, porém escolha a branch **`main`**.
3. Nomeie o recurso no Coolify: `omnisearch-prod`.

#### Configuração de Domínios no Traefik (Produção):
* **Frontend:** `https://omnisearch.seu-dominio.com` (porta `3000`).
* **Backend:** `https://api.omnisearch.seu-dominio.com` (porta `8000`).

#### Variáveis de Ambiente no Coolify (Produção):
```env
# Banco de dados de produção exclusivo e persistente
POSTGRES_DB=omnisearch_prod_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=senha_ultra_segura_producao_2026_xyz
DATABASE_URL=postgresql+asyncpg://postgres:senha_ultra_segura_producao_2026_xyz@db:5432/omnisearch_prod_db

# URLs de Produção
NEXT_PUBLIC_API_URL=https://api.omnisearch.seu-dominio.com
BASE_URL=https://api.omnisearch.seu-dominio.com

MODEL_NAME=google/siglip-base-patch16-384
```

4. Clique em **Deploy**. O Coolify compilará a versão da `main` e o Traefik emitirá o certificado SSL automaticamente!

---

## 🛡️ 5. Garantias de Não Interferência na VPS Contabo

* **Nomes dos Containers e Redes:** O Coolify cria redes Docker isoladas por aplicação e nomeia os containers com hashes únicos, garantindo que o banco de dados e os serviços do OmniSearch fiquem completamente encapsulados.
* **Sem Colisão de Portas do Host:** As portas não são expostas globalmente no host `0.0.0.0`; o Traefik do Coolify roteia o tráfego pela rede interna do Docker com base nos cabeçalhos `Host:` (`homolog.omnisearch...` e `omnisearch...`).
* **Outros Serviços Intactos:** Webhooks, sites existentes e containers legados não são modificados de nenhuma maneira.
