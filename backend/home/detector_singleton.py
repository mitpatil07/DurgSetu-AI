"""
Singleton holder for StructuralChangeDetector.

Importing this module initialises the detector once and stores it in
`detector_instance`.  All views should use this shared instance instead of
calling `StructuralChangeDetector()` on every request.
"""
import logging

logger = logging.getLogger(__name__)

detector_instance = None

try:
    from .structural_detector import StructuralChangeDetector
    detector_instance = StructuralChangeDetector()
    logger.info("StructuralChangeDetector loaded and cached at startup.")
except Exception as exc:  # pragma: no cover
    logger.warning("Could not pre-load StructuralChangeDetector: %s", exc)
