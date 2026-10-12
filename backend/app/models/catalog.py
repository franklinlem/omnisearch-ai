import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base, is_postgres
from app.config import settings

def get_utc_now():
    return datetime.now(timezone.utc)

# Tipo dinâmico para embedding
if is_postgres:
    try:
        from pgvector.sqlalchemy import Vector
        EmbeddingColType = Vector(settings.EMBEDDING_DIM)
    except ImportError:
        EmbeddingColType = JSON
else:
    EmbeddingColType = JSON

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    items = relationship("CatalogItem", back_populates="category")

class CatalogItem(Base):
    __tablename__ = "catalog_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Vetor de 768 dimensões gerado pelo SigLIP-base
    embedding = mapped_column(EmbeddingColType, nullable=False)

    metadata_json: Mapped[dict] = mapped_column("metadata", JSON, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now, nullable=False)

    category = relationship("Category", back_populates="items")

class SearchTelemetry(Base):
    __tablename__ = "search_telemetry"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    search_type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'TEXT' ou 'IMAGE'
    query_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    top_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    results_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=get_utc_now, nullable=False)

