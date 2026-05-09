# AI PDF Chatbot

A production-ready RAG (Retrieval-Augmented Generation) application that lets users upload PDF documents and chat with them using semantic search + OpenAI LLM answers.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   React +   │────▶│   FastAPI    │────▶│    FAISS     │
│  Tailwind   │◀────│  + LangChain │◀────│ Vector Store │
└─────────────┘     └──────────────┘     └──────────────┘
    Frontend             Backend            Embeddings
```

**Flow:**
1. User uploads a PDF → Backend extracts text, chunks it, generates embeddings, stores in FAISS
2. User asks a question → Backend searches FAISS for relevant chunks → Sends context + question to OpenAI → Returns grounded answer with source citations

**Why FAISS over Pinecone:** Zero setup, runs locally, no API key needed. To switch to Pinecone later, replace `vector_store.py` with Pinecone client calls.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | FastAPI, Python 3.11 |
| AI/RAG | LangChain, OpenAI GPT-4o-mini |
| Vector DB | FAISS (local) |
| Deploy | Docker, Vercel (frontend) |

## Folder Structure

```
AI-PDF-Chatbot/
├── backend/
│   ├── app/
│   │   ├── api/routes.py          # API endpoints
│   │   ├── models/schemas.py      # Pydantic models
│   │   ├── services/
│   │   │   ├── vector_store.py    # FAISS operations
│   │   │   └── chat_service.py    # RAG + LLM logic
│   │   ├── utils/
│   │   │   ├── pdf_parser.py      # PDF text extraction
│   │   │   └── chunker.py         # Text splitting
│   │   ├── config.py              # Environment config
│   │   └── main.py                # FastAPI app
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel.jsx      # Chat interface
│   │   │   ├── Sidebar.jsx        # Document list
│   │   │   ├── SourcesPanel.jsx   # Citation panel
│   │   │   └── UploadModal.jsx    # File upload
│   │   ├── services/api.js        # API client
│   │   ├── App.jsx                # Root component
│   │   └── main.jsx               # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the Vite proxy forwards `/api` requests to the backend.

## Docker Deployment

```bash
# Create backend/.env with your OPENAI_API_KEY first
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs (Swagger UI)

## Vercel Deployment (Frontend)

1. Push `frontend/` to a GitHub repo
2. Import in Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable `VITE_API_URL` pointing to your deployed backend

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/upload` | Upload a PDF |
| POST | `/api/chat` | Ask a question |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/{id}` | Get document details |
| DELETE | `/api/documents/{id}` | Delete a document |

### Chat Request Example

```json
POST /api/chat
{
  "question": "What are the key findings?",
  "document_id": "optional-uuid",
  "conversation_id": "optional-uuid"
}
```

### Chat Response Example

```json
{
  "answer": "Based on the document, the key findings are...",
  "sources": [
    {
      "filename": "report.pdf",
      "page_number": 3,
      "chunk_index": 7,
      "content_preview": "The study found that..."
    }
  ],
  "conversation_id": "uuid-for-follow-ups"
}
```

## Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | required |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:5173` |
| `UPLOAD_DIR` | PDF storage path | `./uploads` |
| `FAISS_INDEX_DIR` | Index storage path | `./faiss_index` |
| `MAX_FILE_SIZE_MB` | Upload limit | `20` |
| `CHUNK_SIZE` | Text chunk size | `1000` |
| `CHUNK_OVERLAP` | Chunk overlap | `200` |

## Switching to Pinecone

Replace `backend/app/services/vector_store.py` with a Pinecone implementation:

```python
from pinecone import Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("pdf-chatbot")
```

Add to `.env`:
```
PINECONE_API_KEY=your-key
PINECONE_INDEX=pdf-chatbot
```

## Notes

- Conversation history is stored in-memory (resets on server restart). For persistence, add Redis or a database.
- FAISS deletion rebuilds aren't implemented (metadata is removed but vectors remain). For production, use Pinecone or rebuild the index periodically.
- The system prompt instructs the LLM to never hallucinate — it will say "I don't know" if context is insufficient.
- Embeddings use OpenAI's `text-embedding-ada-002` model via LangChain.
