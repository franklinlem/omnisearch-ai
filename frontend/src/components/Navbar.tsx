"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, PlusCircle, Github, Database } from "lucide-react";

interface NavbarProps {
  onSeedDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSeedDemo }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              OmniSearch AI
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              Busca Multimodal SigLIP
            </span>
          </div>
        </Link>

        {/* Links de Ação */}
        <div className="flex items-center gap-3">
          {onSeedDemo && (
            <button
              onClick={onSeedDemo}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/50 rounded-lg transition-colors"
              title="Inserir produtos de demonstração pré-configurados"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Carregar Demo</span>
            </button>
          )}

          <Link
            href="/admin/upload"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/25 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </Link>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
            title="Repositório GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};

