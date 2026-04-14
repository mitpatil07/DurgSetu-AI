from django.apps import AppConfig


class HomeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'home'

    def ready(self):
        # Load the ML model once at startup so it is reused across requests
        # instead of being re-instantiated on every analysis call.
        # detector_singleton handles ImportError gracefully when ML deps are absent.
        try:
            from . import detector_singleton  # noqa: F401
        except Exception:
            pass
