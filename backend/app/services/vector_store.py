import logging
import json
import requests
import numpy as np
from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from app.config import FAISS_INDEX_DIR

logger = logging.getLogger(__name__)

HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"


class HuggingFaceInferenceEmbeddings(Embeddings):
    """Free HuggingFace Inference API embeddings — no API key needed."""

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        batch_size = 32
        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            response = requests.post(
                HF_API_URL,
                json={"inputs": batch, "options": {"wait_for_model": True}},
                timeout=60,
            )
            response.raise_for_status()
            all_embeddings.extend(response.json())
        return all_embeddings

    def embed_query(self, text: str) -> list[float]:
        response = requests.post(
            HF_API_URL,
            json={"inputs": text, "options": {"wait_for_model": True}},
            timeout=60,
        )
        response.raise_for_status()
        return response.json()


_embeddings: HuggingFaceInferenceEmbeddings | None = None
_vector_store: FAISS | None = None
_metadata_path = FAISS_INDEX_DIR / "documents_meta.json"


def _get_embeddings() -> HuggingFaceInferenceEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceInferenceEmbeddings()
    return _embeddings


def _load_documents_meta() -> dict:
    if _metadata_path.exists():
        return json.loads(_metadata_path.read_text())
    return {}


def _save_documents_meta(meta: dict):
    _metadata_path.write_text(json.dumps(meta, indent=2))


def get_vector_store() -> FAISS | None:
    global _vector_store
    if _vector_store is None:
        index_path = FAISS_INDEX_DIR / "index.faiss"
        if index_path.exists():
            _vector_store = FAISS.load_local(
                str(FAISS_INDEX_DIR), _get_embeddings(), allow_dangerous_deserialization=True
            )
    return _vector_store


def add_chunks_to_store(chunks: list[dict], document_id: str, doc_info: dict):
    global _vector_store

    documents = [
        Document(page_content=chunk["content"], metadata=chunk["metadata"])
        for chunk in chunks
    ]

    if _vector_store is None:
        _vector_store = FAISS.from_documents(documents, _get_embeddings())
    else:
        _vector_store.add_documents(documents)

    _vector_store.save_local(str(FAISS_INDEX_DIR))

    meta = _load_documents_meta()
    meta[document_id] = doc_info
    _save_documents_meta(meta)
    logger.info(f"Indexed {len(chunks)} chunks for document {document_id}")


def search_similar(query: str, k: int = 4, document_id: str | None = None) -> list[Document]:
    store = get_vector_store()
    if store is None:
        return []

    if document_id:
        results = store.similarity_search(
            query, k=k * 3, filter={"document_id": document_id}
        )
        return results[:k]

    return store.similarity_search(query, k=k)


def delete_document_from_store(document_id: str) -> bool:
    meta = _load_documents_meta()
    if document_id in meta:
        del meta[document_id]
        _save_documents_meta(meta)
        return True
    return False


def get_all_documents() -> list[dict]:
    meta = _load_documents_meta()
    return list(meta.values())


def get_document_by_id(document_id: str) -> dict | None:
    meta = _load_documents_meta()
    return meta.get(document_id)


def is_index_ready() -> bool:
    return get_vector_store() is not None
