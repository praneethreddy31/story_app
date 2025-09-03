from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PlotGenerationRequest, PlotGenerationResponse,
    ErrorResponse
)
from app.services.ai_service import AIService

router = APIRouter()

# Initialize AI service
ai_service = AIService()

@router.post("/generate", response_model=PlotGenerationResponse)
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
    return {"status": "healthy", "service": "Plot Generation"}
