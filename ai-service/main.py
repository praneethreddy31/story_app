from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Story Engine AI Service",
    description="AI-powered story generation and analysis service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Service",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Story Engine AI Service",
        "docs": "/docs",
        "health": "/health"
    }

# Import and include routers
from app.api import story_generation, character_generation, plot_generation, conversational_ai

app.include_router(story_generation.router, prefix="/api/v1", tags=["Story Generation"])
app.include_router(character_generation.router, prefix="/api/v1", tags=["Character Generation"])
app.include_router(plot_generation.router, prefix="/api/v1", tags=["Plot Generation"])
app.include_router(conversational_ai.router, prefix="/api/v1/conversational", tags=["Conversational AI"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
