import hashlib
import math
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
    return {
        "file_size": float(len(data)),
        "entropy": entropy,
        "is_pe": magic,
        "has_double_extension": float(filename.count(".")) > 1,
        "extension": suffix,
        "sha256": hashlib.sha256(data).hexdigest(),
        "is_executable_extension": suffix in {".exe", ".dll", ".scr", ".com", ".bat", ".cmd", ".vbs", ".ps1"},
    }
