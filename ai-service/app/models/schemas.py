from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class GenerationType(str, Enum):
    STORY = "story"
    CHARACTER = "character"
    PLOT = "plot"
    DIALOGUE = "dialogue"
    DESCRIPTION = "description"

class StoryGenre(str, Enum):
    FANTASY = "fantasy"
    SCIENCE_FICTION = "science_fiction"
    MYSTERY = "mystery"
    ROMANCE = "romance"
    THRILLER = "thriller"
    HORROR = "horror"
    ADVENTURE = "adventure"
    HISTORICAL = "historical"
    CONTEMPORARY = "contemporary"
    YOUNG_ADULT = "young_adult"

class StoryTone(str, Enum):
    SERIOUS = "serious"
    HUMOROUS = "humorous"
    DARK = "dark"
    LIGHT = "light"
    MYSTERIOUS = "mysterious"
    ROMANTIC = "romantic"
    ACTION_PACKED = "action_packed"
    THOUGHT_PROVOKING = "thought_provoking"

class StoryLength(str, Enum):
    SHORT = "short"  # 500-1500 words
    MEDIUM = "medium"  # 1500-5000 words
    LONG = "long"  # 5000+ words

class CharacterRole(str, Enum):
    PROTAGONIST = "protagonist"
    ANTAGONIST = "antagonist"
    SUPPORTING = "supporting"
    MINOR = "minor"

class PlotPointType(str, Enum):
    EXPOSITION = "exposition"
    RISING_ACTION = "rising_action"
    CLIMAX = "climax"
    FALLING_ACTION = "falling_action"
    RESOLUTION = "resolution"

# Request Models
class StoryGenerationRequest(BaseModel):
    prompt: str = Field(..., description="The main idea or concept for the story")
    genre: Optional[StoryGenre] = Field(None, description="Genre of the story")
    tone: Optional[StoryTone] = Field(None, description="Tone of the story")
    length: Optional[StoryLength] = Field(StoryLength.MEDIUM, description="Desired length of the story")
    style: Optional[str] = Field(None, description="Writing style preferences")
    additional_context: Optional[str] = Field(None, description="Additional context or requirements")

class CharacterGenerationRequest(BaseModel):
    name: Optional[str] = Field(None, description="Character name (optional)")
    role: CharacterRole = Field(..., description="Character's role in the story")
    story_context: str = Field(..., description="Context about the story and character's role")
    personality_traits: Optional[List[str]] = Field(None, description="Desired personality traits")
    background_elements: Optional[List[str]] = Field(None, description="Background elements to include")

class PlotGenerationRequest(BaseModel):
    story_premise: str = Field(..., description="The main premise of the story")
    genre: Optional[StoryGenre] = Field(None, description="Genre of the story")
    tone: Optional[StoryTone] = Field(None, description="Tone of the story")
    length: Optional[StoryLength] = Field(StoryLength.MEDIUM, description="Desired story length")
    plot_points: Optional[int] = Field(5, description="Number of plot points to generate")

class DialogueGenerationRequest(BaseModel):
    character1: str = Field(..., description="First character's name")
    character2: str = Field(..., description="Second character's name")
    context: str = Field(..., description="Context for the dialogue")
    emotion: Optional[str] = Field(None, description="Emotional tone of the dialogue")
    length: Optional[int] = Field(10, description="Number of dialogue exchanges")

class DescriptionGenerationRequest(BaseModel):
    subject: str = Field(..., description="What to describe")
    context: str = Field(..., description="Context for the description")
    style: Optional[str] = Field(None, description="Writing style for the description")
    length: Optional[int] = Field(100, description="Approximate word count")

# Response Models
class GenerationResponse(BaseModel):
    id: str = Field(..., description="Unique identifier for the generation")
    content: str = Field(..., description="Generated content")
    suggestions: List[str] = Field(default_factory=list, description="Additional suggestions")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class StoryGenerationResponse(GenerationResponse):
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Story metadata including word count, estimated reading time")

class CharacterGenerationResponse(GenerationResponse):
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Character metadata including traits, backstory elements")

class PlotGenerationResponse(GenerationResponse):
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Plot metadata including plot points, story structure")

class PlotPoint(BaseModel):
    id: str = Field(..., description="Unique identifier for the plot point")
    title: str = Field(..., description="Title of the plot point")
    description: str = Field(..., description="Description of the plot point")
    order: int = Field(..., description="Order in the story")
    type: PlotPointType = Field(..., description="Type of plot point")

class PlotStructure(BaseModel):
    plot_points: List[PlotPoint] = Field(..., description="List of plot points")
    total_points: int = Field(..., description="Total number of plot points")
    estimated_word_count: int = Field(..., description="Estimated word count for the story")

# Error Models
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    details: Optional[str] = Field(None, description="Additional error details")
    code: Optional[str] = Field(None, description="Error code")
