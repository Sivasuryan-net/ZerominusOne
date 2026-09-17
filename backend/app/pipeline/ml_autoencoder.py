from typing import Any


class AutoencoderModel:
    """Inference boundary for a benign-trained autoencoder.

    The fallback score is deterministic so ingestion remains usable before weights
    are trained. A PyTorch implementation can replace this class without changing
    the API route or score contract.
    """

    def reconstruction_loss(self, features: dict[str, Any]) -> float:
        entropy = float(features.get("entropy", 0))
        disguise = 0.25 if features.get("has_double_extension") else 0.0
        return min(1.0, max(0.0, (max(entropy - 3.5, 0) / 5.0) + disguise))
