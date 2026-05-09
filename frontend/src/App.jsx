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
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
    setSelectedDoc(id === selectedDoc ? null : id)
    setConversationId(null)
  }

  function handleNewChat() {
    setConversationId(null)
    setSelectedDoc(null)
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        documents={documents}
        selectedDoc={selectedDoc}
        onSelect={handleSelectDoc}
        onUpload={() => setShowUpload(true)}
        onNewChat={handleNewChat}
        onDocumentsChange={loadDocuments}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <ChatPanel
        selectedDoc={selectedDoc}
        conversationId={conversationId}
        onConversationId={setConversationId}
        documents={documents}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
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
