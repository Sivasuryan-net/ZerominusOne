"""Central configuration for the static analysis models.

Values marked HARDCODED are initial defaults intended to be tuned after
evaluation on the project's selected dataset.
"""

from typing import Final


FEATURE_COLUMNS: Final[tuple[str, ...]] = (
    "file_size",
    "entropy",
    "has_double_extension",
    "is_pe",
    "extension_mismatch",
    "has_office_macro",
    "has_base64_command",
    "injection_import_count",
)

# Model and scoring defaults. HARDCODED: tune these after model comparison.
MODEL_PATH: Final[str] = "models/isolation_forest.joblib"  # HARDCODED
ISOLATION_CONTAMINATION: Final[str] = "auto"  # HARDCODED
ISOLATION_RANDOM_STATE: Final[int] = 42  # HARDCODED
ENTROPY_FALLBACK_THRESHOLD: Final[float] = 3.5  # HARDCODED
ENTROPY_FALLBACK_WEIGHT: Final[float] = 18.0  # HARDCODED
DOUBLE_EXTENSION_FALLBACK_WEIGHT: Final[float] = 25.0  # HARDCODED
AUTOENCODER_LOSS_CAP: Final[float] = 1.0  # HARDCODED
RISK_RULE_WEIGHT: Final[float] = 0.5  # HARDCODED
RISK_ML_WEIGHT: Final[float] = 0.5  # HARDCODED
