"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ProductGrid } from "@/components/ProductGrid";
import { useSearch } from "@/hooks/useSearch";
import { Sparkles, Loader2, Database, AlertCircle } from "lucide-react";

export default function HomePage() {
  const {
    query,
    setQuery,
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
    seedDemo,
  } = useSearch();

  const displayItems = searchResults ? searchResults.items : catalogItems;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar onSeedDemo={seedDemo} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Seção Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google SigLIP • Espaço Vetorial Multimodal 768d</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Busca Inteligente por{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Texto ou Imagem
            </span>
          </h1>

          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Encontre produtos por descrições detalhadas em linguagem natural, fotos da galeria ou capturas de webcam em tempo real.
          </p>

          {/* Barra de Busca Unificada */}
          <div className="pt-2">
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              onSearchText={handleTextSearch}
              onSearchImage={handleImageSearch}
              imagePreviewUrl={imagePreviewUrl}
              onClearImage={clearSearch}
              loading={loading}
            />
          </div>
        </section>

        {/* Mensagem de Erro (se houver) */}
        {error && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Banner para catálogo vazio ou Grade de Produtos */}
        {!loading && catalogItems.length === 0 && !searchResults ? (
          <div className="max-w-md mx-auto text-center p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <Database className="w-10 h-10 text-indigo-400 mx-auto opacity-70" />
            <h3 className="text-sm font-semibold text-slate-200">Catálogo Vazio</h3>
            <p className="text-xs text-slate-400">
              Clique abaixo para popular o catálogo com 12 produtos e vetores SigLIP pré-calculados.
            </p>
            <button
              onClick={seedDemo}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/25"
            >
              Popular Demonstração Inicial
            </button>
          </div>
        ) : (
          <section className="flex flex-col lg:flex-row items-start gap-8">
            <FilterSidebar
              categories={categories}
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={() =>
                setFilters({
                  categoryId: null,
                  minPrice: null,
                  maxPrice: null,
                  minScore: 0.10,
                })
              }
            />

            <div className="flex-1 w-full relative">
              {loading && (
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
              )}

              <ProductGrid
                items={displayItems}
                searchResults={searchResults}
                onClearSearch={clearSearch}
                loading={loading}
              />
            </div>
          </section>
        )}
      </main>

      {/* Rodapé */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500 mt-16">
        <p>OmniSearch AI © 2026 • Recuperação Cruzada Imagem-Texto com SigLIP e pgvector</p>
      </footer>
    </div>
  );
}

