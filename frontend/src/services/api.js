const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api'

export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Upload failed')
  }

  return res.json()
}

export async function sendMessage(question, documentId, conversationId) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      document_id: documentId || null,
      conversation_id: conversationId || null,
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Chat request failed')
  }

  return res.json()
}

export async function getDocuments() {
  const res = await fetch(`${BASE_URL}/documents`)
  if (!res.ok) throw new Error('Failed to fetch documents')
  return res.json()
}

export async function deleteDocument(id) {
  const res = await fetch(`${BASE_URL}/documents/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete document')
  return res.json()
}

export async function getHealth() {
  const res = await fetch(`${BASE_URL}/health`)
  if (!res.ok) throw new Error('Health check failed')
  return res.json()
}
