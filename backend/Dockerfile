# Estágio de build e download de dependências
FROM python:3.12-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential gcc git && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
# Instala PyTorch CPU enxuto antes do requirements.txt para economizar >2.5GB de pacotes CUDA na VPS
RUN pip install --no-cache-dir --user torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir --user -r requirements.txt

# Estágio final de execução enxuto
FROM python:3.12-slim
WORKDIR /app
RUN useradd -m -u 1000 appuser && \
    apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=appuser:appuser /root/.local /home/appuser/.local
COPY --chown=appuser:appuser . /app

RUN mkdir -p /app/static/uploads /app/.cache/huggingface && \
    chown -R appuser:appuser /app /home/appuser

ENV PATH=/home/appuser/.local/bin:$PATH
ENV HF_HOME=/app/.cache/huggingface
USER appuser
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
