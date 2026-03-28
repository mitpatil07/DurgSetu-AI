import requests
import os
from dotenv import load_dotenv

# Load .env explicitly
load_dotenv('e:/DurgSetu_AI/backend/.env')

def test_nvidia_api():
    api_key = os.getenv("NVIDIA_API_KEY")
    header = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
    }
    
    payload = {
        "model": "meta/llama-3.1-8b-instruct",
        "messages": [{"role": "user", "content": "Write a short test message for DurgSetu AI structural report."}],
        "temperature": 0.2,
        "max_tokens": 100,
    }
    
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    
    try:
        response = requests.post(url, headers=header, json=payload)
        response.raise_for_status()
        result = response.json()
        print("Successfully connected to NVIDIA API with new key!")
        print("Response:", result['choices'][0]['message']['content'])
        return True
    except Exception as e:
        print(f"Failed to connect to NVIDIA API: {e}")
        if hasattr(e, 'response') and e.response:
            print("Response text:", e.response.text)
        return False

if __name__ == "__main__":
    test_nvidia_api()
