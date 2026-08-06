import { useState, useEffect } from 'react'
import { History, Search, ShieldAlert } from 'lucide-react'
import auditLogService from '../../services/auditLogService'

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const fetchLogs = async () => {
    setLoading(true)
    const res = await auditLogService.getLogs({
      role: roleFilter !== 'all' ? roleFilter : undefined,
      search: search || undefined,
      limit: 100,
    })
    if (res && res.success) {
      setLogs(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
  }, [roleFilter])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    // Debounce search
    clearTimeout(window._auditSearchTimer)
    window._auditSearchTimer = setTimeout(() => {
      fetchLogs()
    }, 500)
  }

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <History size={12} /> System Audit Trail
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Administrative Audit Log
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">
            Complete security trail tracking staff actions, student approvals, fee vouchers, and content modifications.
          </p>
        </div>

        <div className="flex rounded-xl bg-[#060e0a] border border-[#10b981]/25 p-1 gap-1">
          {['all', 'admin', 'clerk', 'teacher'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                roleFilter === role
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm'
                  : 'text-emerald-100/60 hover:text-emerald-300'
              }`}
            >
              {role === 'all' ? 'All Logs' : `${role.charAt(0).toUpperCase() + role.slice(1)} Actions`}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card-glass !p-4 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Filter audit logs by staff member, action, or target..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 !p-12 text-center space-y-3 border-dashed rounded-3xl">
          <History size={40} className="mx-auto text-emerald-500/40" />
          <h3 className="font-extrabold text-base text-white">No Audit Logs Yet</h3>
          <p className="text-xs text-emerald-100/60 font-semibold max-w-sm mx-auto">Administrative actions will be automatically logged here as staff perform operations.</p>
        </div>
      ) : (
        /* Audit Log Table */
        <div className="card-glass !p-0 overflow-hidden border border-[#10b981]/15 bg-[#0a1b14]/50 rounded-3xl shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#060e0a] text-white font-extrabold border-b border-[#10b981]/15 uppercase tracking-wider">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Staff Member</th>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Details Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10b981]/10 text-emerald-100">
                {logs.map((l) => (
                  <tr key={l._id} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="p-4 font-extrabold text-emerald-100/50 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-white">
                      <p>{l.actorName}</p>
                      <span className="badge badge-gold text-[9px] py-0.5 mt-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">{l.actorRole}</span>
                    </td>
                    <td className="p-4 font-black">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-400">{l.targetType || '—'}</td>
                    <td className="p-4 font-medium text-emerald-100/70">{l.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
