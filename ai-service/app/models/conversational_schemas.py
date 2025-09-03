from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

# Error Response Model
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    code: Optional[str] = Field(None, description="Error code")

# Conversational AI Models
class ConversationRequest(BaseModel):
    message: str = Field(..., description="User's message to the AI")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(None, description="Previous conversation messages")
    project_context: Optional[Dict[str, Any]] = Field(None, description="Project context information")

class ConversationResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the response")
    content: str = Field(..., description="AI-generated response content")
    suggestions: List[str] = Field(default_factory=list, description="Suggested actions for the user")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Response metadata")
    moderation_result: Optional[Dict[str, Any]] = Field(None, description="Content moderation results")

class ContentActionRequest(BaseModel):
    content: str = Field(..., description="Content to perform action on")
    action_type: str = Field(..., description="Type of action (expand, summarize, retry)")
    feedback: Optional[str] = Field(None, description="User feedback for retry actions")

class ContentActionResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the action")
    original_content: str = Field(..., description="Original content")
    new_content: str = Field(..., description="New content after action")
    action_type: str = Field(..., description="Type of action performed")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Action metadata")

class MessageResponse(BaseModel):
    id: str = Field(..., description="Message ID")
    sender: str = Field(..., description="Message sender (USER or AI)")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(..., description="Message timestamp")
    edited: bool = Field(default=False, description="Whether message was edited")
    version: int = Field(default=1, description="Message version number")

# Project and Session Models
class ProjectCreateRequest(BaseModel):
    title: str = Field(..., description="Project title")
    genre: Optional[str] = Field(None, description="Project genre")
    description: Optional[str] = Field(None, description="Project description")

class ProjectUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, description="Project title")
    genre: Optional[str] = Field(None, description="Project genre")
    description: Optional[str] = Field(None, description="Project description")
    status: Optional[str] = Field(None, description="Project status")

class ProjectResponse(BaseModel):
    id: str = Field(..., description="Project ID")
    title: str = Field(..., description="Project title")
    genre: Optional[str] = Field(None, description="Project genre")
    status: str = Field(..., description="Project status")
    description: Optional[str] = Field(None, description="Project description")
    userId: str = Field(..., description="Project owner ID")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Last update timestamp")

class SessionCreateRequest(BaseModel):
    title: Optional[str] = Field(None, description="Session title")

class SessionResponse(BaseModel):
    id: str = Field(..., description="Session ID")
    projectId: str = Field(..., description="Project ID")
    title: Optional[str] = Field(None, description="Session title")
    isActive: bool = Field(..., description="Whether session is active")
    createdAt: datetime = Field(..., description="Creation timestamp")
    updatedAt: datetime = Field(..., description="Last update timestamp")

# Message Models
class MessageCreateRequest(BaseModel):
    content: str = Field(..., description="Message content")
    sender: str = Field(..., description="Message sender (USER or AI)")

class MessageUpdateRequest(BaseModel):
    content: str = Field(..., description="Updated message content")

# Version History Models
class VersionHistoryResponse(BaseModel):
    id: str = Field(..., description="Version ID")
    messageId: str = Field(..., description="Message ID")
    previousContent: str = Field(..., description="Previous content")
    editedAt: datetime = Field(..., description="Edit timestamp")
    editedBy: str = Field(..., description="Who made the edit (USER or SYSTEM)")
    userId: Optional[str] = Field(None, description="User ID if edited by user")

# Export Models
class ExportRequest(BaseModel):
    format: str = Field(..., description="Export format (PDF, DOCX, TXT)")
    include_history: bool = Field(default=True, description="Include conversation history")
    include_metadata: bool = Field(default=True, description="Include project metadata")

class ExportResponse(BaseModel):
    id: str = Field(..., description="Export ID")
    download_url: str = Field(..., description="Download URL for exported file")
    format: str = Field(..., description="Export format")
    file_size: int = Field(..., description="File size in bytes")
    expires_at: datetime = Field(..., description="Download link expiration")

# Search Models
class SearchRequest(BaseModel):
    query: str = Field(..., description="Search query")
    filters: Optional[Dict[str, Any]] = Field(None, description="Search filters")
    sort_by: Optional[str] = Field(None, description="Sort field")
    sort_order: Optional[str] = Field("desc", description="Sort order (asc/desc)")
    page: int = Field(default=1, description="Page number")
    limit: int = Field(default=10, description="Results per page")

class SearchResponse(BaseModel):
    results: List[ProjectResponse] = Field(..., description="Search results")
    total: int = Field(..., description="Total number of results")
    page: int = Field(..., description="Current page")
    total_pages: int = Field(..., description="Total number of pages")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")
