import { useState, useEffect } from 'react'
import { BarChart3, Search, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react'
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
    <div className="space-y-6 text-emerald-100">
      {/* Header */}
      <div>
        <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <BarChart3 size={12} /> Student Exam Performance
        </span>
        <h1 className="text-3xl font-black text-white mt-1">
          Class Exam Submissions
        </h1>
        <p className="text-xs text-emerald-100/70 font-semibold">Inspect scores, pass/fail status, and anti-cheat tab-switch warning metrics.</p>
      </div>

      {/* Filter Bar */}
      <div className="card-glass !p-4 bg-[#0a1b14]/50 border border-[#10b981]/15 flex flex-col sm:flex-row items-center gap-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or test title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-emerald-100 text-xs font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-400 focus:outline-none w-full sm:w-auto"
        >
          <option value="All">All Subjects</option>
          <option value="Physics">Physics</option>
          <option value="Chemistry">Chemistry</option>
          <option value="Biology">Biology</option>
          <option value="Mathematics">Mathematics</option>
          <option value="English">English</option>
          <option value="LR">Logical Reasoning (LR)</option>
          <option value="Computer Science">Computer Science</option>
          <option value="General">General</option>
          <option value="MDCAT Mock">MDCAT Mock</option>
          <option value="ECAT Mock">ECAT Mock</option>
        </select>
      </div>

      {/* Results Table */}
      <div className="card-glass !p-0 overflow-hidden border border-[#10b981]/15 bg-[#0a1b14]/50 rounded-3xl shadow-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-12 text-center font-bold text-red-400 bg-red-500/10 border border-red-500/25">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-emerald-100/50">No results found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#060e0a] text-white text-xs font-extrabold uppercase tracking-wider border-b border-[#10b981]/15">
                  <th className="p-4">Student</th>
                  <th className="p-4">Examination</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Anti-Cheat Flags</th>
                  <th className="p-4">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#10b981]/10 text-xs font-semibold text-emerald-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold flex-shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="font-extrabold text-white">{item.studentName}</p>
                          <p className="text-[11px] text-emerald-100/50">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-white">{item.testTitle}</p>
                      <span className="badge badge-emerald text-[10px] py-0.5 mt-1 block w-max">{item.subject}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-sm text-white">{item.score} / {item.totalMarks}</p>
                      <p className="text-[11px] text-emerald-100/50">{item.percentage}% Score</p>
                    </td>
                    <td className="p-4">
                      {item.passed ? (
                        <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full text-[11px]">
                          <CheckCircle size={12} /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-extrabold text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full text-[11px]">
                          <XCircle size={12} /> Failed
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {item.tabSwitches > 0 ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full text-[11px]">
                          <AlertTriangle size={12} /> {item.tabSwitches} Tab Switch(es)
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-extrabold text-[11px] flex items-center gap-1">
                          <CheckCircle size={12} /> Clean Attempt
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-emerald-100/50">{item.submittedAt}</td>
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
