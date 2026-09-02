from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.agent import router as agent_router
from app.api.sectors import router as sectors_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AlphaSector - Autonomous Equity Research Copilot for Indonesian Capital Markets (Sectors Hackathon 2026 - Track 01)"
)

# CORS Middleware configuration with regex for all localhost ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(agent_router, prefix=settings.API_V1_PREFIX)
app.include_router(sectors_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "track": "01 - AI Agents & Assistants",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "sectors_api": "connected" if bool(settings.SECTORS_API_KEY) else "unconfigured"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
