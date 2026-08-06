import { useState, useEffect } from 'react'
import { FaReceipt, FaCheck, FaTimes, FaLock, FaSearch, FaEdit } from 'react-icons/fa'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1">
            <FaReceipt size={12} /> Office Billing Counter
          </span>
          <h1 className="text-3xl font-black text-[#0E4429] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
            Admission Fee Challans
          </h1>
          <p className="text-xs text-[#3a4a40]">
            Issue standard one-time session vouchers and log paid receipt verifications.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card !p-4">
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a4a40]/60" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or voucher ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE8DD] text-xs font-semibold focus:outline-none focus:border-[#147a4a]"
          />
        </div>
      </div>

      {/* Challans Table */}
      <div className="card !p-0 overflow-hidden border-2 border-[#DCE8DD]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0E4429] text-white font-extrabold border-b border-[#DCE8DD]">
                <th className="p-4">Voucher ID</th>
                <th className="p-4">Student & Roll No</th>
                <th className="p-4">Fee Structure</th>
                <th className="p-4">Amount & Due Date</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE8DD]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#F1ECE0]/40 transition-colors">
                  <td className="p-4 font-black text-[#147a4a] truncate max-w-[80px]" title={c.id}>{c.id.substring(0, 10)}...</td>
                  <td className="p-4 font-bold text-[#0E4429]">
                    <p className="font-extrabold text-sm">{c.studentName}</p>
                    <p className="text-[10px] text-[#3a4a40] font-medium">{c.rollNo}</p>
                  </td>
                  <td className="p-4 font-medium text-[#3a4a40]">
                    <p>{c.description}</p>
                    <p className="text-[10px] text-amber-700 font-bold">Venue: D.A.V. School, Ghotki</p>
                  </td>
                  <td className="p-4 font-extrabold text-[#0E4429]">
                    <p className="text-sm">₨ {Number(c.amount).toLocaleString()}</p>
                    <p className="text-[10px] text-[#3a4a40] font-normal">Due: {c.dueDate}</p>
                  </td>
                  <td className="p-4">
                    {c.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                        <FaCheck size={10} /> Paid & Cleared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                        <FaTimes size={10} /> Unpaid
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleMarkPaid(c.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                          c.status === 'paid'
                            ? 'bg-amber-500/10 text-amber-800 hover:bg-amber-500/20'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {c.status === 'paid' ? 'Mark Unpaid' : 'Mark Received'}
                      </button>

                      <button
                        onClick={() => openEditModal(c)}
                        className="px-2 py-1.5 rounded-lg font-bold text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                        title="Edit Voucher Details"
                      >
                        <FaEdit size={12} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-lg !p-6 space-y-4 bg-white border-2 border-[#147a4a]/30 shadow-2xl">
            <h2 className="text-xl font-black text-[#0E4429]" style={{ fontFamily: 'var(--font-heading)' }}>
              Edit Voucher Details
            </h2>
            <p className="text-xs font-bold text-[#3a4a40]">Student: <span className="text-[#147a4a]">{editingChallan.studentName}</span></p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">
                  Fee Description
                </label>
                <input
                  type="text"
                  required
                  value={editingChallan.description}
                  onChange={(e) => setEditingChallan({ ...editingChallan, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DD] text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">
                    Amount (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingChallan.amount}
                    onChange={(e) => setEditingChallan({ ...editingChallan, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DD] text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="text"
                    required
                    value={editingChallan.dueDate}
                    onChange={(e) => setEditingChallan({ ...editingChallan, dueDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DD] text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCE8DD] text-xs font-bold text-[#3a4a40]"
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
