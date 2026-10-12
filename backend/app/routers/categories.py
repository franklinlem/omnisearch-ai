import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models.catalog import Category
from app.schemas.item_schemas import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[\s_-]+', '-', text)

@router.get("", response_model=List[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Lista todas as categorias cadastradas."""
    result = await db.execute(select(Category).order_by(Category.name))
    return result.scalars().all()

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(payload: CategoryCreate, db: AsyncSession = Depends(get_db)):
    """Cria uma nova categoria."""
    slug = payload.slug or slugify(payload.name)
    existing = await db.execute(select(Category).where(Category.slug == slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Categoria com este identificador já existe")

    category = Category(name=payload.name, slug=slug)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

