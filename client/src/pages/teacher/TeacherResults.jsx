import { useState, useEffect } from 'react'
import { BarChart3, Search, CheckCircle, XCircle, AlertTriangle, User, ArrowLeft, Download, FileSpreadsheet } from 'lucide-react'
import api from '../../services/api'

export default function TeacherResults() {
  const [tests, setTests] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [selectedTestId, setSelectedTestId] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [testsRes, attemptsRes] = await Promise.all([
          api.get('/tests'),
          api.get('/attempts/all')
        ])
        
        let allTests = []
        if (testsRes.data.success) {
          allTests = testsRes.data.data || testsRes.data.tests || []
        }
        
        let allAttempts = []
        if (attemptsRes.data.success) {
          allAttempts = attemptsRes.data.data.map(sub => ({
            id: sub._id,
            studentName: sub.student?.fullName || 'Unknown Student',
            email: sub.student?.email || 'No Email',
            testId: sub.test?._id || sub.test?.id || 'Unknown Test ID',
            testTitle: sub.test?.title || 'Unknown Test',
            subject: sub.test?.subject || 'General',
            score: sub.score,
            totalMarks: sub.test?.totalMarks || 100,
            percentage: sub.percentage,
            passed: sub.passed,
            tabSwitches: sub.tabSwitches || 0,
            submittedAt: new Date(sub.createdAt).toLocaleString(),
          }))
        }
        
        // Group attempts by test
        const testAttemptCounts = {}
        allAttempts.forEach(att => {
          testAttemptCounts[att.testId] = (testAttemptCounts[att.testId] || 0) + 1
        })
        
        // Ensure any test referenced by attempts exists in tests list
        const existingTestIds = new Set(allTests.map(t => t._id))
        allAttempts.forEach(att => {
          if (att.testId && !existingTestIds.has(att.testId)) {
            allTests.push({
              _id: att.testId,
              title: att.testTitle,
              subject: att.subject,
              grade: 'N/A',
              durationMinutes: 'N/A',
              attemptCount: 0
            })
            existingTestIds.add(att.testId)
          }
        })

        const testsWithCounts = allTests.map(t => ({
          ...t,
          attemptCount: testAttemptCounts[t._id] || 0
        }))
        
        setTests(testsWithCounts)
        setAttempts(allAttempts)
      } catch (err) {
        setError('Failed to load class results.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleExportCSV = (test) => {
    const testAttempts = attempts.filter(att => att.testId === test._id)
    if (testAttempts.length === 0) return alert('No attempts to export.')
    
    // CSV headers
    const headers = ['Student Name', 'Email Address', 'Score', 'Total Marks', 'Percentage (%)', 'Status', 'Tab Switches', 'Submitted At']
    
    // CSV rows
    const rows = testAttempts.map(att => [
      `"${att.studentName.replace(/"/g, '""')}"`,
      `"${att.email.replace(/"/g, '""')}"`,
      att.score,
      att.totalMarks,
      `${att.percentage}%`,
      att.passed ? 'Passed' : 'Failed',
      att.tabSwitches,
      `"${att.submittedAt}"`
    ])
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    const sanitizedTitle = test.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    link.setAttribute('download', `${sanitizedTitle}_attempts.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter tests list
  const filteredTests = tests.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === 'All' || t.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  // Selected test & attempts
  const selectedTest = tests.find(t => t._id === selectedTestId)
  const selectedAttempts = selectedTest ? attempts.filter(att => att.testId === selectedTest._id) : []

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Header */}
      <div>
        <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <BarChart3 size={12} /> Student Exam Performance
        </span>
        <h1 className="text-3xl font-black text-white mt-1">
          {selectedTest ? 'Test Results Detail' : 'Class Exam Results'}
        </h1>
        <p className="text-xs text-emerald-100/70 font-semibold">
          {selectedTest 
            ? `Viewing results for "${selectedTest.title}"`
            : 'Select an examination from the list below to inspect individual student attempts and export scores.'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-12 text-center font-bold text-red-400 bg-red-500/10 border border-red-500/25 rounded-2xl">{error}</div>
      ) : selectedTest ? (
        /* Selected Test Detail View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a1b14]/30 p-5 rounded-2xl border border-[#10b981]/15">
            <button
              onClick={() => setSelectedTestId(null)}
              className="flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Tests List
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleExportCSV(selectedTest)}
                disabled={selectedAttempts.length === 0}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Download size={14} />
                <span>Export to CSV</span>
              </button>
            </div>
          </div>

          <div className="card-glass !p-0 overflow-hidden border border-[#10b981]/15 bg-[#0a1b14]/50 rounded-3xl shadow-2xl">
            <div className="p-5 border-b border-[#10b981]/15 bg-[#060e0a]">
              <h3 className="font-extrabold text-white text-base">{selectedTest.title}</h3>
              <p className="text-xs text-emerald-100/50 mt-1 uppercase font-black">{selectedTest.subject} • {selectedAttempts.length} Attempts recorded</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#060e0a] text-white text-xs font-extrabold uppercase tracking-wider border-b border-[#10b981]/15">
                    <th className="p-4">Student</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Percentage</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Cheat Detections</th>
                    <th className="p-4">Date Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#10b981]/10 text-xs font-semibold text-emerald-100">
                  {selectedAttempts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-emerald-100/50">No students have attempted this test yet.</td>
                    </tr>
                  ) : (
                    selectedAttempts.map((item) => (
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
                        <td className="p-4 font-black text-sm text-white">
                          {item.score} / {item.totalMarks}
                        </td>
                        <td className="p-4 font-black text-emerald-400">
                          {item.percentage}%
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Grid of Tests View */
        <div className="space-y-6">
          {/* Filters */}
          <div className="card-glass !p-4 bg-[#0a1b14]/50 border border-[#10b981]/15 flex flex-col sm:flex-row items-center gap-4 rounded-2xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search examinations by title..."
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

          {/* Grid Layout */}
          {filteredTests.length === 0 ? (
            <div className="card-glass p-12 text-center text-xs font-bold text-emerald-100/50 rounded-3xl border border-[#10b981]/15 bg-[#0a1b14]/50">No examinations found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTests.map((test) => (
                <div 
                  key={test._id} 
                  className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 p-6 rounded-3xl flex flex-col justify-between hover:border-emerald-500/30 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge badge-emerald text-[10px] py-0.5 font-bold uppercase tracking-wider">{test.subject}</span>
                      <span className="text-[10px] text-emerald-100/50 font-bold uppercase">Grade {test.grade || '11'}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 min-h-[3rem]">{test.title}</h3>
                    <p className="text-xs text-emerald-100/60 font-semibold mt-1">{test.questions?.length || 0} Questions • {test.durationMinutes} Minutes Limit</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#10b981]/10">
                    <span className="text-xs font-bold text-emerald-100/70 bg-[#060e0a]/40 border border-[#10b981]/15 px-3 py-1 rounded-full">
                      {test.attemptCount} Attempt(s)
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTestId(test._id)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold text-xs transition-all shadow-sm"
                      >
                        View Attempts
                      </button>
                      <button
                        onClick={() => handleExportCSV(test)}
                        disabled={test.attemptCount === 0}
                        title="Download CSV"
                        className="p-2 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-emerald-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FileSpreadsheet size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
