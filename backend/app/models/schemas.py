from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    question: str
    document_id: Optional[str] = None
    conversation_id: Optional[str] = None


class SourceReference(BaseModel):
    filename: str
    page_number: int
    chunk_index: int
    content_preview: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceReference]
    conversation_id: str


class DocumentInfo(BaseModel):
    id: str
    filename: str
    page_count: int
    chunk_count: int
    uploaded_at: str
    size_bytes: int


class HealthResponse(BaseModel):
    status: str
    documents_count: int
    index_ready: bool
