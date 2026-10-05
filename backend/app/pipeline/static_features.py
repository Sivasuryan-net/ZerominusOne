import hashlib
import math
import re
from collections import Counter
from pathlib import Path


def shannon_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    counts = Counter(data)
    size = len(data)
    return -sum((count / size) * math.log2(count / size) for count in counts.values())


def extract_features(filename: str, data: bytes) -> dict[str, float | str | bool]:
    suffix = Path(filename).suffix.lower()
    magic = data[:2] == b"MZ"
    entropy = shannon_entropy(data)
    lowered = data.lower()
    is_office_macro = suffix in {".docm", ".xlsm", ".pptm"} and (b"vba" in lowered or b"macro" in lowered)
    has_base64_command = bool(re.search(rb"(?:powershell|cmd).{0,80}(?:-enc|-e\s|base64)", lowered, re.DOTALL))
    injection_imports = [name for name in (b"virtualalloc", b"writeprocessmemory", b"createremotethread") if name in lowered]
    if data.startswith(b"%PDF"):
        magic_type = "pdf"
    elif data.startswith(b"PK"):
        magic_type = "zip"
    elif data.startswith(b"\xd0\xcf\x11\xe0"):
        magic_type = "ole"
    elif magic:
        magic_type = "pe"
    else:
        magic_type = "unknown"
    return {
        "file_size": float(len(data)),
        "entropy": entropy,
        "is_pe": magic,
        "has_double_extension": float(filename.count(".")) > 1,
        "extension": suffix,
        "sha256": hashlib.sha256(data).hexdigest(),
        "is_executable_extension": suffix in {".exe", ".dll", ".scr", ".com", ".bat", ".cmd", ".vbs", ".ps1"},
        "magic_type": magic_type,
        "extension_mismatch": magic_type == "pdf" and suffix in {".exe", ".scr", ".dll"},
        "has_office_macro": is_office_macro,
        "has_base64_command": has_base64_command,
        "injection_imports": ",".join(name.decode() for name in injection_imports),
    }
