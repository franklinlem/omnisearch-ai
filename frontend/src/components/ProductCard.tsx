"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, ShoppingCart, Tag } from "lucide-react";
import { CatalogItem } from "@/lib/api";

interface ProductCardProps {
  item: CatalogItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const matchPercent =
    item.similarity_score !== undefined && item.similarity_score !== null
      ? Math.round(item.similarity_score * 100)
      : null;

  return (
    <div className="group relative bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/50 hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col">
      {/* Imagem do Produto */}
      <div className="relative w-full aspect-square bg-slate-950 overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 p-4 text-center">
            <Tag className="w-8 h-8 mb-2 opacity-40" />
            <span className="text-xs font-medium">{item.title}</span>
          </div>
        ) : (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            unoptimized
            onError={() => setImgError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        )}

        {/* Badge de Similaridade Multimodal */}
        {matchPercent !== null && (
          <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-indigo-500/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-indigo-200">
              {matchPercent}% match
            </span>
          </div>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-semibold text-slate-100 text-sm line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
          <span className="text-sm font-mono font-bold text-slate-100">
            {item.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
          <button className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Comprar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

