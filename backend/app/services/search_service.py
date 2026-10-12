import time
import uuid
import numpy as np
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc

from app.models.catalog import CatalogItem, SearchTelemetry
from app.schemas.item_schemas import ItemResponse, SearchResponse
from app.database import is_postgres

class SearchService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def search_by_vector(
        self,
        query_vector: np.ndarray,
        top_k: int = 12,
        min_score: float = 0.10,
        category_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search_type: str = "TEXT",
        query_display: str = ""
    ) -> SearchResponse:
        start_time = time.perf_counter()

        conditions = [CatalogItem.is_active == True]
        if category_id is not None:
            conditions.append(CatalogItem.category_id == category_id)
        if min_price is not None:
            conditions.append(CatalogItem.price >= min_price)
        if max_price is not None:
            conditions.append(CatalogItem.price <= max_price)

        items: List[ItemResponse] = []

        if is_postgres:
            try:
                # No pgvector com métrica de cosseno:
                # cosine_distance = 1 - cosine_similarity
                # logo, cosine_similarity = 1 - (embedding <=> query_vector)
                similarity_expr = (1 - CatalogItem.embedding.cosine_distance(query_vector.tolist())).label("similarity")

                stmt = (
                    select(CatalogItem, similarity_expr)
                    .where(and_(*conditions))
                    .order_by(CatalogItem.embedding.cosine_distance(query_vector.tolist()))
                    .limit(top_k * 2)
                )

                result = await self.session.execute(stmt)
                rows = result.all()

                for item, sim in rows:
                    sim_float = float(sim)
                    if sim_float >= min_score:
                        items.append(
                            ItemResponse(
                                id=item.id,
                                title=item.title,
                                description=item.description,
                                price=float(item.price),
                                category_id=item.category_id,
                                image_url=item.image_url,
                                thumbnail_url=item.thumbnail_url,
                                similarity_score=round(sim_float, 4),
                                metadata=item.metadata_json or {},
                                created_at=item.created_at
                            )
                        )
                    if len(items) >= top_k:
                        break
            except Exception:
                # Fallback para computação em memória caso extensão pgvector não esteja ativa no DB
                items = await self._search_in_memory(query_vector, conditions, top_k, min_score)
        else:
            # Execução em SQLite / Memória
            items = await self._search_in_memory(query_vector, conditions, top_k, min_score)

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        # Grava telemetria de busca
        try:
            top_score = items[0].similarity_score if items else None
            telemetry = SearchTelemetry(
                id=str(uuid.uuid4()),
                search_type=search_type,
                query_text=query_display[:255] if query_display else None,
                top_score=top_score,
                results_count=len(items),
                latency_ms=round(elapsed_ms, 2)
            )
            self.session.add(telemetry)
            await self.session.commit()
        except Exception:
            pass  # Não falha a busca se o log falhar

        return SearchResponse(
            search_type=search_type,
            query_display=query_display,
            total_results=len(items),
            execution_time_ms=round(elapsed_ms, 2),
            items=items
        )

    async def _search_in_memory(
        self,
        query_vector: np.ndarray,
        conditions: list,
        top_k: int,
        min_score: float
    ) -> List[ItemResponse]:
        """Cálculo em vetor NumPy para ambientes SQLite ou desenvolvimento sem pgvector."""
        stmt = select(CatalogItem).where(and_(*conditions))
        result = await self.session.execute(stmt)
        all_items = result.scalars().all()

        scored_items = []
        q_norm = np.linalg.norm(query_vector)
        if q_norm == 0:
            q_norm = 1.0

        for item in all_items:
            emb = item.embedding
            if isinstance(emb, list):
                item_vec = np.array(emb, dtype=np.float32)
            elif isinstance(emb, np.ndarray):
                item_vec = emb.astype(np.float32)
            else:
                continue

            i_norm = np.linalg.norm(item_vec)
            if i_norm == 0:
                i_norm = 1.0

            # Similaridade de cosseno
            sim = float(np.dot(query_vector, item_vec) / (q_norm * i_norm))

            if sim >= min_score:
                scored_items.append((item, sim))

        # Ordena pela maior similaridade
        scored_items.sort(key=lambda x: x[1], reverse=True)

        items = []
        for item, sim in scored_items[:top_k]:
            items.append(
                ItemResponse(
                    id=item.id,
                    title=item.title,
                    description=item.description,
                    price=float(item.price),
                    category_id=item.category_id,
                    image_url=item.image_url,
                    thumbnail_url=item.thumbnail_url,
                    similarity_score=round(sim, 4),
                    metadata=item.metadata_json or {},
                    created_at=item.created_at
                )
            )
        return items

