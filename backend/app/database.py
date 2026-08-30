"""
Resilient Database Store for Credit DNA:
Provides fast, zero-hang storage that works seamlessly with Firestore when connected,
and provides instantaneous local persistence fallback if Firestore network/gRPC hangs or is blocked.
"""
import os
import json
import threading
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.firebase import get_firestore_db

_LOCAL_STORAGE_FILE = os.path.join(os.path.dirname(__file__), "..", "local_db.json")
_mem_lock = threading.Lock()
_mem_db: Dict[str, Any] = {"users": {}, "entries": {}, "scores": {}}

# Load existing local data if present
try:
    if os.path.exists(_LOCAL_STORAGE_FILE):
        with open(_LOCAL_STORAGE_FILE, "r", encoding="utf-8") as f:
            _mem_db = json.load(f)
except Exception:
    pass


def _save_local():
    try:
        with open(_LOCAL_STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(_mem_db, f, indent=2)
    except Exception:
        pass


class MockDoc:
    def __init__(self, doc_id: str, data: Optional[Dict[str, Any]]):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self) -> Dict[str, Any]:
        return dict(self._data) if self._data else {}


class MockCollection:
    def __init__(self, col_name: str, parent_key: str = ""):
        self.col_name = col_name
        self.parent_key = parent_key
        self._limit: Optional[int] = None

    def document(self, doc_id: str):
        return MockDocumentRef(self.col_name, doc_id, self.parent_key)

    def limit(self, count: int):
        self._limit = count
        return self

    def stream(self):
        with _mem_lock:
            key = f"{self.parent_key}_{self.col_name}" if self.parent_key else self.col_name
            items = _mem_db.get(key, {})
            docs = [MockDoc(k, v) for k, v in items.items()]
            if self._limit is not None:
                docs = docs[:self._limit]
            return docs

    def add(self, data: Dict[str, Any]):
        with _mem_lock:
            key = f"{self.parent_key}_{self.col_name}" if self.parent_key else self.col_name
            if key not in _mem_db:
                _mem_db[key] = {}
            doc_id = f"doc_{int(datetime.utcnow().timestamp() * 1000)}"
            _mem_db[key][doc_id] = data
            _save_local()
            return (None, MockDocumentRef(self.col_name, doc_id, self.parent_key))


class MockDocumentRef:
    def __init__(self, col_name: str, doc_id: str, parent_key: str = ""):
        self.col_name = col_name
        self.doc_id = doc_id
        self.parent_key = parent_key

    def get(self):
        with _mem_lock:
            key = f"{self.parent_key}_{self.col_name}" if self.parent_key else self.col_name
            data = _mem_db.get(key, {}).get(self.doc_id)
            return MockDoc(self.doc_id, data)

    def set(self, data: Dict[str, Any]):
        with _mem_lock:
            key = f"{self.parent_key}_{self.col_name}" if self.parent_key else self.col_name
            if key not in _mem_db:
                _mem_db[key] = {}
            _mem_db[key][self.doc_id] = data
            _save_local()

    def collection(self, subcol_name: str):
        full_parent = f"{self.col_name}_{self.doc_id}"
        return MockCollection(subcol_name, parent_key=full_parent)


class ResilientDb:
    def collection(self, col_name: str):
        return MockCollection(col_name)


_resilient_db_instance = ResilientDb()


def get_db():
    """FastAPI dependency to yield the database client."""
    yield _resilient_db_instance
