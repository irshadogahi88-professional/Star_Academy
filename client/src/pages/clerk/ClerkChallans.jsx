import { useState, useEffect } from 'react'
import { Receipt, Check, X, Lock, Search, Edit2 } from 'lucide-react'
import api from '../../services/api'

export default function ClerkChallans() {
  const [challans, setChallans] = useState([])
  const [loading, setLoading] = useState(true)

  const [showEditModal, setShowEditModal] = useState(false)
  const [search, setSearch] = useState('')
  const [editingChallan, setEditingChallan] = useState(null)

  useEffect(() => {
    fetchChallans()
  }, [])

  const fetchChallans = async () => {
    try {
      const res = await api.get('/admin/students')
      if (res.data && Array.isArray(res.data.students)) {
        const mapped = res.data.students.map(s => ({
          id: s._id,
          studentName: s.fullName,
          rollNo: s.studentDetails?.rollNo || 'Pending',
          amount: s.feeAmount || 5000,
          description: s.feeDescription || 'One-Time Admission & Annual Session Fee (2026)',
          dueDate: s.feeDueDate || new Date(new Date(s.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          status: s.feeStatus || 'unpaid',
        }))
        setChallans(mapped)
      }
    } catch (err) {
      console.warn('Failed to fetch challans from API', err)
    }
    setLoading(false)
  }

  const handleMarkPaid = async (id) => {
    const current = challans.find((c) => c.id === id)
    if (!current) return
    const newStatus = current.status === 'paid' ? 'unpaid' : 'paid'

    setChallans(
      challans.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    )

    try {
      await api.patch(`/admin/students/${id}/fee-status`, { status: newStatus })
    } catch (err) {
      alert('Failed to update fee status on server')
      setChallans(
        challans.map((c) => (c.id === id ? { ...c, status: current.status } : c))
      )
    }
  }

  const openEditModal = (challan) => {
    setEditingChallan({ ...challan })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editingChallan) return

    try {
      await api.patch(`/admin/students/${editingChallan.id}/voucher`, {
        feeAmount: editingChallan.amount,
        feeDueDate: editingChallan.dueDate,
        feeDescription: editingChallan.description,
      })

      setChallans(
        challans.map((c) => (c.id === editingChallan.id ? editingChallan : c))
      )
      setShowEditModal(false)
      setEditingChallan(null)
    } catch (err) {
      alert('Failed to update voucher details')
    }
  }

  const filtered = challans.filter((c) =>
    c.studentName.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Receipt size={12} /> Office Billing Counter
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Admission Fee Challans
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">
            Issue standard one-time session vouchers and log paid receipt verifications.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card-glass !p-4 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or voucher ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Challans Table */}
      <div className="card-glass !p-0 overflow-hidden border border-[#10b981]/15 bg-[#0a1b14]/50 rounded-3xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#060e0a] text-white font-extrabold border-b border-[#10b981]/15 uppercase tracking-wider">
                <th className="p-4">Voucher ID</th>
                <th className="p-4">Student & Roll No</th>
                <th className="p-4">Fee Structure</th>
                <th className="p-4">Amount & Due Date</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#10b981]/10 text-emerald-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-emerald-500/5 transition-colors">
                  <td className="p-4 font-black text-emerald-400 truncate max-w-[80px]" title={c.id}>{c.id.substring(0, 10)}...</td>
                  <td className="p-4 font-bold text-white">
                    <p className="font-extrabold text-sm">{c.studentName}</p>
                    <p className="text-[10px] text-emerald-100/50 font-medium">{c.rollNo}</p>
                  </td>
                  <td className="p-4 font-medium text-emerald-100/70">
                    <p>{c.description}</p>
                    <p className="text-[10px] text-amber-400 font-bold mt-0.5">Venue: D.A.V. School, Ghotki</p>
                  </td>
                  <td className="p-4 font-extrabold text-white">
                    <p className="text-sm">₨ {Number(c.amount).toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-100/50 font-normal mt-0.5">Due: {c.dueDate}</p>
                  </td>
                  <td className="p-4">
                    {c.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                        <Check size={10} /> Paid & Cleared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25">
                        <X size={10} /> Unpaid
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleMarkPaid(c.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                          c.status === 'paid'
                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold shadow-sm'
                        }`}
                      >
                        {c.status === 'paid' ? 'Mark Unpaid' : 'Mark Received'}
                      </button>

                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg font-bold text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                        title="Edit Voucher Details"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingChallan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-lg !p-6 space-y-4 bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl">
            <h2 className="text-xl font-black text-white">
              Edit Voucher Details
            </h2>
            <p className="text-xs font-bold text-emerald-100/70">Student: <span className="text-emerald-400">{editingChallan.studentName}</span></p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                  Fee Description
                </label>
                <input
                  type="text"
                  required
                  value={editingChallan.description}
                  onChange={(e) => setEditingChallan({ ...editingChallan, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingChallan.amount}
                    onChange={(e) => setEditingChallan({ ...editingChallan, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="text"
                    required
                    value={editingChallan.dueDate}
                    onChange={(e) => setEditingChallan({ ...editingChallan, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-100/70 hover:bg-[#0a1b14]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold text-xs !py-2 !px-5 shadow-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
