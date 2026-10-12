import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.services.siglip_service import get_siglip_service
from app.routers import search_router, items_router, categories_router, seed_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("omnisearch")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando OmniSearch AI Backend Core...")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await init_db()
    
    # Inicializa / pré-aquece o serviço de visão SigLIP em segundo plano
    try:
        siglip = get_siglip_service()
        logger.info(f"SigLIP Service pronto (dispositivo: {siglip.device}, carregado: {siglip.is_loaded}).")
    except Exception as e:
        logger.warning(f"Erro ao inicializar SigLIP no startup: {e}")

    yield
    logger.info("Encerrando OmniSearch AI Backend Core...")

app = FastAPI(
    title=settings.APP_NAME,
    description="Motor de Busca Semântica Multimodal Imagem-Texto com SigLIP e pgvector",
    version="0.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Arquivos Estáticos para Imagens Enviadas e Amostras
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Roteadores
app.include_router(search_router)
app.include_router(items_router)
app.include_router(categories_router)
app.include_router(seed_router)

@app.get("/health", tags=["Health"])
async def health_check():
    siglip = get_siglip_service()
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "siglip_model": settings.MODEL_NAME,
        "siglip_loaded": siglip.is_loaded,
        "siglip_device": siglip.device,
        "database": settings.DATABASE_URL.split("://")[0]
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": "0.1.0",
        "docs_url": "/docs",
        "health_url": "/health"
    }

