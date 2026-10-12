import os
import uuid
from PIL import Image, ImageDraw, ImageFont
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db, is_postgres
from app.models.catalog import Category, CatalogItem
from app.services.siglip_service import SigLIPService, get_siglip_service
from app.config import settings

router = APIRouter(prefix="/api/v1/seed", tags=["Seed Demo Data"])

def create_demo_image(title: str, bg_color: str, fg_color: str, filename: str) -> str:
    """Gera uma imagem de demonstração local e salva na pasta de uploads."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    img = Image.new("RGB", (384, 384), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Desenha moldura e detalhes visuais
    draw.rectangle([16, 16, 368, 368], outline=fg_color, width=3)
    draw.rectangle([32, 32, 352, 280], fill=fg_color)
    
    # Adiciona texto descritivo
    draw.text((40, 300), title[:25], fill=fg_color)

    img.save(filepath, "JPEG", quality=90)
    return f"{settings.BASE_URL}/static/uploads/{filename}"

SAMPLE_DATA = [
    {
        "category": "Calçados",
        "slug": "calcados",
        "items": [
            {
                "title": "Sapato de Couro Clássico Oxford Marrom",
                "description": "Sapato social masculino confeccionado em couro legítimo nobre, solado costurado e acabamento artesanal brilhante para ocasiões formais.",
                "price": 349.90,
                "bg_color": "#4a2c11",
                "fg_color": "#d7b899",
                "filename": "sapato_oxford_marrom.jpg"
            },
            {
                "title": "Tênis de Corrida Esportivo Amortecimento Pro",
                "description": "Tênis esportivo unissex com malha respirável knit, tecnologia de propulsão responsiva e solado de borracha aderente para maratonas e treino.",
                "price": 429.00,
                "bg_color": "#1e3a8a",
                "fg_color": "#60a5fa",
                "filename": "tenis_corrida_pro.jpg"
            },
            {
                "title": "Bota Feminina Chelsea Tratorada Couro Preto",
                "description": "Bota chelsea com elásticos laterais, cano médio e solado tratorado robusto emborrachado para estilo urbano moderno e conforto.",
                "price": 289.90,
                "bg_color": "#18181b",
                "fg_color": "#a1a1aa",
                "filename": "bota_chelsea_preta.jpg"
            }
        ]
    },
    {
        "category": "Moda & Vestuário",
        "slug": "moda-vestuario",
        "items": [
            {
                "title": "Vestido Floral Fresco Midi para Casamento",
                "description": "Vestido midi confeccionado em tecido leve e esvoaçante com estampa botânica floral e decote elegante, ideal para eventos e casamentos ao ar livre.",
                "price": 259.90,
                "bg_color": "#831843",
                "fg_color": "#fbcfe8",
                "filename": "vestido_floral_midi.jpg"
            },
            {
                "title": "Jaqueta Jeans Oversized Vintage Lavagem Clara",
                "description": "Jaqueta jeans com modelagem ampla anos 90, botões metálicos envelhecidos e bolsos funcionais para sobreposição estilosa em dias amenos.",
                "price": 199.90,
                "bg_color": "#0284c7",
                "fg_color": "#bae6fd",
                "filename": "jaqueta_jeans_vintage.jpg"
            },
            {
                "title": "Camisa de Linho Puro Manga Longa Branca",
                "description": "Camisa casual masculina em linho 100% natural, toque macio, corte slim fit e respirabilidade superior para dias quentes de verão.",
                "price": 189.00,
                "bg_color": "#e2e8f0",
                "fg_color": "#334155",
                "filename": "camisa_linho_branca.jpg"
            }
        ]
    },
    {
        "category": "Eletrônicos",
        "slug": "eletronicos",
        "items": [
            {
                "title": "Headphone Bluetooth com Cancelamento Ativo de Ruído",
                "description": "Fone de ouvido circum-aural com drivers de alta fidelidade de 40mm, cancelamento de ruído ANC adaptativo e autonomia de até 40 horas de bateria.",
                "price": 599.00,
                "bg_color": "#09090b",
                "fg_color": "#6366f1",
                "filename": "headphone_anc_pro.jpg"
            },
            {
                "title": "Câmera Fotográfica Mirrorless Retrô 4K",
                "description": "Câmera compacta com design analógico clássico, sensor APS-C de 26MP, gravação de vídeo em 4K e simulação de películas de filme cinematográfico.",
                "price": 4200.00,
                "bg_color": "#27272a",
                "fg_color": "#f59e0b",
                "filename": "camera_mirrorless_retro.jpg"
            },
            {
                "title": "Teclado Mecânico Gamer Compacto Switch Red",
                "description": "Teclado mecânico 75% com switches lineares macios, iluminação RGB personalizável por tecla e estrutura com isolamento acústico em silicone.",
                "price": 319.90,
                "bg_color": "#701a75",
                "fg_color": "#f472b6",
                "filename": "teclado_mecanico_rgb.jpg"
            }
        ]
    },
    {
        "category": "Decoração & Casa",
        "slug": "decoracao-casa",
        "items": [
            {
                "title": "Luminária de Mesa Pendente Estilo Industrial",
                "description": "Luminária decorativa com cúpula em metal preto fosco, detalhes em cobre escovado e suporte para lâmpada de filamento de carbono quente.",
                "price": 149.90,
                "bg_color": "#78350f",
                "fg_color": "#fcd34d",
                "filename": "luminaria_industrial.jpg"
            },
            {
                "title": "Poltrona Estofada Contemporânea Bege Bouclé",
                "description": "Poltrona de sala com tecido bouclé texturizado de toque felpudo, curvas orgânicas ergonômicas e base em madeira maciça de carvalho.",
                "price": 890.00,
                "bg_color": "#fef3c7",
                "fg_color": "#78350f",
                "filename": "poltrona_boucle_bege.jpg"
            },
            {
                "title": "Vaso de Cerâmica Artesanal Minimalista Terracota",
                "description": "Vaso decorativo modelado à mão em argila terracota natural com acabamento fosco e textura rústica para arranjos florais secos.",
                "price": 89.90,
                "bg_color": "#9a3412",
                "fg_color": "#fed7aa",
                "filename": "vaso_ceramica_terracota.jpg"
            }
        ]
    }
]

@router.post("")
async def seed_demo_data(
    db: AsyncSession = Depends(get_db),
    siglip: SigLIPService = Depends(get_siglip_service)
):
    """Popula o catálogo com 12 produtos de demonstração em 4 categorias e computa seus vetores SigLIP."""
    total_created = 0

    for cat_data in SAMPLE_DATA:
        # Busca ou cria a categoria
        res = await db.execute(select(Category).where(Category.slug == cat_data["slug"]))
        category = res.scalar_one_or_none()
        if not category:
            category = Category(name=cat_data["category"], slug=cat_data["slug"])
            db.add(category)
            await db.flush()

        for item_info in cat_data["items"]:
            # Gera imagem local
            img_url = create_demo_image(
                title=item_info["title"],
                bg_color=item_info["bg_color"],
                fg_color=item_info["fg_color"],
                filename=item_info["filename"]
            )

            # Gera embedding SigLIP multimodal para o item (combinando semântica textual e visual)
            local_img_path = os.path.join(settings.UPLOAD_DIR, item_info["filename"])
            img_vec = siglip.embed_item(
                title=item_info["title"],
                description=item_info["description"],
                image_input=local_img_path if os.path.exists(local_img_path) else None
            )

            # Verifica se já existe: se existir, atualiza o vetor e a imagem
            res_item = await db.execute(select(CatalogItem).where(CatalogItem.title == item_info["title"]))
            existing_item = res_item.scalar_one_or_none()
            if existing_item:
                existing_item.embedding = img_vec.tolist()
                existing_item.image_url = img_url
                existing_item.thumbnail_url = img_url
                continue

            item = CatalogItem(
                id=str(uuid.uuid4()),
                title=item_info["title"],
                description=item_info["description"],
                price=item_info["price"],
                category_id=category.id,
                image_url=img_url,
                thumbnail_url=img_url,
                embedding=img_vec.tolist(),
                metadata_json={"brand": "OmniSearch Premium", "in_stock": True},
                is_active=True
            )
            db.add(item)
            total_created += 1

    await db.commit()
    return {
        "message": f"Catálogo populado e vetores SigLIP atualizados com sucesso! ({total_created} novos itens criados).",
        "items_created": total_created
    }

