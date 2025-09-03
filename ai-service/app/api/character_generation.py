import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PlotGenerationRequest, PlotGenerationResponse,
    ErrorResponse
)
from app.services.gemini_service import GeminiService

router = APIRouter()

gemini_service = GeminiService()

@router.post("/generate", response_model=PlotGenerationResponse)
async def generate_plot(request: PlotGenerationRequest):
    """Generate a plot structure using the Gemini service"""
    try:
        # STEP 3: Build a detailed, specific prompt for the GeminiService
        # This translates the user's structured request into a clear instruction for the AI.
        prompt_parts = [
            f"Create a {request.length.value} story plot with {request.plot_points} plot points based on this premise: {request.story_premise}"
        ]
        if request.genre:
            prompt_parts.append(f"Genre: {request.genre.value}")
        if request.tone:
            prompt_parts.append(f"Tone: {request.tone.value}")

        # Add instructions for the AI's output format
        prompt_parts.append("\nStructure the output with clear plot points following traditional story structure (exposition, rising action, climax, falling action, resolution).")
        full_prompt = "\n".join(prompt_parts)

        # STEP 4: Call the single, powerful GeminiService function
        gemini_result = await gemini_service.generate_story_response(user_prompt=full_prompt)

        # STEP 5: Adapt the generic Gemini result to the specific PlotGenerationResponse schema
        # This is the crucial step that makes the code work.
        final_response = PlotGenerationResponse(
            id=str(uuid.uuid4()),  # Generate a unique ID for this response
            content=gemini_result.get("content", "Error: No content was generated."),
            suggestions=gemini_result.get("suggestions", []),
            metadata=gemini_result.get("metadata", {})
        )

        return final_response
        
    except Exception as e:
        # If anything goes wrong, raise an HTTP exception
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Plot Generation"}