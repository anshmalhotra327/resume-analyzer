"""
Quick test script to check if your Gemini API key is working.

Usage:
    python test_key.py YOUR_API_KEY_HERE

Or set it directly below in the API_KEY variable.
"""

import sys
from google import genai

# Option 1: Pass key as command line argument
# Option 2: Paste your key directly here
API_KEY = "PASTE_YOUR_KEY_HERE"

if len(sys.argv) > 1:
    API_KEY = sys.argv[1]

print(f"Testing key: {API_KEY[:15]}...")
print("-" * 40)

try:
    client = genai.Client(api_key=API_KEY)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Say hello in exactly one word"
    )

    print("✅ SUCCESS!")
    print("Response:", response.text)

except Exception as e:
    print("❌ FAILED!")
    print("Error:", str(e))