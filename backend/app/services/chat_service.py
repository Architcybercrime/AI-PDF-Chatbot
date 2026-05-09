import uuid
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import GOOGLE_API_KEY
from app.services.vector_store import search_similar
from app.models.schemas import ChatResponse, SourceReference

logger = logging.getLogger(__name__)

_conversations: dict[str, list[dict]] = {}

SYSTEM_PROMPT = """You are a helpful document assistant. Answer questions based ONLY on the provided document context below. Follow these rules strictly:

1. Only use information from the provided context to answer questions.
2. If the context does not contain enough information to answer, say "I don't have enough information in the uploaded documents to answer this question."
3. Cite your sources by mentioning the filename and page number.
4. Be concise but thorough.
5. If asked a follow-up question, use conversation history for context but still ground answers in documents.
6. Never make up information that isn't in the documents.

Context from documents:
{context}

Previous conversation:
{history}"""


def _format_history(conversation_id: str) -> str:
    history = _conversations.get(conversation_id, [])
    if not history:
        return "None"
    lines = []
    for msg in history[-6:]:
        role = "User" if msg["role"] == "user" else "Assistant"
        lines.append(f"{role}: {msg['content'][:200]}")
    return "\n".join(lines)


def chat(question: str, document_id: str | None = None, conversation_id: str | None = None) -> ChatResponse:
    if not conversation_id:
        conversation_id = str(uuid.uuid4())

    relevant_docs = search_similar(question, k=4, document_id=document_id)

    context_parts = []
    sources = []
    seen = set()

    for doc in relevant_docs:
        meta = doc.metadata
        key = (meta.get("filename", ""), meta.get("page_number", 0), meta.get("chunk_index", 0))
        if key in seen:
            continue
        seen.add(key)

        context_parts.append(
            f"[{meta.get('filename', 'unknown')} - Page {meta.get('page_number', '?')}]\n{doc.page_content}"
        )
        sources.append(SourceReference(
            filename=meta.get("filename", "unknown"),
            page_number=meta.get("page_number", 0),
            chunk_index=meta.get("chunk_index", 0),
            content_preview=doc.page_content[:150],
        ))

    context = "\n\n---\n\n".join(context_parts) if context_parts else "No relevant documents found."
    history = _format_history(conversation_id)

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.1,
        google_api_key=GOOGLE_API_KEY,
    )

    messages = [
        SystemMessage(content=SYSTEM_PROMPT.format(context=context, history=history)),
        HumanMessage(content=question),
    ]

    response = llm.invoke(messages)
    answer = response.content

    if conversation_id not in _conversations:
        _conversations[conversation_id] = []
    _conversations[conversation_id].append({"role": "user", "content": question})
    _conversations[conversation_id].append({"role": "assistant", "content": answer})

    return ChatResponse(
        answer=answer,
        sources=sources,
        conversation_id=conversation_id,
    )
