"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Camera, X, Loader2, Sparkles } from "lucide-react";
import { ImageDropzone } from "./ImageDropzone";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearchText: (query: string) => void;
  onSearchImage: (file: File) => void;
  imagePreviewUrl?: string | null;
  onClearImage?: () => void;
  loading?: boolean;
}

const QUICK_SEARCH_EXAMPLES = [
  "vestido floral para casamento",
  "sapato social de couro marrom",
  "headphone cancelamento de ruído",
  "jaqueta jeans vintage oversized",
  "luminária industrial moderna",
];

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onSearchText,
  onSearchImage,
  imagePreviewUrl,
  onClearImage,
  loading,
}) => {
  const [isDropzoneOpen, setIsDropzoneOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchText(query);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/* Barra de Busca Principal */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-slate-900 border border-slate-700/80 hover:border-indigo-500/60 focus-within:border-indigo-500 rounded-2xl shadow-2xl p-1.5 transition-all group"
      >
        {/* Preview da Imagem Selecionada (se houver) */}
        {imagePreviewUrl ? (
          <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-indigo-950/60 border border-indigo-700/50 rounded-xl mr-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black flex-shrink-0">
              <Image src={imagePreviewUrl} alt="Foto de busca" fill unoptimized className="object-cover" />
            </div>
            <span className="text-xs font-semibold text-indigo-200 hidden sm:inline">
              Buscando por foto
            </span>
            <button
              type="button"
              onClick={onClearImage}
              className="p-1 hover:bg-indigo-900/60 rounded-md text-indigo-300 hover:text-white transition-colors"
              title="Remover imagem"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="pl-3.5 text-slate-500">
            <Search className="w-5 h-5 text-indigo-400" />
          </div>
        )}

        {/* Input de Texto */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={
            imagePreviewUrl
              ? "Imagem carregada. Pressione Buscar ou digite para refinar..."
              : "Descreva o que procura em linguagem natural (ex: vestido floral fresco)..."
          }
          className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 px-3 py-2 text-sm focus:outline-none focus:ring-0"
        />

        {/* Botão de Limpar Texto */}
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors mr-1"
            title="Limpar texto"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Botão de Busca por Foto / Webcam */}
        <button
          type="button"
          onClick={() => setIsDropzoneOpen(true)}
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mr-1"
          title="Buscar por imagem (upload, câmera ou colar foto)"
        >
          <Camera className="w-5 h-5 text-indigo-400 hover:scale-110 transition-transform" />
        </button>

        {/* Botão de Submeter */}
        <button
          type="submit"
          disabled={loading || (!query.trim() && !imagePreviewUrl)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 flex-shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Buscar</span>
              <Sparkles className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Sugestões Rápidas de Busca */}
      <div className="flex items-center gap-1.5 flex-wrap px-2">
        <span className="text-[11px] text-slate-500 font-medium mr-1">Sugestões:</span>
        {QUICK_SEARCH_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              onQueryChange(example);
              onSearchText(example);
            }}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 border border-slate-800/80 hover:border-indigo-500/30 transition-colors"
          >
            {example}
          </button>
        ))}
      </div>

      {/* Modal de Upload de Imagem & Câmera */}
      <ImageDropzone
        isOpen={isDropzoneOpen}
        onClose={() => setIsDropzoneOpen(false)}
        onImageSelected={onSearchImage}
      />
    </div>
  );
};

