from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = None

class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str

class ItemCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=5)
    price: float = Field(..., ge=0.0)
    category_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class ItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    price: float
    category_id: Optional[int] = None
    image_url: str
    thumbnail_url: Optional[str] = None
    similarity_score: Optional[float] = None
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict, alias="metadata")
    created_at: datetime

class TextSearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Texto descritivo para busca semântica")
    top_k: int = Field(default=12, ge=1, le=50)
    min_score: float = Field(default=0.10, ge=0.0, le=1.0)
    category_id: Optional[int] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None

class SearchResponse(BaseModel):
    search_type: str  # 'TEXT' ou 'IMAGE'
    query_display: str
    total_results: int
    execution_time_ms: float
    items: List[ItemResponse]

