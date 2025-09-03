import google.generativeai as genai

# Configure Gemini with your API key
api_key = "AIzaSyBZnuBnO_tlDzfTvm0-CHsyTfdIodBAaQM"
genai.configure(api_key=api_key)

# Test with gemini-2.0-flash
try:
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Tell me a creative story idea about a magical forest")
    print("\n✅ Gemini API is working with gemini-2.0-flash!")
    print("Response:", response.text)
except Exception as e:
    print(f"\n❌ Error with gemini-2.0-flash: {str(e)}")
    
    # Fallback to gemini-1.5-flash if 2.0 doesn't work
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Tell me a creative story idea about a magical forest")
        print("\n✅ Gemini API is working with gemini-1.5-flash!")
        print("Response:", response.text)
    except Exception as e2:
        print(f"\n❌ Error with gemini-1.5-flash: {str(e2)}")
