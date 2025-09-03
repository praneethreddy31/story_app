from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    CharacterGenerationRequest, CharacterGenerationResponse,
    ErrorResponse
)
from app.services.ai_service import AIService

router = APIRouter()

# Initialize AI service
ai_service = AIService()

@router.post("/generate", response_model=CharacterGenerationResponse)
async def generate_character(request: CharacterGenerationRequest):
    """Generate a character based on the provided request"""
    try:
        response = await ai_service.generate_character(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Character Generation"}
