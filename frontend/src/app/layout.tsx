import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniSearch AI - Busca Semântica Multimodal Imagem-Texto com SigLIP",
  description: "Plataforma de recuperação cruzada texto-imagem e busca por similaridade visual com SigLIP e pgvector.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}

