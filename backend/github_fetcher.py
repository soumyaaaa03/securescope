import httpx
import base64
from urllib.parse import urlparse

SUPPORTED_EXTENSIONS = [
    ".py", ".js", ".ts", ".java", ".php",
    ".go", ".rb", ".cpp", ".c", ".cs"
]

def parse_github_url(url: str):
    """
    Turns https://github.com/username/reponame
    into  ("username", "reponame")
    """
    url = url.rstrip("/")
    parts = urlparse(url).path.strip("/").split("/")
    if len(parts) < 2:
        raise ValueError("Invalid GitHub URL. Must be https://github.com/username/repo")
    return parts[0], parts[1]

def is_scannable(filename: str):
    """Only scan code files, skip images, docs etc."""
    return any(filename.endswith(ext) for ext in SUPPORTED_EXTENSIONS)

async def fetch_repo_files(github_url: str, token: str = None):
    """
    Fetches all code files from a public GitHub repo.
    Returns a list of dicts with filename and code content.
    """
    owner, repo = parse_github_url(github_url)

    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    files_found = []

    async with httpx.AsyncClient(timeout=15) as client:
        # Step 1 — get the full file tree of the repo
        tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"
        response = await client.get(tree_url, headers=headers)

        if response.status_code == 404:
            raise ValueError(f"Repo not found: {owner}/{repo}. Make sure it's public.")
        if response.status_code == 403:
            raise ValueError("GitHub rate limit hit. Add a GITHUB_TOKEN to your .env file.")
        if response.status_code != 200:
            raise ValueError(f"GitHub error: {response.status_code}")

        tree = response.json().get("tree", [])

        # Step 2 — filter to only code files
        code_files = [
            item for item in tree
            if item["type"] == "blob" and is_scannable(item["path"])
        ]

        # Step 3 — limit to 20 files so we don't overload
        code_files = code_files[:20]

        # Step 4 — fetch each file's content
        for file_info in code_files:
            file_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_info['path']}"
            file_response = await client.get(file_url, headers=headers)

            if file_response.status_code != 200:
                continue

            file_data = file_response.json()
            encoded_content = file_data.get("content", "")

            # GitHub sends file content as base64 — we decode it
            try:
                decoded_content = base64.b64decode(encoded_content).decode("utf-8", errors="ignore")
                files_found.append({
                    "filename": file_info["path"],
                    "code": decoded_content
                })
            except Exception:
                continue

    return files_found