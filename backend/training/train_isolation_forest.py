import csv
import sys
from pathlib import Path

from app.pipeline.ml_isolation_forest import AnomalyModel


FEATURE_COLUMNS = ["file_size", "entropy", "has_double_extension", "is_pe"]


def load_rows(csv_path: Path) -> list[list[float]]:
    with csv_path.open(newline="", encoding="utf-8") as handle:
        return [[float(row[column]) for column in FEATURE_COLUMNS] for row in csv.DictReader(handle)]


if __name__ == "__main__":
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("training/data/ember_features.csv")
    if not source.exists():
        raise SystemExit(f"Feature CSV not found: {source}")
    model = AnomalyModel()
    model.train(load_rows(source))
    print(f"Saved isolation forest model to {model.model_path}")
