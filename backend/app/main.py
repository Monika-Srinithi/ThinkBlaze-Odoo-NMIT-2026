from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import api_router
from contextlib import asynccontextmanager
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dayflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 ThinkBlaze Dayflow starting up...")
    await init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("👋 Dayflow shutting down")


app = FastAPI(
    title="ThinkBlaze Dayflow API",
    description="AI-Powered Workforce Decision Intelligence — NMIT Hackathon 2026",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
origins = settings.BACKEND_CORS_ORIGINS if settings.BACKEND_CORS_ORIGINS else [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    response.headers["X-Response-Time"] = f"{duration}ms"
    return response


# Routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ThinkBlaze Dayflow",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


@app.exception_handler(404)
async def not_found(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": f"Route {request.url.path} not found"})


@app.exception_handler(500)
async def server_error(request: Request, exc):
    logger.error(f"Server error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
