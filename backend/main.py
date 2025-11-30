# backend/main.py
"""
FastAPI application entry point.
Run with: uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from api.agent_configs import router as agent_router
from api.start_call import router as start_call_router
from api.webhook import router as webhook_router
from api.calls import router as calls_router
from api.seed import router as seed_router

app = FastAPI(
    title="AI Voice Agent API",
    description="Backend API for the AI Voice Agent Dashboard",
    version="1.0.0",
)

# CORS middleware - Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(agent_router)
app.include_router(start_call_router)
app.include_router(calls_router)
app.include_router(seed_router)

# Webhook router (no /api/v1 prefix - external service callback)
app.include_router(webhook_router)


@app.get("/", tags=["Health"])
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "AI Voice Agent API is running"}


@app.get("/health", tags=["Health"])
def health():
    """Health check endpoint."""
    return {"status": "healthy"}
