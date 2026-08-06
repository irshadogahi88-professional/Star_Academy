import { useState, useEffect } from 'react'
import { Mail, Search, CheckCircle, Trash2, Reply, MailOpen, Phone, User } from 'lucide-react'
import messageService from '../../services/messageService'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedMsg, setSelectedMsg] = useState(null)
  const [notice, setNotice] = useState('')

  const fetchMessages = async () => {
    setLoading(true)
    const res = await messageService.getMessages()
    if (res && res.success) {
      setMessages(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleOpenMessage = async (msg) => {
    setSelectedMsg(msg)
    if (msg.status === 'unread') {
      await messageService.updateStatus(msg._id, 'read')
      setMessages(messages.map((m) => (m._id === msg._id ? { ...m, status: 'read' } : m)))
    }
  }

  const handleMarkReplied = async (id) => {
    const res = await messageService.updateStatus(id, 'replied')
    if (res && res.success) {
      setMessages(messages.map((m) => (m._id === id ? { ...m, status: 'replied' } : m)))
      if (selectedMsg && selectedMsg._id === id) {
        setSelectedMsg({ ...selectedMsg, status: 'replied' })
      }
      setNotice('Message marked as Replied.')
      setTimeout(() => setNotice(''), 4000)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this inquiry message from inbox?')) {
      const res = await messageService.deleteMessage(id)
      if (res && res.success) {
        setMessages(messages.filter((m) => m._id !== id))
        if (selectedMsg && selectedMsg._id === id) setSelectedMsg(null)
        setNotice('Message deleted.')
        setTimeout(() => setNotice(''), 4000)
      }
    }
  }

  const filtered = messages.filter((m) => {
    const matchesFilter = filter === 'all' ? true : m.status === filter
    const matchesSearch =
      (m.senderName || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.senderEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Mail size={12} /> Contact Inquiries Inbox
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Admission & Visitor Messages
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">
            Review, manage, and respond to incoming inquiry messages submitted through the website Contact form.
          </p>
        </div>

        <div className="flex rounded-xl bg-[#060e0a] border border-[#10b981]/25 p-1 gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm'
                : 'text-emerald-100/60 hover:text-emerald-300'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'unread'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm'
                : 'text-emerald-100/60 hover:text-emerald-300'
            }`}
          >
            Unread ({messages.filter((m) => m.status === 'unread').length})
          </button>
          <button
            onClick={() => setFilter('replied')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'replied'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm'
                : 'text-emerald-100/60 hover:text-emerald-300'
            }`}
          >
            Replied
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-extrabold text-xs flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{notice}</span>
        </div>
      )}

      {/* Search */}
      <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl !p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries by sender name, email, or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 !p-12 text-center space-y-3 border-dashed rounded-3xl">
          <MailOpen size={40} className="mx-auto text-emerald-500/40" />
          <h3 className="font-extrabold text-base text-white">No Messages Yet</h3>
          <p className="text-xs text-emerald-100/60 font-semibold max-w-sm mx-auto">Messages submitted through the Contact form will appear here.</p>
        </div>
      ) : (
        /* Inbox Split View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.map((msg) => (
              <div
                key={msg._id}
                onClick={() => handleOpenMessage(msg)}
                className={`card-glass cursor-pointer transition-all rounded-3xl !p-5 border ${
                  selectedMsg?._id === msg._id
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-md'
                    : msg.status === 'unread'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-[#10b981]/15 hover:border-emerald-400 bg-[#0a1b14]/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <User className="text-emerald-400" size={12} />
                    <h3 className="font-extrabold text-sm text-white">{msg.senderName}</h3>
                  </div>
                  {msg.status === 'unread' ? (
                    <span className="badge badge-gold text-[9px] font-black uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">New Message</span>
                  ) : msg.status === 'replied' ? (
                    <span className="badge badge-emerald text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Replied</span>
                  ) : (
                    <span className="text-[10px] text-emerald-100/50 font-semibold">Read</span>
                  )}
                </div>

                <p className="font-bold text-xs text-emerald-400 truncate">{msg.subject}</p>
                <p className="text-xs text-emerald-100/70 line-clamp-2 mt-1">{msg.message}</p>
                <p className="text-[10px] text-emerald-100/40 font-semibold text-right mt-2">
                  {new Date(msg.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Detail View */}
          <div className="lg:col-span-7">
            {selectedMsg ? (
              <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/25 rounded-3xl !p-8 space-y-6 shadow-lg sticky top-28">
                <div className="flex items-start justify-between gap-4 border-b border-[#10b981]/10 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-white leading-tight">
                      {selectedMsg.subject}
                    </h2>
                    <p className="text-xs text-emerald-100/50 mt-1 font-semibold">
                      Received: {new Date(selectedMsg.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkReplied(selectedMsg._id)}
                      className="btn-gold text-xs !py-2 !px-3 shadow-xs flex items-center gap-1.5"
                    >
                      <Reply size={12} />
                      <span>Mark Replied</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMsg._id)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-bold"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Sender Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#060e0a] border border-[#10b981]/15 text-xs font-semibold text-emerald-100">
                  <div>
                    <span className="text-emerald-100/50 block font-extrabold uppercase text-[10px]">Sender Name</span>
                    <span className="font-extrabold text-sm text-white">{selectedMsg.senderName}</span>
                  </div>
                  <div>
                    <span className="text-emerald-100/50 block font-extrabold uppercase text-[10px]">Contact Email</span>
                    <a href={`mailto:${selectedMsg.senderEmail}`} className="font-bold text-emerald-400 underline">
                      {selectedMsg.senderEmail}
                    </a>
                  </div>
                  <div>
                    <span className="text-emerald-100/50 block font-extrabold uppercase text-[10px]">Phone Number</span>
                    <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                      <Phone size={11} className="text-emerald-400" /> {selectedMsg.senderPhone || 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-100/50 block font-extrabold uppercase text-[10px]">Status</span>
                    <span className="badge badge-gold font-extrabold capitalize mt-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400">{selectedMsg.status}</span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase font-extrabold text-white tracking-wider">Inquiry Body Message</h4>
                  <div className="p-5 rounded-2xl bg-[#060e0a] border border-[#10b981]/15 text-sm text-emerald-100/90 leading-relaxed font-semibold">
                    {selectedMsg.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl !p-12 text-center space-y-3 border-dashed">
                <MailOpen size={40} className="mx-auto text-emerald-500/40" />
                <h3 className="font-extrabold text-base text-white">No Message Selected</h3>
                <p className="text-xs max-w-xs mx-auto text-emerald-100/50">Click any inquiry message from the left list to read details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
