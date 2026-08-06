import { useState, useEffect } from 'react'
import { FaChartBar, FaSearch, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaUserGraduate } from 'react-icons/fa'
import api from '../../services/api'

export default function TeacherResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/attempts/all')
        if (response.data.success) {
          const formattedResults = response.data.data.map(sub => ({
            id: sub._id,
            studentName: sub.student?.fullName || 'Unknown Student',
            email: sub.student?.email || 'No Email',
            testTitle: sub.test?.title || 'Unknown Test',
            subject: sub.test?.subject || 'General',
            score: sub.score,
            totalMarks: sub.test?.maxScore || 100,
            percentage: sub.percentage,
            passed: sub.passed,
            tabSwitches: sub.tabSwitches || 0,
            submittedAt: new Date(sub.createdAt).toLocaleString(),
          }))
          setResults(formattedResults)
        }
      } catch (err) {
        setError('Failed to load class results.')
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [])

  const filtered = results.filter((r) => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || r.testTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === 'All' || r.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1">
          <FaChartBar size={12} /> Student Exam Performance
        </span>
        <h1 className="text-3xl font-black text-[#0E4429] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
          Class Exam Submissions
        </h1>
        <p className="text-xs text-[#3a4a40]">Inspect scores, pass/fail status, and anti-cheat tab-switch warning metrics.</p>
      </div>

      {/* Filter Bar */}
      <div className="card !p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a4a40]/60" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or test title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE8DD] text-xs font-semibold focus:outline-none focus:border-[#147a4a]"
          />
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl border border-[#DCE8DD] text-xs font-bold text-[#0E4429] focus:outline-none w-full sm:w-auto"
        >
          <option value="All">All Subjects</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
          <option value="Mathematics">Mathematics</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="card !p-0 overflow-hidden border border-[#DCE8DD]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#147a4a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-12 text-center font-bold text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-[#3a4a40]">No results found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0E4429] text-white text-xs font-extrabold uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Examination</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Anti-Cheat Flags</th>
                  <th className="p-4">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE8DD] text-xs font-semibold">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F1ECE0]/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#147a4a]/10 text-[#147a4a] flex items-center justify-center font-bold flex-shrink-0">
                          <FaUserGraduate size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-[#0E4429]">{item.studentName}</p>
                          <p className="text-[11px] text-[#3a4a40]">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#0E4429]">{item.testTitle}</p>
                      <span className="badge badge-emerald text-[10px] py-0.5 mt-1 block w-max">{item.subject}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-sm text-[#0E4429]">{item.score} / {item.totalMarks}</p>
                      <p className="text-[11px] text-[#3a4a40]">{item.percentage}% Score</p>
                    </td>
                    <td className="p-4">
                      {item.passed ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-[11px]">
                          <FaCheckCircle /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-extrabold text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-[11px]">
                          <FaTimesCircle /> Failed
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {item.tabSwitches > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full text-[11px]">
                          <FaExclamationTriangle /> {item.tabSwitches} Tab Switch(es)
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">Clean Attempt</span>
                      )}
                    </td>
                    <td className="p-4 text-[#3a4a40]">{item.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
