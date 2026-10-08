from pathlib import Path
from typing import Any

from .model_params import (
    DOUBLE_EXTENSION_FALLBACK_WEIGHT,
    ENTROPY_FALLBACK_THRESHOLD,
    ENTROPY_FALLBACK_WEIGHT,
    ISOLATION_CONTAMINATION,
    ISOLATION_RANDOM_STATE,
    MODEL_PATH,
)
from .static_features import feature_vector

try:
    import joblib
    from sklearn.ensemble import IsolationForest
except ImportError:  # Optional until model dependencies are installed.
    joblib = None
    IsolationForest = None


class AnomalyModel:
    def __init__(self, model_path: str = MODEL_PATH) -> None:
        self.model_path = Path(model_path)
        self.model: Any = None
        if joblib and self.model_path.exists():
            self.model = joblib.load(self.model_path)

    def score(self, features: dict[str, Any]) -> float:
        vector = [feature_vector(features)]
        if self.model is not None:
            try:
                raw = float(-self.model.score_samples(vector)[0])
                return max(0.0, min(100.0, raw * 100))
            except (ValueError, TypeError):
                # A model trained with an older feature schema must not break ingestion.
                pass
        # Deterministic baseline keeps local demos useful before training.
        entropy_signal = max(
            0.0,
            (float(features.get("entropy", 0)) - ENTROPY_FALLBACK_THRESHOLD)
            * ENTROPY_FALLBACK_WEIGHT,
        )
        disguise_signal = DOUBLE_EXTENSION_FALLBACK_WEIGHT if features.get("has_double_extension") else 0.0
        return min(100.0, entropy_signal + disguise_signal)

    def train(self, rows: list[list[float]]) -> None:
        if IsolationForest is None or joblib is None:
            raise RuntimeError("Install scikit-learn and joblib to train the anomaly model")
        self.model = IsolationForest(
            contamination=ISOLATION_CONTAMINATION,
            random_state=ISOLATION_RANDOM_STATE,
        ).fit(rows)
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, self.model_path)
