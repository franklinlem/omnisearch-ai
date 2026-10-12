"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, Camera, X, Image as ImageIcon, Video, RotateCcw } from "lucide-react";

interface ImageDropzoneProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (file: File) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  isOpen,
  onClose,
  onImageSelected,
}) => {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Captura eventos de Ctrl+V (Clipboard API) enquanto o modal estiver aberto
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            onImageSelected(file);
            onClose();
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, onImageSelected, onClose]);

  // Inicializa a câmera webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsWebcamActive(true);
    } catch (err: any) {
      alert("Não foi possível acessar a câmera: " + err.message);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  const captureWebcamSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "camera_snapshot.jpg", { type: "image/jpeg" });
        stopWebcam();
        onImageSelected(file);
        onClose();
      }
    }, "image/jpeg", 0.9);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelected(file);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={() => {
            stopWebcam();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-400" />
          <span>Busca Visual Multimodal SigLIP</span>
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Envie uma foto de referência, cole uma imagem da área de transferência (Ctrl+V) ou capture pela webcam.
        </p>

        {isWebcamActive ? (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={stopWebcam}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={captureWebcamSnapshot}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar e Buscar</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Área de Arraste / Clique */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 bg-slate-950/60 hover:bg-indigo-950/10 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-1">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-200">
                Arraste uma foto aqui ou clique para selecionar
              </span>
              <span className="text-[11px] text-slate-500">
                Dica: Você também pode colar diretamente com Ctrl + V
              </span>
            </div>

            {/* Botão de Câmera */}
            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={startWebcam}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Tirar foto com a Webcam</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

