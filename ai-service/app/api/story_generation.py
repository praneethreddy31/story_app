from fastapi import APIRouter, HTTPException, Depends
from app.models.schemas import (
    StoryGenerationRequest, StoryGenerationResponse,
    CharacterGenerationRequest, CharacterGenerationResponse,
    PlotGenerationRequest, PlotGenerationResponse,
    ErrorResponse
)
from app.services.ai_service import AIService

router = APIRouter()

# Initialize AI service
ai_service = AIService()

@router.post("/generate-story", response_model=StoryGenerationResponse)
async def generate_story(request: StoryGenerationRequest):
    """Generate a story based on the provided request"""
    try:
        response = await ai_service.generate_story(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-character", response_model=CharacterGenerationResponse)
async def generate_character(request: CharacterGenerationRequest):
    """Generate a character based on the provided request"""
    try:
        response = await ai_service.generate_character(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-plot", response_model=PlotGenerationResponse)
async def generate_plot(request: PlotGenerationRequest):
    """Generate a plot structure based on the provided request"""
    try:
        response = await ai_service.generate_plot(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Story Generation"}
