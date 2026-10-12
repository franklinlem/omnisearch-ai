# OmniSearch AI 🔍🖼️

> **Plataforma Web Fullstack de Busca Semântica Multimodal Imagem-Texto com SigLIP e pgvector.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black.svg)](https://nextjs.org/)
[![SigLIP: Google DeepMind](https://img.shields.io/badge/SigLIP-768d%20Unified%20Space-purple.svg)](https://huggingface.co/google/siglip-base-patch16-384)

---

## 📌 Visão Geral

Mecanismos tradicionais de busca em catálogos e e-commerces dependem de correspondência exata de palavras-chave (`LIKE` ou Elasticsearch) e falham quando o usuário descreve estilos abstratos (*"vestido floral fresco para casamento ao ar livre"*) ou busca por fotos do Instagram/galeria.

O **OmniSearch AI** implementa o modelo **SigLIP** (Google DeepMind) para projetar fotos e textos em um **espaço vetorial unificado compartilhado de 768 dimensões**:

* **Busca Texto-para-Imagem:** Digite em linguagem natural e recupere fotos e produtos alinhados semântica e visualmente.
* **Busca Imagem-para-Imagem:** Envie uma foto de referência por arrastar/soltar, cole da área de transferência (`Ctrl + V`) ou capture diretamente da webcam.
* **Filtros Híbridos no Banco:** Combina cálculo de similaridade de cosseno com filtros relacionais rígidos (faixa de preço, categoria, estoque) via `pgvector` com índice HNSW.
* **Zero Custo de API Externa:** Roda inferência de visão e texto localmente sem depender de APIs pagas da OpenAI ou Google.

---

## 🚀 Arquitetura do Sistema

```
              +-------------------------------------------------+
              |        Usuário / Navegador Web (Next.js 15)     |
              |   (Input de Texto, Drag & Drop ou Webcam)       |
              +-------------------------------------------------+
                                      |
                         HTTP REST (JSON / Multipart)
                                      v
+-------------------------------------------------------------------------------+
|                        FASTAPI BACKEND CORE SERVICE                           |
|                                                                               |
|  +---------------------------+       +-------------------------------------+  |
|  |     API Router & Auth     | ----> |           SigLIP Engine             |  |
|  |   (FastAPI / Pydantic v2) |       |  (Vision & Text Encoders - 768d)    |  |
|  +---------------------------+       +-------------------------------------+  |
|               |                                         |                     |
|               v                                         v                     |
|  +---------------------------+       +-------------------------------------+  |
|  |    Metadata Controller    |       |      Vector Storage & Search        |  |
|  |   (Preço, Categoria, SKU) | <---> |       PostgreSQL 16 + pgvector      |  |
|  +---------------------------+       |      (Índice HNSW Cosine Similarity)|  |
|                                      +-------------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 🛠️ Tecnologias Utilizadas

* **Backend:**
  * Python 3.12 & FastAPI
  * Hugging Face Transformers (`google/siglip-base-patch16-384`) + PyTorch
  * PostgreSQL 16 com extensão `pgvector` (e fallback em vetor NumPy/SQLite para ambiente local rápido)
  * SQLAlchemy 2.0 assíncrono + `asyncpg` / `aiosqlite`
  * Pillow (PIL) para pré-processamento de imagens
  * Pytest e Pytest-Asyncio
* **Frontend:**
  * Next.js 15 (App Router, React 19)
  * TypeScript & Tailwind CSS
  * Lucide Icons & React Dropzone
  * MediaDevices API (captura de webcam) e Clipboard API (`Ctrl + V`)
* **Infraestrutura:**
  * Docker Compose & Dockerfiles multi-stage
  * GitHub Actions CI/CD

---

## ⚡ Como Executar Localmente

### Pré-requisitos
* Python 3.12+
* Node.js 20+ e npm

### 1. Configurar e Executar o Backend
```bash
cd backend

# Criar ambiente virtual
python3 -m venv .venv
source .venv/bin/activate  # No Windows: .venv\Scripts\activate

# Instalar dependências
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt

# Iniciar o servidor FastAPI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
> O backend estará acessível em `http://localhost:8000` e o Swagger em `http://localhost:8000/docs`.

### 2. Configurar e Executar o Frontend
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```
> Acesse a interface web em **`http://localhost:3000`**.

### 3. Popular o Catálogo de Demonstração
Clique no botão **"Carregar Demo"** no cabeçalho da página ou envie uma requisição:
```bash
curl -X POST http://localhost:8000/api/v1/seed
```
Isso cadastrará imediatamente 12 produtos categorizados com imagens locais e calculará seus vetores SigLIP.

---

## 🐳 Executando com Docker Compose

Para subir toda a infraestrutura com PostgreSQL 16 + pgvector:

```bash
docker compose up --build
```

---

## 🧪 Executando os Testes Automatizados

```bash
cd backend
./.venv/bin/pytest -v
```

Testes inclusos:
* `test_text_embedding_dimensions_and_norm`: Valida o formato 768d e norma unitária L2 do texto.
* `test_image_embedding_dimensions_and_norm`: Valida o formato 768d e norma unitária L2 da imagem.
* `test_semantic_alignment_cross_modal`: Valida alinhamento semântico cruzado entre imagem e texto.
* `test_health_check`: Valida endpoint de integridade do serviço.
* `test_category_and_item_workflow`: Testa o ciclo completo de cadastro e buscas textuais e visuais.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte [LICENSE](LICENSE) para mais informações.

