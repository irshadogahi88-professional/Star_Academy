import { useState, useEffect } from 'react'
import { Users, Search, CheckCircle, AlertTriangle, Key, Trash2, Phone, Mail, Download, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import { adminService } from '../../services/adminService'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [classFilter, setClassFilter] = useState('All')

  // Password reset modal state
  const [resetModalUser, setResetModalUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState(null)
  const [resetSubmitting, setResetSubmitting] = useState(false)

  const fetchStudents = async () => {
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
      console.error('Failed to fetch students:', err)
      setError(err.response?.data?.message || 'Failed to load students from database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filtered = students.filter((s) => {
    const fullName = s.fullName || ''
    const email = s.email || ''
    const phone = s.phone || ''
    const grade = s.studentDetails?.grade || s.grade || ''

    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'approved' && s.isApproved) ||
      (statusFilter === 'pending' && !s.isApproved)

    const matchesClass = classFilter === 'All' || grade === classFilter

    return matchesSearch && matchesStatus && matchesClass
  })

  // Toggle student approval status via Backend API
  const handleToggleApproval = async (student) => {
    try {
      const newApprovedStatus = !student.isApproved
      await adminService.updateStudentStatus(student._id || student.id, { isApproved: newApprovedStatus })
      // Update local list
      setStudents(
        students.map((s) => ((s._id || s.id) === (student._id || student.id) ? { ...s, isApproved: newApprovedStatus } : s))
      )
    } catch (err) {
      alert('Failed to update student approval status: ' + (err.response?.data?.message || err.message))
    }
  }

  // Handle assigning a new role
  const handleAssignRole = async (studentId, role) => {
    if (!window.confirm(`Are you sure you want to make this user a ${role}?`)) return
    try {
      await adminService.assignRole(studentId, role)
      setStudents(students.filter((s) => (s._id || s.id) !== studentId)) // Remove from student view
      alert(`User is now a ${role}`)
    } catch (err) {
      alert('Failed to assign role: ' + (err.response?.data?.message || err.message))
    }
  }

  // Delete student account
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student account?')) return
    try {
      await api.delete(`/admin/students/${studentId}`)
      setStudents(students.filter((s) => (s._id || s.id) !== studentId))
    } catch (err) {
      // If endpoint not specific, fall back to patch deactivation
      try {
        await adminService.updateStudentStatus(studentId, { isActive: false })
        setStudents(students.filter((s) => (s._id || s.id) !== studentId))
      } catch (e) {
        alert('Failed to delete student: ' + (e.response?.data?.message || e.message))
      }
    }
  }

  // Handle Administrative Password Reset
  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) return
    setResetSubmitting(true)
    setResetError(null)

    try {
      const studentId = resetModalUser._id || resetModalUser.id
      await adminService.resetStudentPassword(studentId, newPassword)
      setResetSuccess(true)
      setTimeout(() => {
        setResetSuccess(false)
        setResetModalUser(null)
        setNewPassword('')
      }, 2000)
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setResetSubmitting(false)
    }
  }

  // Download CSV Roster File
  const handleExportCSV = () => {
    if (students.length === 0) {
      alert('No student records available to export.')
      return
    }

    const headers = ['Full Name', 'Email', 'Phone', 'Grade', 'Stream', 'Approval Status', 'Joined Date']
    const rows = filtered.map((s) => [
      s.fullName || '',
      s.email || '',
      s.phone || '',
      s.studentDetails?.grade || s.class || '',
      s.studentDetails?.stream || s.stream || '',
      s.isApproved ? 'Approved' : 'Pending',
      s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '',
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `star_academy_students_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Header with Export CSV Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Users size={12} /> Student Governance
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Student Roster & Verification
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">Manage student enrollments, approve portal logins, and export student rosters.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchStudents} className="p-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 hover:bg-[#0a1b14] text-emerald-400 text-xs font-bold flex items-center gap-1.5" title="Refresh List">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button onClick={handleExportCSV} className="btn-gold text-xs !py-2.5 !px-5 shadow-md flex items-center gap-2">
            <Download size={13} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl !p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none"
          >
            <option value="All">All Grades</option>
            <option value="9">Grade IX</option>
            <option value="10">Grade X</option>
            <option value="11">Grade XI</option>
            <option value="12">Grade XII</option>
          </select>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="card-glass !p-0 overflow-hidden border border-[#10b981]/15 bg-[#0a1b14]/50 rounded-3xl shadow-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm font-bold text-red-400">❌ {error}</p>
            <button onClick={fetchStudents} className="btn-primary text-xs !py-2 !px-4">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-emerald-100/50">
            No student records matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#060e0a] text-white font-extrabold border-b border-[#10b981]/15 uppercase tracking-wider">
                  <th className="p-4">Student Info</th>
                  <th className="p-4">Grade & Stream</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10b981]/10 text-emerald-100">
                {filtered.map((student) => {
                  const id = student._id || student.id
                  const isApproved = student.isApproved
                  const grade = student.studentDetails?.grade || student.class || 'N/A'
                  const stream = student.studentDetails?.stream || student.stream || 'Pre-Medical'
                  const dateStr = student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Recent'

                  return (
                    <tr key={id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#060e0a] border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {student.fullName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-white">{student.fullName}</p>
                            <p className="text-[11px] text-emerald-100/50 flex items-center gap-1 mt-0.5">
                              <Mail size={10} /> {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-white">Grade {grade}</span>
                        <p className="text-[11px] text-emerald-400 capitalize mt-0.5">{stream}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-white flex items-center gap-1 font-bold">
                          <Phone size={10} className="text-emerald-400" /> {student.phone || 'N/A'}
                        </p>
                        <p className="text-[10px] text-emerald-100/50 mt-0.5">Joined {dateStr}</p>
                      </td>
                      <td className="p-4">
                        {isApproved ? (
                          <div className="flex flex-col gap-2">
                            <span className="inline-flex items-center gap-1 font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] w-fit border border-emerald-500/25">
                              <CheckCircle size={10} /> Approved
                            </span>
                            <select 
                              className="text-[10px] bg-[#060e0a] border border-[#10b981]/25 text-emerald-100 rounded px-1.5 py-0.5 outline-none cursor-pointer w-fit"
                              onChange={(e) => handleAssignRole(id, e.target.value)}
                              value="student"
                            >
                              <option value="student">Student (Current)</option>
                              <option value="teacher">Make Teacher</option>
                              <option value="clerk">Make Clerk</option>
                              <option value="admin">Make Admin</option>
                            </select>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full text-[11px] border border-amber-500/25">
                            <AlertTriangle size={10} /> Pending Approval
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleApproval(student)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isApproved
                                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold shadow-sm'
                            }`}
                          >
                            {isApproved ? 'Revoke' : 'Approve'}
                          </button>

                          <button
                            onClick={() => setResetModalUser(student)}
                            className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-xs font-bold"
                            title="Reset Password"
                          >
                            <Key size={12} />
                          </button>

                          <button
                            onClick={() => handleDeleteStudent(id)}
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold"
                            title="Remove Student"
                          >
                            <Trash2 size={12} />
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

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-md !p-6 space-y-4 bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl">
            <h2 className="text-xl font-black text-white">
              Reset Account Password
            </h2>
            <p className="text-xs text-emerald-100/70 font-semibold">
              Administrative password override for student <strong className="text-emerald-400">{resetModalUser.fullName}</strong> ({resetModalUser.email}).
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-100/70 hover:bg-[#0a1b14]"
                >
                  Cancel
                </button>
                <button type="submit" disabled={resetSubmitting} className="btn-primary text-xs !py-2 !px-5 shadow-sm">
                  <span>{resetSubmitting ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>

              {resetSuccess && (
                <div className="p-3 rounded-xl text-xs font-bold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  ✅ Password successfully updated!
                </div>
              )}
              {resetError && (
                <div className="p-3 rounded-xl text-xs font-bold text-center bg-red-500/10 text-red-400 border border-red-500/25">
                  ❌ {resetError}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
