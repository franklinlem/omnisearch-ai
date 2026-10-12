import io
import logging
import hashlib
import numpy as np
from PIL import Image
from typing import Union, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class SigLIPService:
    _instance: Optional["SigLIPService"] = None

    def __init__(self, model_name: str = settings.MODEL_NAME):
        self.model_name = model_name
        self.device = "cpu"
        self.processor = None
        self.model = None
        self.is_loaded = False
        self._load_model()

    def _load_model(self):
        try:
            import torch
            from transformers import AutoProcessor, AutoModel

            self.device = "cuda" if torch.cuda.is_available() else ("mps" if hasattr(torch.backends, "mps") and torch.backends.mps.is_available() else "cpu")
            logger.info(f"Carregando modelo SigLIP ({self.model_name}) no dispositivo: {self.device}...")
            
            self.processor = AutoProcessor.from_pretrained(self.model_name)
            dtype = torch.float16 if self.device != "cpu" else torch.float32
            self.model = AutoModel.from_pretrained(self.model_name, torch_dtype=dtype).to(self.device)
            self.model.eval()
            self.is_loaded = True
            logger.info("Modelo SigLIP carregado com sucesso!")
        except Exception as e:
            logger.warning(f"Não foi possível carregar SigLIP via Transformers agora ({e}). Ativando modo heurístico de fallback.")
            self.is_loaded = False

    def _fallback_embed(self, seed_str: str) -> np.ndarray:
        """Gera um vetor estocástico determinístico unitário de 768d como fallback."""
        h = int(hashlib.sha256(seed_str.encode("utf-8")).hexdigest()[:8], 16)
        rng = np.random.default_rng(h)
        vec = rng.standard_normal(settings.EMBEDDING_DIM).astype(np.float32)
        norm = np.linalg.norm(vec)
        return vec / (norm if norm > 0 else 1.0)

    def embed_text(self, text: str) -> np.ndarray:
        """Gera embedding normalizado L2 de 768 dimensões para uma string de consulta."""
        if not text or not text.strip():
            text = "produto"

        if self.is_loaded and self.model is not None and self.processor is not None:
            try:
                import torch
                inputs = self.processor(text=[text], return_tensors="pt", padding=True).to(self.device)
                with torch.no_grad():
                    text_features = self.model.get_text_features(**inputs)
                    # Normalização L2 obrigatória para similaridade de cosseno
                    text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
                    return text_features.cpu().numpy()[0].astype(np.float32)
            except Exception as exc:
                logger.error(f"Erro na inferência SigLIP para texto: {exc}. Usando fallback.")

        return self._fallback_embed(f"text:{text.lower().strip()}")

    def embed_image(self, image_input: Union[bytes, Image.Image, str]) -> np.ndarray:
        """Gera embedding normalizado L2 de 768 dimensões para uma imagem (bytes, PIL Image ou path)."""
        if isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
        elif isinstance(image_input, str):
            image = Image.open(image_input).convert("RGB")
        else:
            image = image_input.convert("RGB")

        if self.is_loaded and self.model is not None and self.processor is not None:
            try:
                import torch
                inputs = self.processor(images=[image], return_tensors="pt").to(self.device)
                with torch.no_grad():
                    image_features = self.model.get_image_features(**inputs)
                    image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
                    return image_features.cpu().numpy()[0].astype(np.float32)
            except Exception as exc:
                logger.error(f"Erro na inferência SigLIP para imagem: {exc}. Usando fallback.")

        # Hash visual baseado em histograma de cores redimensionado
        small = image.resize((32, 32))
        avg_colors = np.array(small).mean(axis=(0, 1))
        return self._fallback_embed(f"img:{avg_colors.tolist()}")

# Singleton
_siglip_instance = None

def get_siglip_service() -> SigLIPService:
    global _siglip_instance
    if _siglip_instance is None:
        _siglip_instance = SigLIPService()
    return _siglip_instance

