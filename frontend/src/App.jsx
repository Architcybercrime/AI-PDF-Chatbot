import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import UploadModal from './components/UploadModal'
import { getDocuments } from './services/api'

export default function App() {
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [conversationId, setConversationId] = useState(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    try {
      const docs = await getDocuments()
      setDocuments(docs)
    } catch (e) {
      console.error('Failed to load documents:', e)
    }
  }

  function handleDocumentUploaded(doc) {
    setDocuments((prev) => [doc, ...prev])
    setShowUpload(false)
    setSelectedDoc(doc.id)
    setConversationId(null)
  }

  function handleSelectDoc(id) {
    setSelectedDoc(id)
    setConversationId(null)
  }

  function handleNewChat() {
    setConversationId(null)
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        documents={documents}
        selectedDoc={selectedDoc}
        onSelect={handleSelectDoc}
        onUpload={() => setShowUpload(true)}
        onNewChat={handleNewChat}
        onDocumentsChange={loadDocuments}
      />

      <ChatPanel
        selectedDoc={selectedDoc}
        conversationId={conversationId}
        onConversationId={setConversationId}
      />

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={handleDocumentUploaded}
        />
      )}
    </div>
  )
}
