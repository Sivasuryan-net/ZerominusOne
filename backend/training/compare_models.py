"""Compare supervised and anomaly models on a feature CSV."""

import argparse
import csv
from pathlib import Path

import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import f1_score, precision_score, recall_score, roc_auc_score
from sklearn.neural_network import MLPRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

from app.pipeline.model_params import FEATURE_COLUMNS


def load_dataset(csv_path: Path) -> tuple[np.ndarray, np.ndarray]:
    with csv_path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    features = np.array([[float(row[column]) for column in FEATURE_COLUMNS] for row in rows])
    labels = np.array([int(row["label"]) for row in rows])
    return features, labels


def evaluate_scores(name: str, labels: np.ndarray, scores: np.ndarray, threshold: float) -> dict[str, float | str]:
    predictions = (scores >= threshold).astype(int)
    return {
        "model": name,
        "roc_auc": round(float(roc_auc_score(labels, scores)), 3),
        "precision": round(float(precision_score(labels, predictions, zero_division=0)), 3),
        "recall": round(float(recall_score(labels, predictions, zero_division=0)), 3),
        "f1": round(float(f1_score(labels, predictions, zero_division=0)), 3),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("csv_path", nargs="?", type=Path, default=Path("training/data/features.csv"))
    args = parser.parse_args()

    features, labels = load_dataset(args.csv_path)
    x_train, x_test, y_train, y_test = train_test_split(
        features,
        labels,
        test_size=0.25,
        stratify=labels,
        random_state=42,
    )
    results: list[dict[str, float | str]] = []

    supervised_models = {
        "Logistic Regression": LogisticRegression(max_iter=2000, random_state=42),
        "Random Forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            class_weight="balanced",
            random_state=42,
        ),
    }
    for name, model in supervised_models.items():
        pipeline = make_pipeline(StandardScaler(), model)
        pipeline.fit(x_train, y_train)
        scores = pipeline.predict_proba(x_test)[:, 1]
        results.append(evaluate_scores(name, y_test, scores, 0.5))

    scaler = StandardScaler().fit(x_train)
    scaled_train = scaler.transform(x_train)
    scaled_test = scaler.transform(x_test)
    benign_scaled = scaled_train[y_train == 0]

    isolation_forest = IsolationForest(n_estimators=200, contamination="auto", random_state=42)
    isolation_forest.fit(benign_scaled)
    isolation_scores = -isolation_forest.score_samples(scaled_test)
    benign_isolation_scores = -isolation_forest.score_samples(benign_scaled)
    isolation_threshold = float(np.percentile(benign_isolation_scores, 95))
    results.append(evaluate_scores("Isolation Forest", y_test, isolation_scores, isolation_threshold))

    autoencoder = MLPRegressor(hidden_layer_sizes=(8, 4, 8), max_iter=2000, random_state=42)
    autoencoder.fit(benign_scaled, benign_scaled)
    reconstruction = autoencoder.predict(scaled_test)
    autoencoder_scores = ((reconstruction - scaled_test) ** 2).mean(axis=1)
    benign_reconstruction = autoencoder.predict(benign_scaled)
    benign_scores = ((benign_reconstruction - benign_scaled) ** 2).mean(axis=1)
    autoencoder_threshold = float(np.percentile(benign_scores, 95))
    results.append(evaluate_scores("Autoencoder", y_test, autoencoder_scores, autoencoder_threshold))

    print(f"Dataset: {args.csv_path} ({len(features)} rows, {len(FEATURE_COLUMNS)} features)")
    print("Model                ROC-AUC  Precision  Recall  F1")
    print("-------------------  -------  ---------  ------  ---")
    for result in results:
        print(
            f"{result['model']:<19}  {result['roc_auc']:>7}  "
            f"{result['precision']:>9}  {result['recall']:>6}  {result['f1']:>3}"
        )
    print(f"\nIsolation Forest threshold: {isolation_threshold:.4f}")
    print(f"Autoencoder threshold:      {autoencoder_threshold:.4f}")
    print("\nInterpretation: prefer ROC-AUC/F1 only after repeating this on a larger held-out dataset.")


if __name__ == "__main__":
    main()
