import { FileText, Plus, MessageSquarePlus, Trash2 } from 'lucide-react'
import { deleteDocument } from '../services/api'

export default function Sidebar({ documents, selectedDoc, onSelect, onUpload, onNewChat, onDocumentsChange }) {
  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!confirm('Delete this document?')) return
    try {
      await deleteDocument(id)
      onDocumentsChange()
    } catch (err) {
      alert('Failed to delete document')
    }
  }

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          PDF Chatbot
        </h1>
      </div>

      <div className="p-3 space-y-2">
        <button
          onClick={onUpload}
          className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Upload PDF
        </button>
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          <MessageSquarePlus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-1">Documents</p>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-400 px-1">No documents uploaded yet</p>
        ) : (
          <ul className="space-y-1">
            {documents.map((doc) => (
              <li
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition group ${
                  selectedDoc === doc.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{doc.filename}</span>
                </div>
                <button
                  onClick={(e) => handleDelete(e, doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 text-xs text-gray-400">
        {documents.length} document{documents.length !== 1 ? 's' : ''} indexed
      </div>
    </aside>
  )
}
