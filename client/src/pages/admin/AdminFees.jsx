import { useState, useEffect } from 'react'
import { Receipt, Search, CheckCircle, XCircle, Printer, Phone, UserCheck, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import { adminService } from '../../services/adminService'

export default function AdminFees() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedVoucher, setSelectedVoucher] = useState(null)

  const fetchFeeRecords = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getStudents()
      if (data && data.success) {
        setStudents(data.students || [])
      } else {
        setStudents(data.students || data || [])
      }
    } catch (err) {
      console.error('Failed to fetch fee records:', err)
      setError(err.response?.data?.message || 'Failed to load fee records from database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeeRecords()
  }, [])

  const filtered = students.filter((s) => {
    const name = s.fullName || ''
    const phone = s.phone || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || phone.includes(searchTerm)
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Paid' && s.isApproved) ||
      (statusFilter === 'Unpaid' && !s.isApproved)
    return matchesSearch && matchesStatus
  })

  // Toggle Fee Payment & Portal Approval
  const handleToggleFeeStatus = async (student) => {
    try {
      const newStatus = !student.isApproved
      await adminService.updateStudentStatus(student._id || student.id, { isApproved: newStatus })
      setStudents(
        students.map((s) => ((s._id || s.id) === (student._id || student.id) ? { ...s, isApproved: newStatus } : s))
      )
    } catch (err) {
      alert('Failed to update fee status: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Receipt size={12} /> Fee & Admission Approval
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            One-Time Admission Fee Verification
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">Mark admission fees as paid to automatically approve student portal accounts.</p>
        </div>

        <button onClick={fetchFeeRecords} className="p-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 hover:bg-[#0a1b14] text-emerald-400 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center" title="Refresh Fees List">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl !p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none w-full sm:w-auto"
        >
          <option value="All">All Payment Statuses</option>
          <option value="Paid">Paid & Approved</option>
          <option value="Unpaid">Unpaid (Pending Approval)</option>
        </select>
      </div>

      {/* Fee Table */}
      <div className="card-glass !p-0 overflow-hidden border border-[#10b981]/15 bg-[#0a1b14]/50 rounded-3xl shadow-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm font-bold text-red-400">❌ {error}</p>
            <button onClick={fetchFeeRecords} className="btn-primary text-xs !py-2 !px-4">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-emerald-100/50">
            No fee verification records matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#060e0a] text-white font-extrabold border-b border-[#10b981]/15 uppercase tracking-wider">
                  <th className="p-4">Student Info</th>
                  <th className="p-4">Fee Structure</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Fee Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10b981]/10 text-emerald-100">
                {filtered.map((student) => {
                  const id = student._id || student.id
                  const isPaid = student.isApproved
                  const grade = student.studentDetails?.grade || student.class || 'IX'
                  const stream = student.studentDetails?.stream || student.stream || 'Pre-Medical'

                  return (
                    <tr key={id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="p-4">
                        <p className="font-extrabold text-sm text-white">{student.fullName}</p>
                        <p className="text-[11px] text-emerald-100/50 flex items-center gap-1 mt-0.5">
                          <Phone size={10} className="text-emerald-400" /> {student.phone || 'N/A'}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-white">Grade {grade} ({stream})</span>
                        <p className="text-[11px] text-emerald-100/50 mt-0.5">One-Time Admission Fee</p>
                      </td>
                      <td className="p-4 font-extrabold text-emerald-400 text-sm">Rs. 6,000</td>
                      <td className="p-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/25">
                            <CheckCircle size={10} /> Paid & Portal Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25">
                            <XCircle size={10} /> Unpaid (Login Blocked)
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleFeeStatus(student)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isPaid
                                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold shadow-sm'
                            }`}
                          >
                            <UserCheck size={11} />
                            {isPaid ? 'Mark Unpaid' : 'Mark Paid & Approve'}
                          </button>

                          <button
                            onClick={() => setSelectedVoucher(student)}
                            className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold flex items-center gap-1"
                            title="Print Fee Voucher"
                          >
                            <Printer size={12} /> Voucher
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Voucher Preview Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div id="print-voucher" className="w-full max-w-2xl bg-white text-slate-900 border-2 border-amber-500 shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row relative">
            
            {/* Student Copy */}
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-dashed border-slate-300 bg-slate-50/50">
              <div className="text-center border-b border-slate-200 pb-3 space-y-1 mb-4">
                <img src="/images/logo.png" alt="Star Logo" className="h-10 w-10 mx-auto rounded-full border border-amber-500" />
                <h2 className="text-base font-black text-slate-800 leading-tight">
                  STAR EDUCATIONAL ACADEMY
                </h2>
                <p className="text-[9px] font-extrabold uppercase text-amber-600 tracking-widest">Student Copy</p>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-extrabold text-slate-800">{selectedVoucher.fullName}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Grade & Track:</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedVoucher.studentDetails?.grade || selectedVoucher.class || 'IX'} • {selectedVoucher.studentDetails?.stream || selectedVoucher.stream || 'Pre-Medical'}
                  </span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Fee Type:</span>
                  <span className="font-extrabold text-slate-800">One-Time Admission</span>
                </div>
                <div className="flex justify-between py-2 border-y border-slate-200 mt-2">
                  <span className="text-slate-800 font-bold uppercase">Total Amount:</span>
                  <span className="font-black text-emerald-600 text-sm">Rs. 6,000</span>
                </div>
                <div className="pt-8 flex justify-between items-end">
                  <div className="text-center">
                    <div className="w-24 border-b border-slate-400 mb-1"></div>
                    <span className="text-[9px] text-slate-400">Auth. Signature</span>
                  </div>
                  <div className="text-[9px] font-bold text-emerald-600">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Office Copy */}
            <div className="flex-1 p-6 bg-white relative">
              <div className="text-center border-b border-slate-200 pb-3 space-y-1 mb-4">
                <img src="/images/logo.png" alt="Star Logo" className="h-10 w-10 mx-auto rounded-full border border-amber-500" />
                <h2 className="text-base font-black text-slate-800 leading-tight">
                  STAR EDUCATIONAL ACADEMY
                </h2>
                <p className="text-[9px] font-extrabold uppercase text-amber-600 tracking-widest">Office / Bank Copy</p>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-extrabold text-slate-800">{selectedVoucher.fullName}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-extrabold text-slate-800">{selectedVoucher.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Grade:</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedVoucher.studentDetails?.grade || selectedVoucher.class || 'IX'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-y border-slate-200 mt-2">
                  <span className="text-slate-800 font-bold uppercase">Total Amount:</span>
                  <span className="font-black text-emerald-600 text-sm">Rs. 6,000</span>
                </div>
                <div className="pt-8 flex justify-between items-end">
                  <div className="text-center">
                    <div className="w-24 border-b border-slate-400 mb-1"></div>
                    <span className="text-[9px] text-slate-400">Stamp & Sign</span>
                  </div>
                  <div className="text-[10px] font-extrabold bg-slate-100 px-2.5 py-1 rounded text-slate-800">
                    {selectedVoucher.isApproved ? 'PAID' : 'UNPAID'}
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                <button onClick={() => setSelectedVoucher(null)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                  <XCircle size={14} />
                </button>
                <button onClick={() => window.print()} className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors" title="Print Copy">
                  <Printer size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
