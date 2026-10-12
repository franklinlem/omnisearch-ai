import pytest
import io
from PIL import Image
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "OmniSearch" in data["service"]

@pytest.mark.asyncio
async def test_category_and_item_workflow(client: AsyncClient):
    # 1. Cria categoria
    cat_res = await client.post("/api/v1/categories", json={"name": "Calçados Esportivos"})
    assert cat_res.status_code == 201
    category = cat_res.json()
    cat_id = category["id"]
    assert category["name"] == "Calçados Esportivos"

    # 2. Cria imagem sintética em bytes
    img = Image.new("RGB", (200, 200), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    image_bytes = buf.getvalue()

    # 3. Cria item no catálogo
    files = {"file": ("tenis_azul.jpg", image_bytes, "image/jpeg")}
    data = {
        "title": "Tênis Azul de Corrida",
        "description": "Tênis esportivo azul royal com amortecimento macio",
        "price": "299.90",
        "category_id": str(cat_id)
    }

    item_res = await client.post("/api/v1/items", data=data, files=files)
    assert item_res.status_code == 201
    item = item_res.json()
    item_id = item["id"]
    assert item["title"] == "Tênis Azul de Corrida"
    assert item["price"] == 299.90

    # 4. Busca textual pelo produto
    search_payload = {
        "query": "tênis de corrida azul",
        "top_k": 5,
        "min_score": 0.0
    }
    search_res = await client.post("/api/v1/search/text", json=search_payload)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["search_type"] == "TEXT"
    assert search_data["total_results"] >= 1
    assert any(i["id"] == item_id for i in search_data["items"])

    # 5. Busca por imagem pelo mesmo produto
    img_search_files = {"file": ("query_image.jpg", image_bytes, "image/jpeg")}
    img_search_res = await client.post(
        "/api/v1/search/image",
        files=img_search_files,
        data={"top_k": "5", "min_score": "0.0"}
    )
    assert img_search_res.status_code == 200
    img_search_data = img_search_res.json()
    assert img_search_data["search_type"] == "IMAGE"
    assert img_search_data["total_results"] >= 1

