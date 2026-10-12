import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.config import settings

logger = logging.getLogger(__name__)

is_postgres = settings.DATABASE_URL.startswith("postgresql")

connect_args = {}
if not is_postgres:
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        if is_postgres:
            try:
                await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            except Exception as e:
                logger.warning(f"Aviso ao inicializar extensão pgvector: {e}")
        from app.models import catalog  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Tabelas do banco de dados verificadas/criadas com sucesso.")

