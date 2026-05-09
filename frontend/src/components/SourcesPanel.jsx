import { X, FileText, Hash } from 'lucide-react'

export default function SourcesPanel({ sources, onClose }) {
  return (
    <aside className="w-96 border-l border-white/5 glass flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white text-sm">Source References</h3>
          <p className="text-[11px] text-dark-500 mt-0.5">{sources.length} relevant passage{sources.length > 1 ? 's' : ''} found</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition text-dark-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {sources.map((source, i) => (
          <div key={i} className="glass-light rounded-xl p-4 hover:bg-white/[0.07] transition">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <FileText className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="text-xs font-medium text-dark-200 truncate flex-1">
                {source.filename}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-md font-medium">
                  Page {source.page_number}
                </span>
                <span className="text-[10px] bg-white/5 text-dark-400 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                  <Hash className="w-2.5 h-2.5" />
                  {source.chunk_index}
                </span>
              </div>
            </div>
            <p className="text-xs text-dark-400 leading-relaxed border-l-2 border-indigo-500/30 pl-3">
              {source.content_preview}...
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}
