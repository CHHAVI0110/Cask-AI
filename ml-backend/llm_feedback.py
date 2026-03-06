import requests

def generate_feedback(feedback):

    prompt = f"""
    You are a physiotherapy assistant.

    Convert this feedback into a short coaching sentence:

    {feedback}
    """

    res = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    return res.json()["response"].strip().replace('"', '')