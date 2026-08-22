from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

def get_async_url(url: str) -> str:
    if url.startswith('postgresql://') and '+asyncpg' not in url:
        return url.replace('postgresql://', 'postgresql+asyncpg://', 1)
    if url.startswith('sqlite:///') and '+aiosqlite' not in url:
        return url.replace('sqlite:///', 'sqlite+aiosqlite:///', 1)
    return url

ASYNC_DATABASE_URL = get_async_url(settings.DATABASE_URL)

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,
    connect_args={'check_same_thread': False} if 'sqlite' in ASYNC_DATABASE_URL else {},
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        from app.models import user, employee, attendance, leave, payroll, audit  # noqa
        await conn.run_sync(Base.metadata.create_all)
