import uuid
import logging
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import UPLOAD_DIR, MAX_FILE_SIZE_MB
from app.models.schemas import ChatRequest, ChatResponse, DocumentInfo, HealthResponse
from app.utils.pdf_parser import extract_text_from_pdf, get_pdf_page_count
from app.utils.chunker import chunk_pages
from app.services.vector_store import (
    add_chunks_to_store,
    get_all_documents,
    get_document_by_id,
    delete_document_from_store,
    is_index_ready,
)
from app.services.chat_service import chat

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    docs = get_all_documents()
    return HealthResponse(
        status="healthy",
        documents_count=len(docs),
        index_ready=is_index_ready(),
    )


@router.post("/upload", response_model=DocumentInfo)
async def upload_document(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB",
        )

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty")

    document_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{document_id}.pdf"
    file_path.write_bytes(content)

    try:
        pages = extract_text_from_pdf(file_path)
        page_count = get_pdf_page_count(file_path)
        chunks = chunk_pages(pages, document_id, file.filename)

        doc_info = {
            "id": document_id,
            "filename": file.filename,
            "page_count": page_count,
            "chunk_count": len(chunks),
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "size_bytes": len(content),
        }

        add_chunks_to_store(chunks, document_id, doc_info)

        return DocumentInfo(**doc_info)

    except ValueError as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        file_path.unlink(missing_ok=True)
        logger.error(f"Upload processing failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to process document")


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    try:
        response = chat(
            question=request.question,
            document_id=request.document_id,
            conversation_id=request.conversation_id,
        )
        return response
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")


@router.get("/documents", response_model=list[DocumentInfo])
async def list_documents():
    docs = get_all_documents()
    return [DocumentInfo(**doc) for doc in docs]


@router.get("/documents/{document_id}", response_model=DocumentInfo)
async def get_document(document_id: str):
    doc = get_document_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentInfo(**doc)


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    doc = get_document_by_id(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    delete_document_from_store(document_id)

    file_path = UPLOAD_DIR / f"{document_id}.pdf"
    file_path.unlink(missing_ok=True)

    return {"message": "Document deleted", "id": document_id}
