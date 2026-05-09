import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadDocument } from '../services/api'

export default function UploadModal({ onClose, onUploaded }) {
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
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
    setProgress(`Uploading ${file.name}...`)
    setError('')

    try {
      const doc = await uploadDocument(file)
      setStatus('success')
      setProgress(`${doc.filename} processed (${doc.chunk_count} chunks)`)
      setTimeout(() => onUploaded(doc), 800)
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              isDragActive
                ? 'border-indigo-400 bg-indigo-50'
                : status === 'error'
                ? 'border-red-300 bg-red-50'
                : status === 'success'
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />

            {status === 'idle' && (
              <>
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF, or click to select'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Max 20MB</p>
              </>
            )}

            {status === 'uploading' && (
              <>
                <Loader2 className="w-10 h-10 text-indigo-500 mx-auto mb-3 animate-spin" />
                <p className="text-sm text-indigo-600 font-medium">{progress}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-sm text-green-600 font-medium">{progress}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
                <p className="text-xs text-red-400 mt-1">Click to try again</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
