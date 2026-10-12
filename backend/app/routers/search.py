from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.services.siglip_service import SigLIPService, get_siglip_service
from app.services.search_service import SearchService
from app.schemas.item_schemas import TextSearchRequest, SearchResponse

router = APIRouter(prefix="/api/v1/search", tags=["Search"])

@router.post("/text", response_model=SearchResponse)
async def search_by_text(
    payload: TextSearchRequest,
    db: AsyncSession = Depends(get_db),
    siglip: SigLIPService = Depends(get_siglip_service)
):
    """
    Busca semântica multimodal Texto-para-Imagem.
    Projeta o texto no espaço vetorial SigLIP e busca itens alinhados.
    """
    query_vector = siglip.embed_text(payload.query)
    search_service = SearchService(db)
    return await search_service.search_by_vector(
        query_vector=query_vector,
        top_k=payload.top_k,
        min_score=payload.min_score,
        category_id=payload.category_id,
        min_price=payload.min_price,
        max_price=payload.max_price,
        search_type="TEXT",
        query_display=payload.query
    )

@router.post("/image", response_model=SearchResponse)
async def search_by_image(
    file: UploadFile = File(...),
    top_k: int = Form(12),
    min_score: float = Form(0.10),
    category_id: Optional[int] = Form(None),
    min_price: Optional[float] = Form(None),
    max_price: Optional[float] = Form(None),
    db: AsyncSession = Depends(get_db),
    siglip: SigLIPService = Depends(get_siglip_service)
):
    """
    Busca semântica multimodal Imagem-para-Imagem.
    Recebe uma foto (upload, webcam ou clipboard) e busca itens visualmente similares.
    """
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="O arquivo enviado deve ser uma imagem válida.")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Arquivo de imagem vazio.")

    query_vector = siglip.embed_image(image_bytes)
    search_service = SearchService(db)
    return await search_service.search_by_vector(
        query_vector=query_vector,
        top_k=top_k,
        min_score=min_score,
        category_id=category_id,
        min_price=min_price,
        max_price=max_price,
        search_type="IMAGE",
        query_display=file.filename or "uploaded_image.jpg"
    )

