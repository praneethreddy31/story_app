from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    StoryGenerationRequest, StoryGenerationResponse,
    CharacterGenerationRequest, CharacterGenerationResponse,
    PlotGenerationRequest, PlotGenerationResponse,
    ErrorResponse
)
# CHANGED: Import the correct service
from app.services.gemini_service import GeminiService

router = APIRouter()

# CHANGED: Initialize the correct service
gemini_service = GeminiService()

@router.post("/generate-story", response_model=StoryGenerationResponse)
async def generate_story(request: StoryGenerationRequest):
    """Generate a story using the Gemini conversational AI"""
    try:
        # CHANGED: Call the Gemini service's main function
        # We will adapt the request to fit the conversational model
        user_prompt = f"Write a {request.length} story based on this idea: {request.prompt}. The genre is {request.genre}."
        
        # We assume the Gemini service response structure matches StoryGenerationResponse for now
        # You may need to adapt the response mapping later.
        response_data = await gemini_service.generate_story_response(user_prompt=user_prompt)
        
        # For the demo, we'll map the conversational response to the expected structure.
        return StoryGenerationResponse(
            id="gemini-generated-story",
            content=response_data.get("content", "Error generating content."),
            suggestions=response_data.get("suggestions", []),
            metadata=response_data.get("metadata", {})
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-character", response_model=CharacterGenerationResponse)
async def generate_character(request: CharacterGenerationRequest):
    """Generate a character using the Gemini conversational AI"""
    try:
        # CHANGED: Call the Gemini service's main function
        user_prompt = f"Create a {request.role} character for this story context: {request.story_context}."
        
        response_data = await gemini_service.generate_story_response(user_prompt=user_prompt)

        return CharacterGenerationResponse(
            id="gemini-generated-character",
            content=response_data.get("content", "Error generating content."),
            suggestions=response_data.get("suggestions", []),
            metadata=response_data.get("metadata", {})
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-plot", response_model=PlotGenerationResponse)
async def generate_plot(request: PlotGenerationRequest):
    """Generate a plot using the Gemini conversational AI"""
    try:
        # CHANGED: Call the Gemini service's main function
        user_prompt = f"Create a {request.length} story plot with {request.plot_points} plot points based on this premise: {request.story_premise}."
        
        response_data = await gemini_service.generate_story_response(user_prompt=user_prompt)

        return PlotGenerationResponse(
            id="gemini-generated-plot",
            content=response_data.get("content", "Error generating content."),
            suggestions=response_data.get("suggestions", []),
            metadata=response_data.get("metadata", {})
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Story Generation with Gemini"}
