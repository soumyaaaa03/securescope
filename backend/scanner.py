import re
from dataclasses import dataclass

@dataclass
class Vulnerability:
    severity: str
    name: str
    description: str
    line_number: int
    vulnerable_code: str
    fix: str
    category: str

PATTERNS = [
    {
        "name": "SQL injection via string concatenation",
        "pattern": r'(execute|query)\s*\(.*[\+\%\.format].*\)',
        "severity": "critical",
        "description": "User input is directly joined into a SQL query. An attacker can manipulate your entire database.",
        "fix": "Use parameterised queries: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
        "category": "Injection"
    },
    {
        "name": "Hardcoded password or secret",
        "pattern": r'(password|secret|api_key|token|passwd)\s*=\s*["\'][^"\']{4,}["\']',
        "severity": "critical",
        "description": "A password or secret is hardcoded directly in your source code. Anyone who reads your code can steal it.",
        "fix": "Use environment variables: import os\npassword = os.environ.get('PASSWORD')",
        "category": "Secrets"
    },
    {
        "name": "Hardcoded IP address",
        "pattern": r'["\'](\d{1,3}\.){3}\d{1,3}["\']',
        "severity": "medium",
        "description": "An IP address is hardcoded. This makes your code fragile and leaks infrastructure details.",
        "fix": "Store IPs in environment variables or a config file.",
        "category": "Configuration"
    },
    {
        "name": "Use of eval() — code injection risk",
        "pattern": r'\beval\s*\(',
        "severity": "critical",
        "description": "eval() runs any string as code. If user input reaches eval(), attackers can run any command on your server.",
        "fix": "Never use eval() on user input. Use safer alternatives like ast.literal_eval() for parsing data.",
        "category": "Injection"
    },
    {
        "name": "Weak hashing algorithm (MD5 or SHA1)",
        "pattern": r'hashlib\.(md5|sha1)\s*\(',
        "severity": "high",
        "description": "MD5 and SHA1 are broken. Passwords hashed with these can be cracked almost instantly.",
        "fix": "Use bcrypt: import bcrypt\nhashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())",
        "category": "Cryptography"
    },
    {
        "name": "Pickle deserialization risk",
        "pattern": r'pickle\.loads?\s*\(',
        "severity": "high",
        "description": "Loading pickle data from untrusted sources can execute arbitrary code on your server.",
        "fix": "Never unpickle data from users or external sources. Use JSON instead.",
        "category": "Injection"
    },
    {
        "name": "Debug mode enabled",
        "pattern": r'DEBUG\s*=\s*True',
        "severity": "high",
        "description": "Debug mode exposes detailed error messages and stack traces to users in production.",
        "fix": "Set DEBUG = False in production. Use environment variables: DEBUG = os.environ.get('DEBUG', False)",
        "category": "Configuration"
    },
    {
        "name": "Shell injection via subprocess",
        "pattern": r'subprocess\.(call|run|Popen)\s*\(.*shell\s*=\s*True',
        "severity": "critical",
        "description": "Running shell commands with shell=True and user input allows attackers to run any command.",
        "fix": "Use shell=False and pass arguments as a list: subprocess.run(['ls', '-la'], shell=False)",
        "category": "Injection"
    },
    {
        "name": "Insecure random number generation",
        "pattern": r'\brandom\.(random|randint|choice)\s*\(',
        "severity": "medium",
        "description": "The random module is not cryptographically secure. Do not use it for tokens, passwords, or security codes.",
        "fix": "Use secrets module instead: import secrets\ntoken = secrets.token_hex(32)",
        "category": "Cryptography"
    },
    {
        "name": "Missing HTTPS — plain HTTP URL",
        "pattern": r'["\']http://(?!localhost|127\.0\.0\.1)',
        "severity": "medium",
        "description": "Using HTTP instead of HTTPS means data is sent unencrypted over the network.",
        "fix": "Always use https:// for external URLs in production.",
        "category": "Transport Security"
    },
]

def calculate_score(vulnerabilities):
    if not vulnerabilities:
        return 100
    deductions = {"critical": 25, "high": 15, "medium": 8, "low": 3}
    total = sum(deductions.get(v.severity, 0) for v in vulnerabilities)
    return max(0, 100 - total)

def get_risk_level(score):
    if score >= 80:
        return "Low"
    elif score >= 60:
        return "Medium"
    elif score >= 40:
        return "High"
    else:
        return "Critical"

def scan_code(code: str, filename: str = "code.py"):
    lines = code.splitlines()
    found = []

    for pattern_info in PATTERNS:
        regex = re.compile(pattern_info["pattern"], re.IGNORECASE)
        for i, line in enumerate(lines, start=1):
            if regex.search(line):
                found.append(Vulnerability(
                    severity=pattern_info["severity"],
                    name=pattern_info["name"],
                    description=pattern_info["description"],
                    line_number=i,
                    vulnerable_code=line.strip(),
                    fix=pattern_info["fix"],
                    category=pattern_info["category"]
                ))

    score = calculate_score(found)
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    found.sort(key=lambda v: severity_order.get(v.severity, 4))

    return {
        "filename": filename,
        "total_issues": len(found),
        "score": score,
        "risk_level": get_risk_level(score),
        "summary": {
            "critical": sum(1 for v in found if v.severity == "critical"),
            "high": sum(1 for v in found if v.severity == "high"),
            "medium": sum(1 for v in found if v.severity == "medium"),
            "low": sum(1 for v in found if v.severity == "low"),
        },
        "vulnerabilities": [
            {
                "severity": v.severity,
                "name": v.name,
                "description": v.description,
                "line_number": v.line_number,
                "vulnerable_code": v.vulnerable_code,
                "fix": v.fix,
                "category": v.category,
            }
            for v in found
        ]
    }