import openai
import os
import uuid
import time
from typing import Dict, Any, List, Optional
from app.models.schemas import (
    StoryGenerationRequest, CharacterGenerationRequest, PlotGenerationRequest,
    StoryGenerationResponse, CharacterGenerationResponse, PlotGenerationResponse,
    PlotPoint, PlotPointType
)

class AIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("OPENAI_MODEL", "gpt-4")
        self.max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))
        self.temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))

    def _generate_id(self) -> str:
        """Generate a unique ID for the generation"""
        return str(uuid.uuid4())

    def _count_words(self, text: str) -> int:
        """Count words in text"""
        return len(text.split())

    def _estimate_reading_time(self, word_count: int) -> int:
        """Estimate reading time in minutes (average 200 words per minute)"""
        return max(1, round(word_count / 200))

    async def generate_story(self, request: StoryGenerationRequest) -> StoryGenerationResponse:
        """Generate a story based on the provided request"""
        try:
            # Build the prompt
            prompt_parts = [f"Write a {request.length} story based on this idea: {request.prompt}"]
            
            if request.genre:
                prompt_parts.append(f"Genre: {request.genre.value}")
            if request.tone:
                prompt_parts.append(f"Tone: {request.tone.value}")
            if request.style:
                prompt_parts.append(f"Style: {request.style}")
            if request.additional_context:
                prompt_parts.append(f"Additional context: {request.additional_context}")

            # Add length guidelines
            length_guidelines = {
                "short": "500-1500 words",
                "medium": "1500-5000 words", 
                "long": "5000+ words"
            }
            prompt_parts.append(f"Target length: {length_guidelines[request.length.value]}")

            full_prompt = "\n".join(prompt_parts)

            # Generate story using OpenAI
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a creative writing assistant. Write engaging, well-structured stories with compelling characters and plots."},
                    {"role": "user", "content": full_prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )

            content = response.choices[0].message.content
            word_count = self._count_words(content)
            reading_time = self._estimate_reading_time(word_count)

            # Generate suggestions
            suggestions = await self._generate_story_suggestions(content, request)

            return StoryGenerationResponse(
                id=self._generate_id(),
                content=content,
                suggestions=suggestions,
                metadata={
                    "word_count": word_count,
                    "reading_time_minutes": reading_time,
                    "genre": request.genre.value if request.genre else None,
                    "tone": request.tone.value if request.tone else None,
                    "length": request.length.value
                }
            )

        except Exception as e:
            raise Exception(f"Failed to generate story: {str(e)}")

    async def generate_character(self, request: CharacterGenerationRequest) -> CharacterGenerationResponse:
        """Generate a character based on the provided request"""
        try:
            # Build the prompt
            prompt_parts = [f"Create a {request.role.value} character for this story context: {request.story_context}"]
            
            if request.name:
                prompt_parts.append(f"Character name: {request.name}")
            
            if request.personality_traits:
                prompt_parts.append(f"Desired personality traits: {', '.join(request.personality_traits)}")
            
            if request.background_elements:
                prompt_parts.append(f"Background elements to include: {', '.join(request.background_elements)}")

            full_prompt = "\n".join(prompt_parts)

            # Generate character using OpenAI
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a character development expert. Create detailed, well-rounded characters with clear motivations, backgrounds, and personality traits."},
                    {"role": "user", "content": full_prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )

            content = response.choices[0].message.content

            # Extract character details
            character_details = await self._extract_character_details(content)

            return CharacterGenerationResponse(
                id=self._generate_id(),
                content=content,
                suggestions=await self._generate_character_suggestions(content, request),
                metadata=character_details
            )

        except Exception as e:
            raise Exception(f"Failed to generate character: {str(e)}")

    async def generate_plot(self, request: PlotGenerationRequest) -> PlotGenerationResponse:
        """Generate a plot structure based on the provided request"""
        try:
            # Build the prompt
            prompt_parts = [
                f"Create a {request.length.value} story plot with {request.plot_points} plot points based on this premise: {request.story_premise}"
            ]
            
            if request.genre:
                prompt_parts.append(f"Genre: {request.genre.value}")
            if request.tone:
                prompt_parts.append(f"Tone: {request.tone.value}")

            full_prompt = "\n".join(prompt_parts)

            # Generate plot using OpenAI
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a story structure expert. Create well-structured plots with clear plot points following traditional story structure (exposition, rising action, climax, falling action, resolution)."},
                    {"role": "user", "content": full_prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )

            content = response.choices[0].message.content

            # Parse plot points
            plot_points = await self._parse_plot_points(content, request.plot_points)
            estimated_word_count = await self._estimate_plot_word_count(plot_points, request.length)

            return PlotGenerationResponse(
                id=self._generate_id(),
                content=content,
                suggestions=await self._generate_plot_suggestions(content, request),
                metadata={
                    "plot_points": [point.dict() for point in plot_points],
                    "total_points": len(plot_points),
                    "estimated_word_count": estimated_word_count,
                    "genre": request.genre.value if request.genre else None,
                    "tone": request.tone.value if request.tone else None
                }
            )

        except Exception as e:
            raise Exception(f"Failed to generate plot: {str(e)}")

    async def _generate_story_suggestions(self, content: str, request: StoryGenerationRequest) -> List[str]:
        """Generate suggestions for improving the story"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a writing coach. Provide 3-5 specific, actionable suggestions for improving the story."},
                    {"role": "user", "content": f"Here's a story: {content[:1000]}...\n\nProvide 3-5 specific suggestions for improvement."}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            suggestions_text = response.choices[0].message.content
            return [s.strip() for s in suggestions_text.split('\n') if s.strip()]

        except Exception:
            return ["Consider adding more dialogue", "Develop character motivations further", "Add sensory details"]

    async def _generate_character_suggestions(self, content: str, request: CharacterGenerationRequest) -> List[str]:
        """Generate suggestions for developing the character further"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a character development expert. Provide 3-5 suggestions for further character development."},
                    {"role": "user", "content": f"Here's a character: {content[:1000]}...\n\nProvide 3-5 suggestions for further development."}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            suggestions_text = response.choices[0].message.content
            return [s.strip() for s in suggestions_text.split('\n') if s.strip()]

        except Exception:
            return ["Add internal conflicts", "Develop backstory further", "Create character arc"]

    async def _generate_plot_suggestions(self, content: str, request: PlotGenerationRequest) -> List[str]:
        """Generate suggestions for improving the plot"""
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a story structure expert. Provide 3-5 suggestions for improving the plot structure."},
                    {"role": "user", "content": f"Here's a plot: {content[:1000]}...\n\nProvide 3-5 suggestions for improvement."}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            suggestions_text = response.choices[0].message.content
            return [s.strip() for s in suggestions_text.split('\n') if s.strip()]

        except Exception:
            return ["Strengthen the conflict", "Add subplots", "Improve pacing"]

    async def _extract_character_details(self, content: str) -> Dict[str, Any]:
        """Extract character details from generated content"""
        return {
            "word_count": self._count_words(content),
            "has_backstory": "backstory" in content.lower() or "background" in content.lower(),
            "has_personality": "personality" in content.lower() or "traits" in content.lower(),
            "has_motivation": "motivation" in content.lower() or "goal" in content.lower()
        }

    async def _parse_plot_points(self, content: str, num_points: int) -> List[PlotPoint]:
        """Parse plot points from generated content"""
        plot_points = []
        plot_point_types = [PlotPointType.EXPOSITION, PlotPointType.RISING_ACTION, 
                           PlotPointType.CLIMAX, PlotPointType.FALLING_ACTION, PlotPointType.RESOLUTION]
        
        for i in range(min(num_points, len(plot_point_types))):
            plot_points.append(PlotPoint(
                id=str(uuid.uuid4()),
                title=f"Plot Point {i+1}",
                description=f"Plot point {i+1} description",
                order=i+1,
                type=plot_point_types[i]
            ))
        
        return plot_points

    async def _estimate_plot_word_count(self, plot_points: List[PlotPoint], length: str) -> int:
        """Estimate word count based on plot points and length"""
        base_words_per_point = {
            "short": 300,
            "medium": 800,
            "long": 1500
        }
        
        return len(plot_points) * base_words_per_point.get(length.value, 800)
