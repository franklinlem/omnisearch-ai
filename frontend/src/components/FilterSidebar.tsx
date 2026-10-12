"use client";

import React from "react";
import { Category } from "@/lib/api";
import { FilterState } from "@/hooks/useSearch";
import { SlidersHorizontal, RotateCcw, DollarSign, Percent } from "lucide-react";

interface FilterSidebarProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  return (
    <aside className="w-full lg:w-64 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-slate-100 text-sm">Filtros Avançados</h3>
        </div>
        <button
          onClick={onResetFilters}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          title="Redefinir filtros"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpar</span>
        </button>
      </div>

      {/* Categorias */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2.5">
          Categorias
        </label>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange({ ...filters, categoryId: null })}
            className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
              filters.categoryId === null
                ? "bg-indigo-600 text-white font-medium"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            Todas as Categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ ...filters, categoryId: cat.id })}
              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                filters.categoryId === cat.id
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Faixa de Preço */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">
          Faixa de Preço (R$)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Mínimo</span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  minPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Máximo</span>
            <input
              type="number"
              min={0}
              placeholder="5000"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  maxPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Nota Mínima de Similaridade (Cutoff Score) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <label className="font-semibold text-slate-300 flex items-center gap-1">
            <Percent className="w-3 h-3 text-indigo-400" />
            Similaridade Mínima
          </label>
          <span className="font-mono text-indigo-400 font-bold">
            {Math.round(filters.minScore * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          step={5}
          value={Math.round(filters.minScore * 100)}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              minScore: parseInt(e.target.value) / 100,
            })
          }
          className="w-full accent-indigo-500"
        />
        <span className="text-[10px] text-slate-500 block mt-1 leading-relaxed">
          Itens abaixo dessa porcentagem no SigLIP serão descartados da resposta.
        </span>
      </div>
    </aside>
  );
};

