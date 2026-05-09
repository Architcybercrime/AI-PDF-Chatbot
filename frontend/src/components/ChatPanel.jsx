import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, BookOpen, Sparkles, FileText, Menu, ArrowUp } from 'lucide-react'
import { sendMessage } from '../services/api'
import SourcesPanel from './SourcesPanel'

export default function ChatPanel({ selectedDoc, conversationId, onConversationId, documents, onToggleSidebar, sidebarOpen }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeSources, setActiveSources] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const selectedDocument = documents?.find(d => d.id === selectedDoc)

  useEffect(() => {
    setMessages([])
    setActiveSources(null)
  }, [selectedDoc, conversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [selectedDoc])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const question = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const res = await sendMessage(question, selectedDoc, conversationId)
      onConversationId(res.conversation_id)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer, sources: res.sources },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Something went wrong: ${err.message}`, error: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  return (
    <div className="flex-1 flex min-w-0">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-white/5 glass flex-shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-white/5 transition text-dark-400 hover:text-white">
                <Menu className="w-4 h-4" />
              </button>
            )}
            {selectedDocument ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-200">{selectedDocument.filename}</p>
                  <p className="text-[10px] text-dark-500">{selectedDocument.page_count} pages &middot; {selectedDocument.chunk_count} chunks indexed</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-dark-400">All documents</p>
            )}
          </div>
          {messages.length > 0 && (
            <span className="text-[10px] text-dark-500 bg-white/5 px-2.5 py-1 rounded-full">
              {messages.filter(m => m.role === 'user').length} messages
            </span>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <div className="float-animation mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center glow-purple">
                  <Sparkles className="w-10 h-10 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-2">Ask anything about your docs</h2>
              <p className="text-dark-400 text-sm max-w-md text-center mb-8">
                {selectedDoc
                  ? `Chatting with ${selectedDocument?.filename || 'selected document'}. Ask a question below.`
                  : 'Upload a PDF and ask questions — get AI-powered answers with source citations.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {['What are the key takeaways?', 'Summarize the main points', 'What data is presented?', 'Explain the conclusions'].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); inputRef.current?.focus() }}
                    className="text-left px-4 py-3 rounded-xl glass-light text-sm text-dark-300 hover:text-white hover:bg-white/10 transition group"
                  >
                    <span className="text-dark-500 group-hover:text-indigo-400 transition mr-2">&#8594;</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">
              {messages.map((msg, i) => (
                <div key={i} className={`message-enter flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      : msg.error
                      ? 'bg-red-500/15'
                      : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className={`w-4 h-4 ${msg.error ? 'text-red-400' : 'text-emerald-400'}`} />
                    }
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block text-left rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-md'
                        : msg.error
                        ? 'glass border border-red-500/20 text-red-300 rounded-tl-md'
                        : 'glass text-dark-200 rounded-tl-md'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <button
                        onClick={() => setActiveSources(msg.sources)}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-400/70 hover:text-indigo-300 transition px-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        View {msg.sources.length} source{msg.sources.length > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="message-enter flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-md px-5 py-4">
                    <div className="flex gap-1.5">
                      <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
                      <span className="typing-dot w-2 h-2 bg-indigo-400 rounded-full" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto">
            <div className="relative glass rounded-2xl glow-indigo focus-within:border-indigo-500/30 transition">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents..."
                rows={1}
                className="w-full px-5 py-4 pr-14 bg-transparent text-sm text-white placeholder-dark-500 focus:outline-none resize-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-3 bottom-3 w-8 h-8 rounded-xl btn-primary flex items-center justify-center disabled:opacity-30 disabled:hover:transform-none disabled:hover:shadow-none"
              >
                <ArrowUp className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-center text-[10px] text-dark-600 mt-2">
              DocuChat AI can make mistakes. Verify important information against source documents.
            </p>
          </form>
        </div>
      </div>

      {/* Sources Panel */}
      {activeSources && (
        <SourcesPanel sources={activeSources} onClose={() => setActiveSources(null)} />
      )}
    </div>
  )
}
