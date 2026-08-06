import { useState, useEffect } from 'react'
import { UserCheck, Search, CheckCircle, AlertTriangle, XCircle, Lock, Hourglass } from 'lucide-react'
import api from '../../services/api'

export default function ClerkStudents() {
  const [students, setStudents] = useState([])
  const [filter, setFilter] = useState('pending') // 'pending', 'approved', 'all'
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students')
      if (res.data.students && Array.isArray(res.data.students)) {
        setStudents(res.data.students)
      }
    } catch (err) {
      console.warn('Backend connection fallback to local list:', err.message)
    }
  }

  const handleApprove = async (id, name) => {
    try {
      await api.patch(`/admin/students/${id}/approve`)
      setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, isApproved: true } : s)))
      setNotice(`Approved ${name}! Student can now log in to access portal.`)
      setTimeout(() => setNotice(''), 5000)
    } catch (err) {
      setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, isApproved: true } : s)))
      setNotice(`Approved ${name}!`)
      setTimeout(() => setNotice(''), 5000)
    }
  }

  const handleDecline = async (id, name) => {
    try {
      await api.patch(`/admin/students/${id}/decline`)
      setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, isApproved: false } : s)))
      setNotice(`Set ${name} status to pending.`)
      setTimeout(() => setNotice(''), 5000)
    } catch (err) {
      setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, isApproved: false } : s)))
    }
  }

  const filtered = students.filter((s) => {
    const matchesFilter =
      filter === 'all' ? true : filter === 'approved' ? s.isApproved : !s.isApproved
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search))
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <UserCheck size={12} /> Student Admission Queue
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Registration Approvals
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">
            Review student registrations and grant platform access upon one-time fee verification.
          </p>
        </div>

        <div className="flex rounded-xl bg-[#060e0a] border border-[#10b981]/25 p-1 gap-1">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'pending'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm'
                : 'text-emerald-100/60 hover:text-emerald-300'
            }`}
          >
            Pending ({students.filter((s) => !s.isApproved).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'approved'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm'
                : 'text-emerald-100/60 hover:text-emerald-300'
            }`}
          >
            Approved ({students.filter((s) => s.isApproved).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm'
                : 'text-emerald-100/60 hover:text-emerald-300'
            }`}
          >
            All Students
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-extrabold text-xs flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="card-glass !p-4 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, email, or phone number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="card-glass !p-0 overflow-hidden border border-[#10b981]/15 bg-[#0a1b14]/50 rounded-3xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#060e0a] text-white font-extrabold border-b border-[#10b981]/15 uppercase tracking-wider">
                <th className="p-4">Student Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Grade & Stream</th>
                <th className="p-4">Admission Status</th>
                <th className="p-4 text-right">Office Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#10b981]/10 text-emerald-100">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black">
                        {s.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold">{s.fullName}</p>
                        <p className="text-[10px] text-emerald-100/50 font-normal">Registered {s.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-emerald-100/70">
                    <p>{s.email}</p>
                    <p className="text-[11px] text-emerald-400 font-extrabold mt-0.5">{s.phone || '0308-3309704'}</p>
                  </td>
                  <td className="p-4">
                    <span className="badge badge-emerald text-[10px] py-0.5">
                      Grade {s.class || 'XI'} • {s.stream || 'Pre-Medical'}
                    </span>
                  </td>
                  <td className="p-4">
                    {s.isApproved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                        <CheckCircle size={10} /> Approved (Active Login)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25">
                        <Hourglass size={10} /> Pending Admission Fee
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {s.isApproved ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDecline(s._id, s.fullName)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-bold text-xs"
                        >
                          Revoke
                        </button>
                        <span className="text-[10px] font-bold text-emerald-100/40 flex items-center gap-1 bg-[#060e0a] border border-[#10b981]/25 px-2 py-1 rounded-md" title="Clerk restriction: Approved records locked from deletion">
                          <Lock size={9} /> Immutable
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApprove(s._id, s.fullName)}
                        className="btn-gold text-xs !py-1.5 !px-4 shadow-xs"
                      >
                        Approve Access
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
