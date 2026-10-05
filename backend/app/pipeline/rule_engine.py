import os
from typing import Any


def evaluate_rules(filename: str, features: dict[str, Any], command_line: str = "") -> tuple[float, list[str]]:
    score = 0.0
    matches: list[str] = []
    lowered = f"{filename} {command_line}".lower()
    blocklist = {item.strip().lower() for item in os.getenv("ZERO_ONE_BLOCKLIST_SHA256", "").split(",") if item.strip()}

    if str(features.get("sha256", "")).lower() in blocklist:
        score += 100
        matches.append("SIG-001: SHA-256 matched configured malware blocklist")
    if features.get("extension_mismatch") or (features.get("is_pe") and not features.get("is_executable_extension")):
        score += 35
        matches.append("SIG-301: Executable content with mismatched extension")
    if features.get("has_double_extension"):
        score += 20
        matches.append("SIG-302: Double file extension disguise")
    if "powershell" in lowered and any(flag in lowered for flag in ("-enc", "-e ", "encodedcommand")):
        score += 35
        matches.append("SIG-104: Encoded PowerShell command")
    if features.get("has_base64_command"):
        score += 25
        matches.append("SIG-105: Base64-encoded script command")
    if features.get("has_office_macro"):
        score += 30
        matches.append("SIG-MAIL-01: Macro-enabled Office document")
    imports = set(str(features.get("injection_imports", "")).split(",")) - {""}
    if {"virtualalloc", "writeprocessmemory", "createremotethread"}.issubset(imports):
        score += 45
        matches.append("SIG-209: Process-injection import combination")
    if features.get("entropy", 0) > 7.2:
        score += 30
        matches.append("SIG-401: High entropy content suggests packing")
    if any(token in lowered for token in ("invoice_update", "urgent_invoice", "wire_transfer")):
        score += 25
        matches.append("SIG-201: High-risk social engineering filename")

    return min(score, 100), matches
