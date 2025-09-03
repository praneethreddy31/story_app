import os
from dotenv import load_dotenv
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# FIX 1: Load environment variables at the very top.
# This makes sure all secrets are available before any other code runs.
load_dotenv()

# Your original FastAPI app setup
app = FastAPI(
    title="Story Engine AI Service",
    description="AI-powered story generation and analysis service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# FIX 2: Make the CORS "Guest List" dynamic.
# This code will allow your live Node.js server to connect.
origins_str = os.environ.get("CORS_ORIGINS")
if not origins_str:
    # This is a fallback for local development if the variable isn't set.
    allowed_origins = ["http://localhost:4200", "http://localhost:3001"]
else:
    allowed_origins = [origin.strip() for origin in origins_str.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, # Using the dynamic list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FIX 3: Add the "VIP Pass" security system.
# This ensures only your Node.js backend can use your AI service.
security = HTTPBearer()
SECRET_API_KEY = os.environ.get("INTERNAL_API_KEY")
if not SECRET_API_KEY:
    # The server will refuse to start if this secret is missing.
    raise ValueError("CRITICAL: INTERNAL_API_KEY is not set in the environment!")

async def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """This function is the 'bouncer' that checks the secret key."""
    if credentials.scheme != "Bearer" or credentials.credentials != SECRET_API_KEY:
        raise HTTPException(
            status_code=403, detail="Invalid or missing API key"
        )
    return credentials

# Your original public endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Service", "version": "1.0.0"}

@app.get("/")
async def root():
    return {"message": "Story Engine AI Service", "docs": "/docs", "health": "/health"}

# Your original routers, now with security added.
# YOUR API ROUTES ARE NOT CHANGED.
from app.api import story_generation, character_generation, plot_generation, conversational_ai

app.include_router(story_generation.router, prefix="/api/v1", tags=["Story Generation"], dependencies=[Depends(verify_api_key)])
app.include_router(character_generation.router, prefix="/api/v1", tags=["Character Generation"], dependencies=[Depends(verify_api_key)])
app.include_router(plot_generation.router, prefix="/api/v1", tags=["Plot Generation"], dependencies=[Depends(verify_api_key)])
app.include_router(conversational_ai.router, prefix="/api/v1/conversational", tags=["Conversational AI"], dependencies=[Depends(verify_api_key)])

# Your original startup code
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
