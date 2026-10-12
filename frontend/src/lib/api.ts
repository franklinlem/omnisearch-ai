export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category_id?: number | null;
  image_url: string;
  thumbnail_url?: string | null;
  similarity_score?: number | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface TextSearchRequest {
  query: string;
  top_k?: number;
  min_score?: number;
  category_id?: number | null;
  min_price?: number | null;
  max_price?: number | null;
}

export interface SearchResponse {
  search_type: "TEXT" | "IMAGE";
  query_display: string;
  total_results: number;
  execution_time_ms: number;
  items: CatalogItem[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const api = {
  async searchByText(params: TextSearchRequest): Promise<SearchResponse> {
    const res = await fetch(`${API_BASE}/api/v1/search/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Erro na busca textual" }));
      throw new Error(err.detail || "Falha na busca textual");
    }
    return res.json();
  },

  async searchByImage(
    file: File | Blob,
    options?: {
      top_k?: number;
      min_score?: number;
      category_id?: number | null;
      min_price?: number | null;
      max_price?: number | null;
    }
  ): Promise<SearchResponse> {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.top_k) formData.append("top_k", options.top_k.toString());
    if (options?.min_score !== undefined) formData.append("min_score", options.min_score.toString());
    if (options?.category_id) formData.append("category_id", options.category_id.toString());
    if (options?.min_price) formData.append("min_price", options.min_price.toString());
    if (options?.max_price) formData.append("max_price", options.max_price.toString());

    const res = await fetch(`${API_BASE}/api/v1/search/image`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Erro na busca visual" }));
      throw new Error(err.detail || "Falha na busca visual");
    }
    return res.json();
  },

  async listItems(categoryId?: number | null): Promise<CatalogItem[]> {
    const url = new URL(`${API_BASE}/api/v1/items`);
    if (categoryId) url.searchParams.set("category_id", categoryId.toString());
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao carregar itens do catálogo");
    return res.json();
  },

  async getItem(id: string): Promise<CatalogItem> {
    const res = await fetch(`${API_BASE}/api/v1/items/${id}`);
    if (!res.ok) throw new Error("Item não encontrado");
    return res.json();
  },

  async createItem(formData: FormData): Promise<CatalogItem> {
    const res = await fetch(`${API_BASE}/api/v1/items`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Erro ao criar produto" }));
      throw new Error(err.detail || "Falha ao cadastrar produto");
    }
    return res.json();
  },

  async listCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/api/v1/categories`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao buscar categorias");
    return res.json();
  },

  async seedDemoData(): Promise<{ message: string; items_created: number }> {
    const res = await fetch(`${API_BASE}/api/v1/seed`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Erro ao popular catálogo de demonstração");
    return res.json();
  },
};

