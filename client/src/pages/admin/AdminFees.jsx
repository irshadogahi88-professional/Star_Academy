import { useState, useEffect } from 'react'
import { FaReceipt, FaSearch, FaCheckCircle, FaTimesCircle, FaPrint, FaPhoneAlt, FaUserCheck, FaSyncAlt } from 'react-icons/fa'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1">
            <FaReceipt size={12} /> Fee & Admission Approval
          </span>
          <h1 className="text-3xl font-black text-emerald-dark mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
            One-Time Admission Fee Verification
          </h1>
          <p className="text-xs text-charcoal-light">Mark admission fees as paid to automatically approve student portal accounts.</p>
        </div>

        <button onClick={fetchFeeRecords} className="p-2.5 rounded-xl border border-sage hover:bg-cream-alt text-emerald-dark text-xs font-bold flex items-center gap-1.5 self-start sm:self-center" title="Refresh Fees List">
          <FaSyncAlt size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4! flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-light/60" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sage text-xs font-semibold focus:outline-none focus:border-emerald-primary bg-white text-charcoal"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-sage text-xs font-bold text-emerald-dark focus:outline-none w-full sm:w-auto bg-white"
        >
          <option value="All">All Payment Statuses</option>
          <option value="Paid">Paid & Approved</option>
          <option value="Unpaid">Unpaid (Pending Approval)</option>
        </select>
      </div>

      {/* Fee Table */}
      <div className="card p-0! overflow-hidden border border-sage">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm font-bold text-red-600">❌ {error}</p>
            <button onClick={fetchFeeRecords} className="btn-primary text-xs !py-2 !px-4">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-charcoal-light">
            No fee verification records matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-deepest text-white text-xs font-extrabold uppercase tracking-wider">
                  <th className="p-4">Student Info</th>
                  <th className="p-4">Fee Structure</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Fee Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage text-xs font-semibold">
                {filtered.map((student) => {
                  const id = student._id || student.id
                  const isPaid = student.isApproved
                  const grade = student.studentDetails?.grade || student.class || 'IX'
                  const stream = student.studentDetails?.stream || student.stream || 'Pre-Medical'

                  return (
                    <tr key={id} className="hover:bg-cream-alt/40 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-sm text-emerald-dark">{student.fullName}</p>
                        <p className="text-[11px] text-charcoal-light flex items-center gap-1">
                          <FaPhoneAlt size={10} className="text-emerald-primary" /> {student.phone || 'N/A'}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-emerald-dark">Grade {grade} ({stream})</span>
                        <p className="text-[11px] text-charcoal-light">One-Time Admission Fee</p>
                      </td>
                      <td className="p-4 font-extrabold text-emerald-primary text-sm">Rs. 6,000</td>
                      <td className="p-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-[11px]">
                            <FaCheckCircle size={10} /> Paid & Portal Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full text-[11px]">
                            <FaTimesCircle size={10} /> Unpaid (Login Blocked)
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleFeeStatus(student)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              isPaid
                                ? 'bg-amber-500/10 text-amber-800 hover:bg-amber-500/20'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            }`}
                          >
                            <FaUserCheck size={11} />
                            {isPaid ? 'Mark Unpaid' : 'Mark Paid & Approve'}
                          </button>

                          <button
                            onClick={() => setSelectedVoucher(student)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-bold flex items-center gap-1"
                            title="Print Fee Voucher"
                          >
                            <FaPrint size={12} /> Voucher
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div id="print-voucher" className="card w-full max-w-2xl p-0! bg-white border-2 border-gold shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Student Copy */}
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-dashed border-sage/80 bg-[#FBF8F1]">
              <div className="text-center border-b border-sage/60 pb-3 space-y-1 mb-4">
                <img src="/images/logo.png" alt="Star Logo" className="h-10 w-10 mx-auto rounded-full border border-gold" />
                <h2 className="text-lg font-black text-emerald-dark leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  STAR EDUCATIONAL ACADEMY
                </h2>
                <p className="text-[9px] font-extrabold uppercase text-gold-dark tracking-widest">Student Copy</p>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between pb-1 border-b border-sage/30">
                  <span className="text-charcoal-light">Name:</span>
                  <span className="font-extrabold text-emerald-dark">{selectedVoucher.fullName}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-sage/30">
                  <span className="text-charcoal-light">Grade & Track:</span>
                  <span className="font-extrabold text-emerald-dark">
                    {selectedVoucher.studentDetails?.grade || selectedVoucher.class || 'IX'} • {selectedVoucher.studentDetails?.stream || selectedVoucher.stream || 'Pre-Medical'}
                  </span>
                </div>
                <div className="flex justify-between pb-1 border-b border-sage/30">
                  <span className="text-charcoal-light">Fee Type:</span>
                  <span className="font-extrabold text-emerald-dark">One-Time Admission</span>
                </div>
                <div className="flex justify-between py-2 border-y border-sage mt-2">
                  <span className="text-charcoal font-bold uppercase">Total Amount:</span>
                  <span className="font-black text-emerald-primary text-sm">Rs. 6,000</span>
                </div>
                <div className="pt-8 flex justify-between items-end">
                  <div className="text-center">
                    <div className="w-24 border-b border-charcoal-light mb-1"></div>
                    <span className="text-[9px] text-charcoal-light">Auth. Signature</span>
                  </div>
                  <div className="text-[9px] font-bold text-emerald-primary">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Office Copy */}
            <div className="flex-1 p-6 bg-white relative">
              <div className="text-center border-b border-sage/60 pb-3 space-y-1 mb-4">
                <img src="/images/logo.png" alt="Star Logo" className="h-10 w-10 mx-auto rounded-full border border-gold" />
                <h2 className="text-lg font-black text-emerald-dark leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  STAR EDUCATIONAL ACADEMY
                </h2>
                <p className="text-[9px] font-extrabold uppercase text-gold-dark tracking-widest">Office / Bank Copy</p>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between pb-1 border-b border-sage/30">
                  <span className="text-charcoal-light">Name:</span>
                  <span className="font-extrabold text-emerald-dark">{selectedVoucher.fullName}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-sage/30">
                  <span className="text-charcoal-light">Phone:</span>
                  <span className="font-extrabold text-emerald-dark">{selectedVoucher.phone}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-sage/30">
                  <span className="text-charcoal-light">Grade:</span>
                  <span className="font-extrabold text-emerald-dark">
                    {selectedVoucher.studentDetails?.grade || selectedVoucher.class || 'IX'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-y border-sage mt-2">
                  <span className="text-charcoal font-bold uppercase">Total Amount:</span>
                  <span className="font-black text-emerald-primary text-sm">Rs. 6,000</span>
                </div>
                <div className="pt-8 flex justify-between items-end">
                  <div className="text-center">
                    <div className="w-24 border-b border-charcoal-light mb-1"></div>
                    <span className="text-[9px] text-charcoal-light">Stamp & Sign</span>
                  </div>
                  <div className="text-[10px] font-extrabold bg-sage/50 px-2 py-1 rounded text-emerald-dark">
                    {selectedVoucher.isApproved ? 'PAID' : 'UNPAID'}
                  </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                <button onClick={() => setSelectedVoucher(null)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                  <FaTimesCircle size={14} />
                </button>
                <button onClick={() => window.print()} className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors" title="Print Copy">
                  <FaPrint size={14} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
