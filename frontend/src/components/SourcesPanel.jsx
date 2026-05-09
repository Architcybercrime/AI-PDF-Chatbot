import { X, FileText } from 'lucide-react'

export default function SourcesPanel({ sources, onClose }) {
  return (
    <aside className="w-80 border-l border-gray-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Sources</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {sources.map((source, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-gray-700 truncate">
                {source.filename}
              </span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                p.{source.page_number}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              {source.content_preview}...
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}
