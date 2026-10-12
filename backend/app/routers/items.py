import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional

from app.database import get_db, is_postgres
from app.models.catalog import CatalogItem, Category
from app.schemas.item_schemas import ItemResponse
from app.services.siglip_service import SigLIPService, get_siglip_service
from app.config import settings

router = APIRouter(prefix="/api/v1/items", tags=["Catalog Items"])

@router.get("", response_model=List[ItemResponse])
async def list_items(
    category_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Lista os itens do catálogo com paginação e filtro opcional por categoria."""
    query = select(CatalogItem).where(CatalogItem.is_active == True)
    if category_id is not None:
        query = query.where(CatalogItem.category_id == category_id)
    query = query.order_by(desc(CatalogItem.created_at)).offset(offset).limit(limit)

    result = await db.execute(query)
    items = result.scalars().all()

    return [
        ItemResponse(
            id=item.id,
            title=item.title,
            description=item.description,
            price=float(item.price),
            category_id=item.category_id,
            image_url=item.image_url,
            thumbnail_url=item.thumbnail_url,
            similarity_score=None,
            metadata=item.metadata_json or {},
            created_at=item.created_at
        )
        for item in items
    ]

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: str, db: AsyncSession = Depends(get_db)):
    """Busca um item específico pelo ID."""
    result = await db.execute(select(CatalogItem).where(CatalogItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    return ItemResponse(
        id=item.id,
        title=item.title,
        description=item.description,
        price=float(item.price),
        category_id=item.category_id,
        image_url=item.image_url,
        thumbnail_url=item.thumbnail_url,
        similarity_score=None,
        metadata=item.metadata_json or {},
        created_at=item.created_at
    )

@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    title: str = Form(..., min_length=2),
    description: str = Form(..., min_length=5),
    price: float = Form(..., ge=0.0),
    category_id: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    siglip: SigLIPService = Depends(get_siglip_service)
):
    """
    Cadastra um novo produto no catálogo.
    Aceita upload direto de arquivo de foto ou URL externa de imagem.
    Gera o vetor denso multimodal de 768d SigLIP automaticamente.
    """
    if not file and not image_url:
        raise HTTPException(status_code=400, detail="É necessário enviar um arquivo de imagem ou uma URL de imagem.")

    final_image_url = ""
    image_bytes = None

    if file:
        if file.content_type and not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="O arquivo deve ser uma imagem válida.")

        image_bytes = await file.read()
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, unique_filename)

        with open(filepath, "wb") as f:
            f.write(image_bytes)

        final_image_url = f"{settings.BASE_URL}/static/uploads/{unique_filename}"
    else:
        final_image_url = image_url or ""
        # Caso seja URL remota, tenta buscar para gerar embedding
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.get(final_image_url, timeout=10.0)
                if resp.status_code == 200:
                    image_bytes = resp.content
        except Exception:
            pass

    # Gera embedding multimodal SigLIP combinando título, descrição e imagem
    embedding_vec = siglip.embed_item(
        title=title,
        description=description,
        image_input=image_bytes
    )

    # Salva no banco de dados
    item_id = str(uuid.uuid4())
    emb_to_store = embedding_vec.tolist() if not is_postgres else embedding_vec.tolist()

    catalog_item = CatalogItem(
        id=item_id,
        title=title,
        description=description,
        price=price,
        category_id=category_id,
        image_url=final_image_url,
        thumbnail_url=final_image_url,
        embedding=emb_to_store,
        metadata_json={},
        is_active=True
    )

    db.add(catalog_item)
    await db.commit()
    await db.refresh(catalog_item)

    return ItemResponse(
        id=catalog_item.id,
        title=catalog_item.title,
        description=catalog_item.description,
        price=float(catalog_item.price),
        category_id=catalog_item.category_id,
        image_url=catalog_item.image_url,
        thumbnail_url=catalog_item.thumbnail_url,
        similarity_score=None,
        metadata=catalog_item.metadata_json or {},
        created_at=catalog_item.created_at
    )

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: str, db: AsyncSession = Depends(get_db)):
    """Remove um item do catálogo."""
    result = await db.execute(select(CatalogItem).where(CatalogItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    await db.delete(item)
    await db.commit()
    return None
