import logging
from pathlib import Path
from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: Path) -> list[dict]:
    """Extract text from PDF, returning list of {page_number, text} dicts."""
    pages = []
    try:
        reader = PdfReader(str(file_path))
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                pages.append({"page_number": i + 1, "text": text})
    except Exception as e:
        logger.error(f"Failed to parse PDF {file_path}: {e}")
        raise ValueError(f"Could not parse PDF: {e}")

    if not pages:
        raise ValueError("PDF contains no extractable text")

    return pages


def get_pdf_page_count(file_path: Path) -> int:
    reader = PdfReader(str(file_path))
    return len(reader.pages)
