from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PlotGenerationRequest, PlotGenerationResponse,
    ErrorResponse
)
# STEP 1: Import the correct GeminiService
from app.services.gemini_service import GeminiService

router = APIRouter()

# STEP 2: Initialize the new GeminiService
gemini_service = GeminiService()

@router.post("/generate", response_model=PlotGenerationResponse)
async def generate_plot(request: PlotGenerationRequest):
    """Generate a plot structure based on the provided request"""
    try:
        # STEP 3: Build a detailed prompt for the GeminiService
        prompt_parts = [
            f"Create a {request.length.value} story plot with {request.plot_points} plot points based on this premise: {request.story_premise}"
        ]
        if request.genre:
            prompt_parts.append(f"Genre: {request.genre.value}")
        if request.tone:
            prompt_parts.append(f"Tone: {request.tone.value}")

        # Add instructions for the AI
        prompt_parts.append("\nStructure the output with clear plot points following traditional story structure (exposition, rising action, climax, falling action, resolution).")
        full_prompt = "\n".join(prompt_parts)

        # STEP 4: Call the single, powerful GeminiService function
        gemini_response = await gemini_service.generate_story_response(user_prompt=full_prompt)

        # STEP 5: Create the final response object required by the API
        # (This part might need adjustment based on your exact PlotGenerationResponse model)
        response = PlotGenerationResponse(
            id="some_generated_id", # You may need a way to generate IDs
            content=gemini_response.get("content", "No content generated."),
            suggestions=gemini_response.get("suggestions", []),
            metadata=gemini_response.get("metadata", {})
        )

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Plot Generation"}

    
