import { FileText, Plus, MessageSquarePlus, Trash2, ChevronLeft, Sparkles, File } from 'lucide-react'
import { deleteDocument } from '../services/api'

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function Sidebar({ documents, selectedDoc, onSelect, onUpload, onNewChat, onDocumentsChange, isOpen, onToggle }) {
  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!confirm('Delete this document and its embeddings?')) return
    try {
      await deleteDocument(id)
      onDocumentsChange()
    } catch (err) {
      alert('Failed to delete document')
    }
  }

  return (
    <aside className={`${isOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0`}>
      <div className="w-80 h-full glass flex flex-col border-r border-white/5">
        {/* Logo */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-indigo">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">DocuChat</h1>
              <p className="text-[10px] text-dark-400 font-medium uppercase tracking-widest">AI-Powered</p>
            </div>
          </div>
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/5 transition text-dark-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="px-4 space-y-2">
          <button
            onClick={onUpload}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 btn-primary rounded-xl text-sm font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            Upload PDF
          </button>
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 glass-light rounded-xl text-sm font-medium text-dark-300 hover:text-white hover:bg-white/10 transition"
          >
            <MessageSquarePlus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 my-4 border-t border-white/5" />

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-3">
          <p className="text-[10px] font-bold text-dark-500 uppercase tracking-[0.15em] mb-2 px-2">
            Your Documents ({documents.length})
          </p>
          {documents.length === 0 ? (
            <div className="px-2 py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <File className="w-6 h-6 text-dark-500" />
              </div>
              <p className="text-sm text-dark-500">No documents yet</p>
              <p className="text-xs text-dark-600 mt-1">Upload a PDF to get started</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  onClick={() => onSelect(doc.id)}
                  className={`sidebar-item flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer group ${
                    selectedDoc === doc.id ? 'active' : ''
                  }`}
                >
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedDoc === doc.id
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-white/5 text-dark-400'
                  }`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      selectedDoc === doc.id ? 'text-indigo-300' : 'text-dark-200'
                    }`}>
                      {doc.filename}
                    </p>
                    <p className="text-[11px] text-dark-500 mt-0.5">
                      {doc.page_count} pages &middot; {doc.chunk_count} chunks &middot; {formatSize(doc.size_bytes)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, doc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-dark-500 transition mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-[11px] text-dark-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Powered by OpenAI + LangChain</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
