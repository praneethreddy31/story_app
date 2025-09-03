import os
import google.generativeai as genai
from dotenv import load_dotenv
import asyncio

# Load environment variables from .env file
load_dotenv()

async def run_test():
    """A simple, direct test of the Gemini API connection."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in .env file!")
        return

    print("API Key found. Configuring Gemini...")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash') # Using the latest flash model
        print("Gemini configured. Sending a test prompt...")

        # This is the line that will hang if there is a problem
        response = await model.generate_content_async("Tell me a short story about a robot.")

        print("\n--- SUCCESS! ---")
        print(response.text)
    except Exception as e:
        print(f"\n--- AN ERROR OCCURRED ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Details: {e}")

# Run the asynchronous test function
if __name__ == "__main__":
    asyncio.run(run_test())

