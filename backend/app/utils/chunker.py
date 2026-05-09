from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_pages(pages: list[dict], document_id: str, filename: str) -> list[dict]:
    """Split page texts into overlapping chunks with metadata."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = []
    chunk_index = 0

    for page_data in pages:
        page_text = page_data["text"]
        page_number = page_data["page_number"]

        splits = splitter.split_text(page_text)
        for split in splits:
            chunks.append({
                "content": split,
                "metadata": {
                    "document_id": document_id,
                    "filename": filename,
                    "page_number": page_number,
                    "chunk_index": chunk_index,
                },
            })
            chunk_index += 1

    return chunks
