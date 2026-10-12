-- Habilita a extensão de busca vetorial
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- Tabela Principal de Itens do Catálogo
CREATE TABLE IF NOT EXISTS catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    -- Vetor de 768 dimensões gerado pelo SigLIP-base
    embedding vector(768) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice HNSW para busca vetorial por similaridade de cosseno
CREATE INDEX IF NOT EXISTS idx_catalog_items_embedding_hnsw 
ON catalog_items USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Índices relacionais para filtros combinados
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_price ON catalog_items(price);
CREATE INDEX IF NOT EXISTS idx_catalog_items_created_at ON catalog_items(created_at);

-- Tabela de Logs de Telemetria de Busca
CREATE TABLE IF NOT EXISTS search_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_type VARCHAR(20) NOT NULL, -- 'TEXT' ou 'IMAGE'
    query_text TEXT,
    top_score NUMERIC(5, 4),
    results_count INTEGER NOT NULL,
    latency_ms NUMERIC(8, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

