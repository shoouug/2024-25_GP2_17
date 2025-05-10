import os
import cohere
from dotenv import load_dotenv

# ✅ Load .env file
load_dotenv()

# ✅ Get API Key from .env
API_KEY = os.getenv("API_KEY")

# ✅ Initialize Cohere client
co = cohere.Client(API_KEY)

def test_cohere():
    print("🔎 Testing Cohere API...")

    try:
        response = co.generate(
            model="command",  # ✅ Corrected model name
            prompt="Write a short article about the impact of AI in journalism.",
            max_tokens=300,  # Test with a short response
            temperature=0.6
        )

        print("\n🛠 DEBUG: Full Cohere Response 🛠\n", response)
        print("\n📝 Generated Text:\n", response.generations[0].text)

    except Exception as e:
        print("❌ Error testing Cohere:", str(e))

# Run the test
if __name__ == "__main__":
    test_cohere()