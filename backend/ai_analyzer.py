import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "codellama"

def build_prompt(vulnerabilities: list, filename: str) -> str:
    """
    Builds a clear prompt for CodeLlama explaining what we found
    and asking it to give a beginner-friendly security report.
    """
    if not vulnerabilities:
        return f"""
You are a security expert. A scan of the file "{filename}" found zero vulnerabilities.
Write a short encouraging message (3-4 sentences) congratulating the developer and
giving one general tip about keeping code secure. Be friendly and clear.
"""

    vuln_text = ""
    for i, v in enumerate(vulnerabilities, 1):
        vuln_text += f"""
Issue {i}: {v['name']}
Severity: {v['severity'].upper()}
Found at line {v['line_number']}: {v['vulnerable_code']}
Category: {v['category']}
"""

    return f"""
You are a friendly security expert helping a beginner developer.
A security scan of "{filename}" found these issues:

{vuln_text}

Write a clear, encouraging security report that:
1. Starts with a one-sentence overall summary of how serious the situation is
2. For each issue, explain in 1-2 simple sentences WHY it is dangerous in real life
3. End with 2-3 sentences of encouragement and next steps

Use simple language a beginner can understand. No jargon. Be specific and helpful.
Keep the total response under 300 words.
"""

async def analyze_with_ai(scan_result: dict) -> str:
    """
    Sends the scan results to CodeLlama running locally via Ollama
    and gets back a human-readable explanation.
    """
    prompt = build_prompt(
        scan_result.get("vulnerabilities", []),
        scan_result.get("filename", "your code")
    )

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,
            "num_predict": 400
        }
    }

    try:
        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(OLLAMA_URL, json=payload)

            if response.status_code != 200:
                return "AI analysis unavailable right now. Please check that Ollama is running."

            data = response.json()
            return data.get("response", "AI returned an empty response.").strip()

    except httpx.ConnectError:
        return (
            "AI analysis offline — Ollama is not running. "
            "Start it by running 'ollama serve' in your terminal. "
            "Your scan results above are still fully accurate."
        )
    except httpx.TimeoutException:
        return "AI analysis timed out. Ollama may still be loading the model. Try again in 30 seconds."
    except Exception as e:
        return f"AI analysis error: {str(e)}"