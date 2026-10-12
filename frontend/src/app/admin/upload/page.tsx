"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { api, Category } from "@/lib/api";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Tag
} from "lucide-react";

export default function AdminUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => []);
  }, []);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !price || !selectedFile) {
      setError("Preencha todos os campos e selecione uma foto do produto.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", parseFloat(price).toString());
      if (categoryId) {
        formData.append("category_id", categoryId.toString());
      }
      formData.append("file", selectedFile);

      await api.createItem(formData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Falha ao cadastrar o item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Catálogo</span>
          </Link>

          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>Cadastrar Novo Produto</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Envie as informações e a foto do produto. O modelo SigLIP extrairá o vetor denso de 768 dimensões automaticamente.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Produto cadastrado com sucesso! Redirecionando...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Foto */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <label className="text-xs font-semibold text-slate-200 block">
              Foto do Produto (Alinhamento Visual SigLIP)
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                selectedFile
                  ? "border-indigo-500/60 bg-indigo-950/10"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />

              {previewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-indigo-500/40 shadow-lg">
                    <Image src={previewUrl} alt="Preview" fill unoptimized className="object-cover" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-300">
                    Clique para trocar a imagem
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <UploadCloud className="w-10 h-10 text-slate-500" />
                  <span className="text-xs font-medium text-slate-300">
                    Arraste ou clique para selecionar a foto do item
                  </span>
                  <span className="text-[11px] text-slate-500">JPG, PNG, WEBP</span>
                </div>
              )}
            </div>
          </div>

          {/* Dados do Formulário */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Título do Produto
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Tênis Esportivo de Corrida Amortecimento Pro"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Descrição Detalhada (para busca semântica)
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Tênis unissex confeccionado em malha knit respirável, solado emborrachado com tecnologia de propulsão..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="299.90"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecione uma categoria (Opcional)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extraindo Vetor SigLIP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Cadastrar e Vetorizar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

