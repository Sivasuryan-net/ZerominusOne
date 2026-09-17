def calculate_risk(
    rule_score: float,
    ml_score: float,
    autoencoder_loss: float,
    rule_weight: float = 0.5,
    ml_weight: float = 0.5,
) -> float:
    combined_weights = rule_weight + ml_weight
    if combined_weights <= 0:
        rule_weight, ml_weight = 0.5, 0.5
        combined_weights = 1.0
    weighted = (rule_score * rule_weight + ml_score * ml_weight) / combined_weights
    anomaly_bonus = min(20.0, max(0.0, autoencoder_loss) * 20.0)
    return round(min(100.0, weighted * 0.8 + anomaly_bonus), 2)
