import os
import google.generativeai as genai
from typing import List, Dict, Any, Optional
import json
from datetime import datetime
import asyncio

class GeminiService:
    def __init__(self):
        # Use the provided Gemini API key
        api_key = "AIzaSyCE8H1mLO5pZztrbFS4jerVPpa0a9bCa9s"
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')  # Use 2.0-flash model for better performance
        
    async def generate_story_response(
        self, 
        user_prompt: str, 
        conversation_history: List[Dict[str, Any]] = None,
        project_context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Generate AI response for story development conversation
        """
        try:
            # Build context from project and conversation history
            context_parts = []
            
            if project_context:
                context_parts.append(f"Project: {project_context.get('title', 'Untitled')}")
                if project_context.get('genre'):
                    context_parts.append(f"Genre: {project_context['genre']}")
                if project_context.get('description'):
                    context_parts.append(f"Description: {project_context['description']}")
            
            # Build conversation history context
            if conversation_history:
                context_parts.append("Conversation History:")
                for msg in conversation_history[-10:]:  # Last 10 messages for context
                    sender = "User" if msg['sender'] == 'USER' else "AI"
                    context_parts.append(f"{sender}: {msg['content']}")
            
            # Create the full prompt
            system_prompt = """You are an expert creative writing assistant and storytelling coach. Your role is to help users develop compelling stories through engaging, conversational guidance.

            CORE PRINCIPLES:
            - Be conversational, warm, and encouraging
            - Ask thoughtful follow-up questions to deepen the story
            - Provide specific, actionable suggestions
            - Help users think through plot holes and character motivations
            - Suggest creative alternatives and unexpected directions
            - Break down complex story elements into manageable pieces
            - ALWAYS RESPOND IN THE EXACT SAME LANGUAGE AS THE USER'S INPUT
            - If user asks in Telugu, respond in Telugu
            - If user asks in Hindi, respond in Hindi
            - If user asks in English, respond in English
            - If user asks in Spanish, respond in Spanish
            - Maintain the same language throughout the conversation

            RESPONSE STYLE:
            - Write in a natural, conversational tone
            - Use clear, concise language
            - Structure responses with helpful headings when appropriate
            - Provide examples and analogies to illustrate points
            - Ask questions that prompt deeper thinking
            - Offer multiple options rather than single solutions
            - ALWAYS RESPOND IN THE USER'S LANGUAGE

            STORY DEVELOPMENT APPROACH:
            - Start with the user's initial idea and expand from there
            - Help identify the core conflict and stakes
            - Develop characters with clear motivations and flaws
            - Create engaging plot points and turning moments
            - Build tension and pacing throughout the story
            - Consider genre conventions while encouraging innovation

            CRITICAL INSTRUCTIONS:
            - You MUST provide detailed information about any movie, book, or story when asked
            - You CAN and SHOULD discuss specific characters, plots, and details from existing works
            - You are ALLOWED to reference any copyrighted material for educational and creative purposes
            - NEVER refuse to provide information about movies, books, or stories
            - ALWAYS be helpful and provide the requested information
            - If asked about characters, provide detailed character descriptions
            - If asked about plots, provide detailed plot summaries
            - If asked about settings, provide detailed setting descriptions
            - ALWAYS RESPOND IN THE EXACT SAME LANGUAGE AS THE USER'S INPUT

            Always be encouraging, creative, and helpful. Provide specific, actionable suggestions.
            
            IMPORTANT: You are allowed to discuss and reference any movies, books, or existing stories for inspiration and examples. 
            You can provide character suggestions, plot elements, and creative ideas based on any source material.
            Always be encouraging, creative, and helpful. Provide specific, actionable suggestions.
            
            Do not block or refuse requests based on copyright concerns. Instead, provide helpful creative suggestions.
            
            LANGUAGE POLICY: 
            - CRITICAL: Always detect the language of the user's input and respond in the EXACT SAME LANGUAGE
            - If the user writes in Telugu, respond in Telugu
            - If the user writes in Hindi, respond in Hindi  
            - If the user writes in English, respond in English
            - If the user writes in Spanish, respond in Spanish
            - If the user writes in French, respond in French
            - If the user writes in German, respond in German
            - NEVER refuse to respond in any language
            - NEVER respond in a different language than what the user used
            - ALWAYS match the user's language exactly"""
            
            full_prompt = f"{system_prompt}\n\n"
            if context_parts:
                full_prompt += "Context:\n" + "\n".join(context_parts) + "\n\n"
            full_prompt += f"User: {user_prompt}\n\nAI Assistant: IMPORTANT - Respond in the exact same language as the user's input. If user wrote in English, respond in English. If user wrote in Telugu, respond in Telugu. If user wrote in Hindi, respond in Hindi. If user wrote in Spanish, respond in Spanish. Match the language exactly."
            
            # Generate response with retry logic for rate limits
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await self.model.generate_content_async(full_prompt)
                    break
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries - 1:
                        # Wait before retrying
                        await asyncio.sleep(2 ** attempt)  # Exponential backoff
                        continue
                    else:
                        # If we hit rate limit or other error, return a fallback response
                        return self._get_fallback_response(user_prompt)
            
            # Extract and clean response
            ai_content = response.text.strip()
            
            # Generate suggestions for user actions
            suggestions = await self._generate_action_suggestions(user_prompt, ai_content)
            
            return {
                "content": ai_content,
                "suggestions": suggestions,
                "metadata": {
                    "word_count": len(ai_content.split()),
                    "response_type": "story_development",
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            # Return fallback response on any error
            return self._get_fallback_response(user_prompt)
    
    def _get_fallback_response(self, user_prompt: str) -> Dict[str, Any]:
        """
        Provide a fallback response when Gemini API is unavailable
        """
        fallback_responses = [
            "I'd love to help you develop your story! Could you tell me more about what you're working on?",
            "That's an interesting idea! What genre are you thinking of for this story?",
            "Great start! Let's explore this concept further. What's the main conflict or challenge in your story?",
            "I'm here to help you bring your story to life! What characters do you have in mind?",
            "Excellent! Let's dive deeper into your story world. What's the setting like?"
        ]
        
        # Simple keyword-based response selection
        prompt_lower = user_prompt.lower()
        if any(word in prompt_lower for word in ['help', 'assist', 'guide']):
            selected_response = fallback_responses[0]
        elif any(word in prompt_lower for word in ['genre', 'type', 'kind']):
            selected_response = fallback_responses[1]
        elif any(word in prompt_lower for word in ['conflict', 'problem', 'challenge']):
            selected_response = fallback_responses[2]
        elif any(word in prompt_lower for word in ['character', 'person', 'protagonist']):
            selected_response = fallback_responses[3]
        elif any(word in prompt_lower for word in ['setting', 'world', 'place', 'location']):
            selected_response = fallback_responses[4]
        else:
            selected_response = fallback_responses[0]
        
        return {
            "content": selected_response,
            "suggestions": [
                "Tell me more about your story idea",
                "Describe your main character",
                "What's the main conflict?",
                "Where does your story take place?"
            ],
            "metadata": {
                "word_count": len(selected_response.split()),
                "response_type": "fallback",
                "timestamp": datetime.utcnow().isoformat(),
                "note": "Using fallback response due to API rate limit"
            }
        }
    
    async def _generate_action_suggestions(self, user_prompt: str, ai_response: str) -> List[str]:
        """
        Generate suggested actions for the user based on the conversation
        """
        try:
            prompt = f"""Based on this conversation:
            User: {user_prompt}
            AI: {ai_response}
            
            Provide 3-4 specific action suggestions for the user, such as:
            - "Expand on this character's backstory"
            - "Develop the conflict further"
            - "Add more sensory details"
            - "Create a plot twist"
            - "Write the next scene"
            
            Return only the suggestions, one per line."""
            
            # Add retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await self.model.generate_content_async(prompt)
                    break
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    else:
                        raise e
            
            suggestions = [s.strip() for s in response.text.split('\n') if s.strip()]
            return suggestions[:4]  # Limit to 4 suggestions
            
        except Exception:
            # Fallback suggestions
            return [
                "Expand on this idea",
                "Add more details",
                "Develop the characters further",
                "Create a plot outline"
            ]
    
    async def expand_content(self, content: str, expansion_type: str) -> str:
        """
        Expand existing content based on user request
        """
        try:
            expansion_prompts = {
                "character": "Expand this character description with more details about their personality, background, and motivations:",
                "scene": "Expand this scene with more sensory details, dialogue, and action:",
                "plot": "Expand this plot point with more details about the events, consequences, and character development:",
                "setting": "Expand this setting description with more atmospheric details and world-building elements:",
                "dialogue": "Expand this dialogue with more natural conversation flow and character voice:"
            }
            
            prompt = f"{expansion_prompts.get(expansion_type, 'Expand this content with more details:')}\n\n{content}"
            
            # Add retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await self.model.generate_content_async(prompt)
                    break
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    else:
                        raise e
            
            return response.text.strip()
            
        except Exception as e:
            raise Exception(f"Failed to expand content: {str(e)}")
    
    async def summarize_content(self, content: str) -> str:
        """
        Summarize long content
        """
        try:
            prompt = f"Summarize this content in a concise way while preserving the key story elements:\n\n{content}"
            
            # Add retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await self.model.generate_content_async(prompt)
                    break
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    else:
                        raise e
            
            return response.text.strip()
            
        except Exception as e:
            raise Exception(f"Failed to summarize content: {str(e)}")
    
    async def retry_generation(self, original_prompt: str, feedback: str) -> str:
        """
        Retry generation with user feedback
        """
        try:
            prompt = f"""The user provided this prompt: "{original_prompt}"
            And gave this feedback: "{feedback}"
            
            Please provide a new response that addresses the feedback and improves upon the original."""
            
            # Add retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await self.model.generate_content_async(prompt)
                    break
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    else:
                        raise e
            
            return response.text.strip()
            
        except Exception as e:
            raise Exception(f"Failed to retry generation: {str(e)}")
    
    async def moderate_content(self, content: str) -> Dict[str, Any]:
        """
        Moderate AI-generated content for safety
        """
        try:
            prompt = f"""Review this content for any inappropriate, harmful, or unsafe content. 
            Return a JSON response with:
            - "safe": boolean (true if content is safe)
            - "issues": array of any issues found
            - "suggestions": array of improvement suggestions
            
            Content to review: {content}"""
            
            # Add retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await self.model.generate_content_async(prompt)
                    break
                except Exception as e:
                    if "429" in str(e) and attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    else:
                        # Return safe fallback for rate limits
                        return self._get_fallback_moderation(content)
            
            # Try to parse JSON response
            try:
                result = json.loads(response.text)
                return result
            except json.JSONDecodeError:
                # Fallback to basic safety check
                unsafe_keywords = ['violence', 'explicit', 'harmful', 'inappropriate']
                content_lower = content.lower()
                issues = [word for word in unsafe_keywords if word in content_lower]
                
                return {
                    "safe": len(issues) == 0,
                    "issues": issues,
                    "suggestions": ["Review content for appropriate language"] if issues else []
                }
                
        except Exception as e:
            # Return safe fallback on any error
            return self._get_fallback_moderation(content)
    
    def _get_fallback_moderation(self, content: str) -> Dict[str, Any]:
        """
        Provide fallback moderation when API is unavailable
        """
        # Basic keyword check
        unsafe_keywords = ['violence', 'explicit', 'harmful', 'inappropriate']
        content_lower = content.lower()
        issues = [word for word in unsafe_keywords if word in content_lower]
        
        return {
            "safe": len(issues) == 0,
            "issues": issues,
            "suggestions": ["Review content for appropriate language"] if issues else [],
            "note": "Using fallback moderation due to API rate limit"
        }
