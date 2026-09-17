from pathlib import Path
from typing import Any

try:
    import joblib
    from sklearn.ensemble import IsolationForest
except ImportError:  # Optional until model dependencies are installed.
    joblib = None
    IsolationForest = None


class AnomalyModel:
    def __init__(self, model_path: str = "models/isolation_forest.joblib") -> None:
        self.model_path = Path(model_path)
        self.model: Any = None
        if joblib and self.model_path.exists():
            self.model = joblib.load(self.model_path)

    def score(self, features: dict[str, Any]) -> float:
        vector = [[
            float(features.get("file_size", 0)),
            float(features.get("entropy", 0)),
            float(features.get("has_double_extension", 0)),
            float(features.get("is_pe", 0)),
        ]]
        if self.model is not None:
            raw = float(-self.model.score_samples(vector)[0])
            return max(0.0, min(100.0, raw * 100))
        # Deterministic baseline keeps local demos useful before training.
        entropy_signal = max(0.0, (float(features.get("entropy", 0)) - 3.5) * 18)
        disguise_signal = 25.0 if features.get("has_double_extension") else 0.0
        return min(100.0, entropy_signal + disguise_signal)

    def train(self, rows: list[list[float]]) -> None:
        if IsolationForest is None or joblib is None:
            raise RuntimeError("Install scikit-learn and joblib to train the anomaly model")
        self.model = IsolationForest(contamination="auto", random_state=42).fit(rows)
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, self.model_path)
