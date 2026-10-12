"use client";

import { useState, useEffect, useCallback } from "react";
import { api, CatalogItem, SearchResponse, Category } from "@/lib/api";

export interface FilterState {
  categoryId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  minScore: number;
}

export function useSearch() {
  const [query, setQuery] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    minScore: 0.10,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega categorias e catálogo inicial
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, items] = await Promise.all([
        api.listCategories().catch(() => []),
        api.listItems(filters.categoryId).catch(() => []),
      ]);
      setCategories(cats);
      setCatalogItems(items);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [filters.categoryId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Executa busca textual
  const handleTextSearch = async (textQuery?: string) => {
    const q = textQuery !== undefined ? textQuery : query;
    if (!q || !q.trim()) {
      clearSearch();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setImageFile(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }

      const res = await api.searchByText({
        query: q,
        top_k: 24,
        min_score: filters.minScore,
        category_id: filters.categoryId,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
      });
      setSearchResults(res);
    } catch (err: any) {
      setError(err.message || "Falha na busca textual");
    } finally {
      setLoading(false);
    }
  };

  // Executa busca por imagem
  const handleImageSearch = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setQuery("");
      setImageFile(file);

      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      const preview = URL.createObjectURL(file);
      setImagePreviewUrl(preview);

      const res = await api.searchByImage(file, {
        top_k: 24,
        min_score: filters.minScore,
        category_id: filters.categoryId,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
      });
      setSearchResults(res);
    } catch (err: any) {
      setError(err.message || "Falha na busca por imagem");
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setSearchResults(null);
    setError(null);
    loadInitialData();
  };

  const seedDemo = async () => {
    try {
      setLoading(true);
      await api.seedDemoData();
      await loadInitialData();
    } catch (err: any) {
      setError(err.message || "Erro ao popular catálogo");
    } finally {
      setLoading(false);
    }
  };

  return {
    query,
    setQuery,
    imageFile,
    imagePreviewUrl,
    filters,
    setFilters,
    categories,
    catalogItems,
    searchResults,
    loading,
    error,
    handleTextSearch,
    handleImageSearch,
    clearSearch,
    loadInitialData,
    seedDemo,
  };
}
