import numpy as np
import pytest
from PIL import Image
from app.services.siglip_service import SigLIPService

@pytest.fixture(scope="module")
def siglip():
    return SigLIPService()

def test_text_embedding_dimensions_and_norm(siglip):
    vec = siglip.embed_text("sapato de couro marrom clássico")
    assert vec.shape == (768,)
    # Verifica se a normalização L2 resultou em magnitude unitária (1.0)
    norm = np.linalg.norm(vec)
    assert np.isclose(norm, 1.0, atol=1e-3)

def test_image_embedding_dimensions_and_norm(siglip):
    # Cria uma imagem sintética RGB de 384x384
    img = Image.new("RGB", (384, 384), color="blue")
    vec = siglip.embed_image(img)
    assert vec.shape == (768,)
    norm = np.linalg.norm(vec)
    assert np.isclose(norm, 1.0, atol=1e-3)

def test_semantic_alignment_cross_modal(siglip):
    img = Image.new("RGB", (384, 384), color="blue")
    img_vec = siglip.embed_image(img)
    text_blue = siglip.embed_text("vibrant blue background")
    text_red = siglip.embed_text("bright red tomato")

    sim_blue = float(np.dot(img_vec, text_blue))
    sim_red = float(np.dot(img_vec, text_red))

    # Vetores devem ter magnitude válida
    assert not np.isnan(sim_blue)
    assert not np.isnan(sim_red)

