import { useState, useEffect, useRef } from "react"

type Phase = "form" | "chat"

type LocalMsg = {
  id: string
  text: string
  timestamp: string
  source: "customer"
}

type AgentMsg = {
  id: string
  content: { text?: string }
  timestamp: string
  source: "agent"
}

type StoredSession = {
  contactId: string
  phone: string
  name: string
  localMessages: LocalMsg[]
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem("embrace_wa_session")
    if (!raw) return null
    const s = JSON.parse(raw) as StoredSession & { messages?: Array<{ id: string; content?: { text?: string }; timestamp: string }> }
    // migrate old format
    if (s.messages && !s.localMessages) {
      s.localMessages = s.messages.map((m) => ({
        id: m.id,
        text: m.content?.text ?? "",
        timestamp: m.timestamp,
        source: "customer" as const,
      }))
      delete s.messages
    }
return s as StoredSession
  } catch {
    return null
  }
}

function saveSession(s: StoredSession) {
  localStorage.setItem("embrace_wa_session", JSON.stringify(s))
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div className="bg-green-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
        <WhatsAppIcon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight">Embrace Support</p>
        <p className="text-green-200 text-xs flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block" />
          Powered by WhatsApp
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function FormPhase({
  onSubmit,
  onBack,
  loading,
  error,
}: {
  onSubmit: (name: string, phone: string, message: string) => void
  onBack: () => void
  loading: boolean
  error: string | null
}) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !message.trim()) return
    onSubmit(name.trim(), phone.trim(), message.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        <p className="text-xs text-gray-500">
          Quick intro so our team can reach you on WhatsApp if needed.
        </p>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
          <p className="text-xs text-gray-400 mt-1">In case we need to follow up with you.</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">First message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask us anything about our drinks, ingredients, delivery..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            required
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>
      <div className="p-4 border-t border-gray-100 bg-white space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : null}
          {loading ? "Starting chat…" : "Start chatting →"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-gray-400 hover:text-gray-600 text-sm py-1 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
        <span className="flex gap-1 items-center">
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "160ms" }} />
          <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "320ms" }} />
        </span>
      </div>
    </div>
  )
}

function ChatPhase({
  session,
  onReset,
}: {
  session: StoredSession
  onReset: () => void
}) {
  const [localMessages, setLocalMessages] = useState<LocalMsg[]>(session.localMessages)
  const [agentMessages, setAgentMessages] = useState<AgentMsg[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Poll for agent replies every 5 seconds
  useEffect(() => {
    const contactId = session.contactId
    const fetchReplies = async () => {
      try {
        const res = await fetch(`/api/whatsapp/messages?contactId=${contactId}`)
        if (res.ok) {
          const data = await res.json()
          type RawMsg = { id: string; direction: string; content: { text?: string }; timestamp: string }
          const outgoing: AgentMsg[] = (data.messages as RawMsg[])
            .filter((m) => m.direction === "outgoing")
            .map((m) => ({
              id: m.id,
              content: m.content,
              timestamp: m.timestamp,
              source: "agent" as const,
            }))
          setAgentMessages(outgoing)
        }
      } catch {
        // ignore network errors
      }
    }

    const interval = setInterval(fetchReplies, 5000)
    fetchReplies()
    return () => clearInterval(interval)
  }, [session.contactId])

  // Merge customer + agent messages sorted chronologically
  const allMessages = [
    ...localMessages,
    ...agentMessages,
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages.length])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const text = input.trim()
    setInput("")
    setSending(true)

    const newMsg: LocalMsg = {
      id: `local-${Date.now()}`,
      text,
      timestamp: new Date().toISOString(),
      source: "customer",
    }
    const updated = [...localMessages, newMsg]
    setLocalMessages(updated)
    saveSession({ ...session, localMessages: updated })

    try {
      await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: session.contactId, message: text }),
      })
    } catch {
      // message is already shown optimistically; server error is non-fatal
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Message thread */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
        {allMessages.map((msg) =>
          msg.source === "customer" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="bg-green-500 text-white rounded-2xl rounded-br-none px-4 py-2 max-w-[80%]">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs text-green-200 mt-0.5 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-none shadow-sm px-4 py-2 max-w-[80%]">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {(msg as AgentMsg).content?.text ?? "…"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )
        )}

        {/* Typing indicator while waiting for first agent reply */}
        {agentMessages.length === 0 && localMessages.length > 0 && (
          <TypingIndicator />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-100 bg-white px-3 pt-2 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition-colors"
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-9 h-9 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            {sending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-1.5">
          Replies also sent to your WhatsApp ·{" "}
          <button
            onClick={onReset}
            className="underline hover:text-gray-600 transition-colors"
          >
            New chat
          </button>
        </p>
      </div>
    </div>
  )
}

export const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>("form")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<StoredSession | null>(null)

  // Resume previous session
  useEffect(() => {
    const stored = loadSession()
    if (stored) {
      setSession(stored)
      setPhase("chat")
    }
  }, [])

  const handleFormSubmit = async (name: string, phone: string, message: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/whatsapp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      const newSession: StoredSession = {
        contactId: data.contactId,
        phone: data.phone,
        name,
        localMessages: [
          {
            id: "local-initial",
            text: message,
            timestamp: new Date().toISOString(),
            source: "customer",
          },
        ],
      }
      saveSession(newSession)
      setSession(newSession)
      setPhase("chat")
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    localStorage.removeItem("embrace_wa_session")
    setSession(null)
    setPhase("form")
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200"
          style={{ width: "360px", height: "560px" }}
        >
          <Header onClose={() => setOpen(false)} />
          {phase === "form" && (
            <FormPhase
              onSubmit={handleFormSubmit}
              onBack={() => setOpen(false)}
              loading={loading}
              error={error}
            />
          )}
          {phase === "chat" && session && (
            <ChatPhase session={session} onReset={handleReset} />
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <WhatsAppIcon className="w-7 h-7" />
        )}
      </button>
    </div>
  )
}
