import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from backend.scanner import scan_code
from backend.github_fetcher import fetch_repo_files
from backend.ai_analyzer import analyze_with_ai

load_dotenv()

app = FastAPI(title="SecureScope API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    code: str
    filename: str = "pasted_code.py"
    use_ai: bool = True

class GithubScanRequest(BaseModel):
    github_url: str
    use_ai: bool = True

@app.get("/")
def home():
    return {"message": "SecureScope backend is running!", "status": "ok"}

@app.post("/scan")
async def scan(request: ScanRequest):
    result = scan_code(request.code, request.filename)

    if request.use_ai:
        ai_summary = await analyze_with_ai(result)
        result["ai_summary"] = ai_summary
    else:
        result["ai_summary"] = None

    return result

@app.post("/scan/github")
async def scan_github(request: GithubScanRequest):
    token = os.environ.get("GITHUB_TOKEN")

    try:
        files = await fetch_repo_files(request.github_url, token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not files:
        raise HTTPException(
            status_code=404,
            detail="No scannable code files found in this repo."
        )

    all_results = []
    total_critical = total_high = total_medium = total_low = 0

    for file in files:
        result = scan_code(file["code"], file["filename"])
        all_results.append(result)
        total_critical += result["summary"]["critical"]
        total_high     += result["summary"]["high"]
        total_medium   += result["summary"]["medium"]
        total_low      += result["summary"]["low"]

    total_issues = total_critical + total_high + total_medium + total_low
    overall_score = max(0, 100 - (
        total_critical * 25 +
        total_high     * 15 +
        total_medium   *  8 +
        total_low      *  3
    ))

    def get_risk(score):
        if score >= 80: return "Low"
        if score >= 60: return "Medium"
        if score >= 40: return "High"
        return "Critical"

    combined_result = {
        "github_url": request.github_url,
        "files_scanned": len(files),
        "total_issues": total_issues,
        "overall_score": overall_score,
        "risk_level": get_risk(overall_score),
        "summary": {
            "critical": total_critical,
            "high": total_high,
            "medium": total_medium,
            "low": total_low
        },
        "file_results": all_results
    }

    if request.use_ai:
        all_vulns = []
        for r in all_results:
            all_vulns.extend(r.get("vulnerabilities", []))

        ai_input = {
            "filename": f"{len(files)} files from {request.github_url}",
            "vulnerabilities": all_vulns[:10]
        }
        combined_result["ai_summary"] = await analyze_with_ai(ai_input)
    else:
        combined_result["ai_summary"] = None

    return combined_result