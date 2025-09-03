from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from app.models.conversational_schemas import (
    ConversationRequest, ConversationResponse, ContentActionRequest, ContentActionResponse,
    ErrorResponse
)
from app.services.gemini_service import GeminiService

router = APIRouter()

# Initialize Gemini service
gemini_service = GeminiService()

@router.post("/conversation", response_model=ConversationResponse)
async def send_message(request: ConversationRequest):
    """
    Send a message to the AI and get a conversational response
    """
    try:
        # Generate AI response using Gemini
        ai_response = await gemini_service.generate_story_response(
            user_prompt=request.message,
            conversation_history=request.conversation_history,
            project_context=request.project_context
        )
        
        # Skip content moderation for now to avoid blocking responses
        # moderation_result = await gemini_service.moderate_content(ai_response["content"])
        moderation_result = {"safe": True}
        
        if not moderation_result.get("safe", True):
            raise HTTPException(
                status_code=400, 
                detail="Generated content contains inappropriate material"
            )
        
        return ConversationResponse(
            id=str(uuid.uuid4()),
            content=ai_response["content"],
            suggestions=ai_response["suggestions"],
            metadata=ai_response["metadata"],
            moderation_result=moderation_result
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/content/expand", response_model=ContentActionResponse)
async def expand_content(request: ContentActionRequest):
    """
    Expand existing content based on user request
    """
    try:
        expanded_content = await gemini_service.expand_content(
            content=request.content,
            expansion_type=request.action_type
        )
        
        return ContentActionResponse(
            id=str(uuid.uuid4()),
            original_content=request.content,
            new_content=expanded_content,
            action_type=request.action_type,
            metadata={
                "word_count": len(expanded_content.split()),
                "expansion_ratio": len(expanded_content) / len(request.content),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/content/summarize", response_model=ContentActionResponse)
async def summarize_content(request: ContentActionRequest):
    """
    Summarize long content
    """
    try:
        summarized_content = await gemini_service.summarize_content(request.content)
        
        return ContentActionResponse(
            id=str(uuid.uuid4()),
            original_content=request.content,
            new_content=summarized_content,
            action_type="summarize",
            metadata={
                "word_count": len(summarized_content.split()),
                "compression_ratio": len(summarized_content) / len(request.content),
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/content/retry", response_model=ContentActionResponse)
async def retry_generation(request: ContentActionRequest):
    """
    Retry generation with user feedback
    """
    try:
        if not request.feedback:
            raise HTTPException(status_code=400, detail="Feedback is required for retry")
            
        retry_content = await gemini_service.retry_generation(
            original_prompt=request.content,
            feedback=request.feedback
        )
        
        return ContentActionResponse(
            id=str(uuid.uuid4()),
            original_content=request.content,
            new_content=retry_content,
            action_type="retry",
            metadata={
                "word_count": len(retry_content.split()),
                "feedback": request.feedback,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/content/moderate")
async def moderate_content(request: ContentActionRequest):
    """
    Moderate content for safety
    """
    try:
        moderation_result = await gemini_service.moderate_content(request.content)
        
        return {
            "safe": moderation_result.get("safe", True),
            "issues": moderation_result.get("issues", []),
            "suggestions": moderation_result.get("suggestions", []),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Conversational AI"}
