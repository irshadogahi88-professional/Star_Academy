import { useState, useEffect } from 'react'
import { FaUsers, FaSearch, FaCheckCircle, FaExclamationTriangle, FaKey, FaTrashAlt, FaPhoneAlt, FaEnvelope, FaDownload, FaSyncAlt } from 'react-icons/fa'
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
    <div className="space-y-6">
      {/* Header with Export CSV Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1">
            <FaUsers size={12} /> Student Governance
          </span>
          <h1 className="text-3xl font-black text-emerald-dark mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
            Student Roster & Verification
          </h1>
          <p className="text-xs text-charcoal-light">Manage student enrollments, approve portal logins, and export student rosters.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchStudents} className="p-2.5 rounded-xl border border-sage hover:bg-cream-alt text-emerald-dark text-xs font-bold flex items-center gap-1.5" title="Refresh List">
            <FaSyncAlt size={12} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button onClick={handleExportCSV} className="btn-gold text-xs !py-2.5 !px-5 shadow-md">
            <FaDownload size={13} />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4! flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-light/60" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sage text-xs font-semibold focus:outline-none focus:border-emerald-primary bg-white text-charcoal"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-sage text-xs font-bold text-emerald-dark focus:outline-none bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Approval</option>
          </select>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-sage text-xs font-bold text-emerald-dark focus:outline-none bg-white"
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
      <div className="card p-0! overflow-hidden border border-sage">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm font-bold text-red-600">❌ {error}</p>
            <button onClick={fetchStudents} className="btn-primary text-xs !py-2 !px-4">Try Again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-charcoal-light">
            No student records matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-deepest text-white text-xs font-extrabold uppercase tracking-wider">
                  <th className="p-4">Student Info</th>
                  <th className="p-4">Grade & Stream</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage text-xs font-semibold">
                {filtered.map((student) => {
                  const id = student._id || student.id
                  const isApproved = student.isApproved
                  const grade = student.studentDetails?.grade || student.class || 'N/A'
                  const stream = student.studentDetails?.stream || student.stream || 'Pre-Medical'
                  const dateStr = student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Recent'

                  return (
                    <tr key={id} className="hover:bg-cream-alt/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gold text-emerald-dark font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {student.fullName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-emerald-dark">{student.fullName}</p>
                            <p className="text-[11px] text-charcoal-light flex items-center gap-1">
                              <FaEnvelope size={10} /> {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-emerald-dark">Grade {grade}</span>
                        <p className="text-[11px] text-charcoal-light capitalize">{stream}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-emerald-dark flex items-center gap-1">
                          <FaPhoneAlt size={10} className="text-emerald-primary" /> {student.phone || 'N/A'}
                        </p>
                        <p className="text-[10px] text-charcoal-light">Joined {dateStr}</p>
                      </td>
                      <td className="p-4">
                        {isApproved ? (
                          <div className="flex flex-col gap-2">
                            <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-[11px] w-fit">
                              <FaCheckCircle size={10} /> Approved
                            </span>
                            <select 
                              className="text-[10px] bg-white border border-sage rounded px-1 py-0.5 text-charcoal outline-none cursor-pointer w-fit"
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
                          <span className="inline-flex items-center gap-1 font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full text-[11px]">
                            <FaExclamationTriangle size={10} /> Pending Approval
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleApproval(student)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isApproved
                                ? 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            }`}
                          >
                            {isApproved ? 'Revoke' : 'Approve'}
                          </button>

                          <button
                            onClick={() => setResetModalUser(student)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-bold"
                            title="Reset Password"
                          >
                            <FaKey size={12} />
                          </button>

                          <button
                            onClick={() => handleDeleteStudent(id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-bold"
                            title="Remove Student"
                          >
                            <FaTrashAlt size={12} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-md p-6! space-y-4 bg-white">
            <h2 className="text-xl font-bold text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>
              Reset Account Password
            </h2>
            <p className="text-xs text-charcoal-light">
              Administrative password override for student <strong className="text-emerald-dark">{resetModalUser.fullName}</strong> ({resetModalUser.email}).
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-dark mb-1.5">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full px-4 py-3 rounded-xl border border-sage text-sm focus:outline-none focus:border-emerald-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 rounded-xl border border-sage text-xs font-bold text-charcoal-light"
                >
                  Cancel
                </button>
                <button type="submit" disabled={resetSubmitting} className="btn-primary text-xs py-2! px-4!">
                  <span>{resetSubmitting ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>

              {resetSuccess && (
                <div className="p-3 rounded-xl text-xs font-bold text-center bg-emerald-500/10 text-emerald-800 border border-emerald-500/30">
                  ✅ Password successfully updated!
                </div>
              )}
              {resetError && (
                <div className="p-3 rounded-xl text-xs font-bold text-center bg-red-500/10 text-red-800 border border-red-500/30">
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
