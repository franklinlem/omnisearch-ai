"use client";

import React from "react";
import { ProductCard } from "./ProductCard";
import { CatalogItem, SearchResponse } from "@/lib/api";
import { Sparkles, Zap, X, Search, PackageOpen } from "lucide-react";

interface ProductGridProps {
  items: CatalogItem[];
  searchResults?: SearchResponse | null;
  onClearSearch?: () => void;
  loading?: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  items,
  searchResults,
  onClearSearch,
  loading,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Banner de Telemetria de Busca Ativa */}
      {searchResults && (
        <div className="mb-6 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {searchResults.search_type === "TEXT" ? "Busca Textual" : "Busca Visual por Imagem"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" />
                  {searchResults.execution_time_ms.toFixed(1)} ms
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                "{searchResults.query_display}" • {searchResults.total_results} produto(s) correspondente(s)
              </p>
            </div>
          </div>

          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors self-start sm:self-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Busca</span>
            </button>
          )}
        </div>
      )}

      {/* Grid de Itens */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      ) : !loading ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-950/40 p-8">
          <PackageOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Tente ajustar os termos de busca, diminuir a nota mínima de corte de similaridade ou limpar os filtros.
          </p>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Ver Todo o Catálogo
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

