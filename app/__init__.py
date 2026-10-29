import pathlib
import sys

_ML_DIR = pathlib.Path(__file__).resolve().parent.parent / "ml-service"
if str(_ML_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_DIR))

__path__ = [str(_ML_DIR / "app")]

from .main import app  # noqa: E402, F401
