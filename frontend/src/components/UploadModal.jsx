import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, CheckCircle, AlertCircle, FileUp, Sparkles } from 'lucide-react'
import { uploadDocument } from '../services/api'

export default function UploadModal({ onClose, onUploaded }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState('')

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are accepted')
      setStatus('error')
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be under 20MB')
      setStatus('error')
      return
    }

    setStatus('uploading')
    setProgress(`Processing ${file.name}...`)
    setError('')

    try {
      const doc = await uploadDocument(file)
      setStatus('success')
      setProgress(`${doc.filename} — ${doc.chunk_count} chunks indexed`)
      setTimeout(() => onUploaded(doc), 1000)
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }, [onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: status === 'uploading',
  })

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass rounded-3xl shadow-2xl w-full max-w-lg glow-purple" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload Document</h2>
              <p className="text-xs text-dark-400">PDF files up to 20MB</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition text-dark-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-indigo-400/50 bg-indigo-500/10'
                : status === 'error'
                ? 'border-red-400/30 bg-red-500/5'
                : status === 'success'
                ? 'border-emerald-400/30 bg-emerald-500/5'
                : 'border-white/10 hover:border-indigo-400/30 hover:bg-white/[0.02]'
            }`}
          >
            <input {...getInputProps()} />

            {status === 'idle' && (
              <>
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300 ${
                  isDragActive ? 'bg-indigo-500/20 scale-110' : 'bg-white/5'
                }`}>
                  <Upload className={`w-8 h-8 transition-colors ${isDragActive ? 'text-indigo-400' : 'text-dark-500'}`} />
                </div>
                <p className="text-sm text-dark-200 font-medium mb-1">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF file here'}
                </p>
                <p className="text-xs text-dark-500">or click to browse files</p>
              </>
            )}

            {status === 'uploading' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 mx-auto mb-4 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <p className="text-sm text-indigo-300 font-medium mb-1">{progress}</p>
                <p className="text-xs text-dark-500">Extracting text and generating embeddings...</p>
                <div className="mt-4 mx-auto w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-sm text-emerald-300 font-medium mb-1">Document indexed successfully</p>
                <p className="text-xs text-dark-400">{progress}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-500/15 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-sm text-red-300 font-medium mb-1">{error}</p>
                <p className="text-xs text-dark-500">Click or drop a file to try again</p>
              </>
            )}
          </div>

          {/* Features */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { icon: '🔍', label: 'Semantic Search' },
              { icon: '📄', label: 'Source Citations' },
              { icon: '💬', label: 'Follow-up Chat' },
            ].map((f) => (
              <div key={f.label} className="text-center py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-base mb-1">{f.icon}</p>
                <p className="text-[10px] text-dark-500 font-medium">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
