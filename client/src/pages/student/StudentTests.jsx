import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Clock, HelpCircle, Star, ArrowRight, Calendar, Lock, ShieldAlert } from 'lucide-react'
import testService from '../../services/testService'

export default function StudentTests() {
  const [filterMode, setFilterMode] = useState('all')
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update clock every 5 seconds to ensure live updates to upcoming/expired states
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchBackendTests = async () => {
      setLoading(true)
      const res = await testService.getAvailableTests()
      if (res && res.success && res.data) {
        const formatted = res.data.map((t) => ({
          id: t._id,
          title: t.title,
          subject: t.subject,
          mode: t.mode || 'test',
          questionsCount: t.questions ? t.questions.length : 10,
          durationMinutes: t.durationMinutes || 30,
          totalMarks: t.totalMarks || 100,
          difficulty: 'Standard',
          startTime: t.startTime ? new Date(t.startTime) : null,
          endTime: t.endTime ? new Date(t.endTime) : null,
        }))
        setTests(formatted)
      }
      setLoading(false)
    }
    fetchBackendTests()
  }, [])

  const filtered = tests.filter((t) => {
    if (filterMode !== 'all' && t.mode !== filterMode) return false
    return true
  })

  // Format date helper
  const formatDateTime = (date) => {
    if (!date) return ''
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Online Practice & Timed Tests
        </h1>
        <p className="text-sm sm:text-base text-emerald-100/70 font-semibold mt-1.5 leading-relaxed">
          Select a test mode below. Timed Tests contribute to your performance analytics and have anti-cheat monitoring active.
        </p>
      </div>

      {/* Mode Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {[
          { key: 'all', label: 'All Tests' },
          { key: 'test', label: '⏱️ Timed Test Mode' },
          { key: 'practice', label: '💡 Untimed Practice Mode' }
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilterMode(btn.key)}
            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all border ${
              filterMode === btn.key
                ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'bg-[#0a1b14] text-emerald-100/70 border border-[#10b981]/15 hover:bg-[#10b981]/10 hover:text-emerald-400'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Test Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-emerald-100/50">Loading available tests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-glass !p-12 text-center space-y-4 border-2 border-dashed border-[#10b981]/15 bg-[#0a1b14]/30 rounded-3xl">
          <ClipboardCheck size={48} className="mx-auto text-emerald-400/30" />
          <div>
            <h3 className="text-lg font-black text-white">No Tests Found</h3>
            <p className="text-sm text-emerald-100/50 font-semibold mt-1">There are no tests matching the selected filter currently published.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((test) => {
            // Determine active/upcoming/expired status
            let testStatus = 'active'
            if (test.startTime && test.startTime > currentTime) {
              testStatus = 'upcoming'
            } else if (test.endTime && test.endTime < currentTime) {
              testStatus = 'expired'
            }

            // Define card visual accent colors and status labels
            let statusBadge = null
            let borderAccent = 'hover:border-emerald-400/30'
            let buttonEl = null

            if (testStatus === 'upcoming') {
              borderAccent = 'border-amber-500/20 hover:border-amber-500/40'
              statusBadge = (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Calendar size={11} /> Upcoming
                </span>
              )
              buttonEl = (
                <div className="w-full text-center py-3.5 px-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                  <Calendar size={13} />
                  <span>Available on: {formatDateTime(test.startTime)}</span>
                </div>
              )
            } else if (testStatus === 'expired') {
              borderAccent = 'border-red-500/10 hover:border-red-500/30'
              statusBadge = (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                  <ShieldAlert size={11} /> Expired / Closed
                </span>
              )
              buttonEl = (
                <button
                  disabled
                  className="w-full justify-center btn-primary text-xs !py-3.5 opacity-30 cursor-not-allowed flex items-center gap-2 !bg-red-950/20 !text-red-400/50 !border-red-500/10"
                >
                  <Lock size={12} />
                  <span>Closed</span>
                </button>
              )
            } else {
              // Active
              statusBadge = (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <Clock size={11} /> Available Now
                </span>
              )
              buttonEl = (
                <Link
                  to={`/dashboard/tests/${test.id}/attempt`}
                  className={`w-full justify-center ${test.mode === 'test' ? 'btn-primary shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'btn-gold shadow-[0_0_15px_rgba(245,158,11,0.2)]'} text-xs !py-3.5 flex items-center gap-2 font-black`}
                >
                  <span>{test.mode === 'test' ? 'Start Timed Test' : 'Start Practice Quiz'}</span>
                  <ArrowRight size={12} />
                </Link>
              )
            }

            return (
              <div 
                key={test.id} 
                className={`card-glass !p-6 flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15 transition-all duration-350 rounded-2xl ${borderAccent}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`badge ${test.mode === 'test' ? 'badge-emerald' : 'badge-gold'} text-[10px] font-extrabold`}>
                      {test.subject} • {test.mode === 'test' ? 'Exam' : 'Practice'}
                    </span>
                    {statusBadge}
                  </div>

                  <h3 className="font-extrabold text-lg sm:text-xl text-white mb-2 leading-snug">
                    {test.title}
                  </h3>

                  {/* Display Time Windows */}
                  <div className="space-y-1.5 mb-4 text-xs font-bold">
                    {test.startTime && (
                      <p className="text-emerald-100/60 flex items-center gap-1.5">
                        <Calendar size={13} className="text-amber-500 shrink-0" />
                        <span>Starts: <span className="text-emerald-100">{formatDateTime(test.startTime)}</span></span>
                      </p>
                    )}
                    {test.endTime && (
                      <p className={`${testStatus === 'expired' ? 'text-red-400/80' : 'text-emerald-100/60'} flex items-center gap-1.5`}>
                        <Clock size={13} className="text-amber-500 shrink-0" />
                        <span>Closes: <span className={testStatus === 'expired' ? 'text-red-400' : 'text-emerald-100'}>{formatDateTime(test.endTime)}</span></span>
                      </p>
                    )}
                    {!test.startTime && !test.endTime && (
                      <p className="text-emerald-100/40 flex items-center gap-1.5 italic font-semibold">
                        <Clock size={13} className="shrink-0" /> No time restrictions
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#08140f]/60 border border-[#10b981]/10 text-xs font-semibold text-emerald-100 mb-5">
                    <div className="text-center">
                      <p className="text-[9px] text-emerald-100/50 uppercase tracking-wider">Questions</p>
                      <p className="font-black text-sm text-white mt-0.5">{test.questionsCount}</p>
                    </div>
                    <div className="text-center border-x border-[#10b981]/10">
                      <p className="text-[9px] text-emerald-100/50 uppercase tracking-wider">Time</p>
                      <p className="font-black text-sm text-white mt-0.5">{test.mode === 'test' ? `${test.durationMinutes} m` : '∞'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-emerald-100/50 uppercase tracking-wider">Max Marks</p>
                      <p className="font-black text-sm text-white mt-0.5">{test.totalMarks}</p>
                    </div>
                  </div>
                </div>

                <div>
                  {buttonEl}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
