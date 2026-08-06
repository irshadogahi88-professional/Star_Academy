import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Clock, HelpCircle, Star, ArrowRight } from 'lucide-react'
import testService from '../../services/testService'

export default function StudentTests() {
  const [filterMode, setFilterMode] = useState('all')
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

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
          status: 'available',
          endTime: t.endTime,
          startTime: t.startTime,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">
          Online Practice & Timed Tests
        </h1>
        <p className="text-sm text-emerald-100/70 font-semibold mt-1">
          Select a test mode below. Timed Tests contribute to your performance analytics and have blur/tab switch monitoring.
        </p>
      </div>

      {/* Mode Filters */}
      <div className="flex flex-wrap gap-2">
        {[{ key: 'all', label: 'All Tests' }, { key: 'test', label: '⏱️ Timed Test Mode' }, { key: 'practice', label: '💡 Untimed Practice Mode' }].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setFilterMode(btn.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
              filterMode === btn.key
                ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-sm'
                : 'bg-[#0a1b14] text-emerald-100/70 border border-[#10b981]/15 hover:bg-[#10b981]/10 hover:text-emerald-400'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Test Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((test) => (
          <div key={test.id} className="card-glass !p-6 flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/30 transition-all rounded-2xl">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`badge ${test.mode === 'test' ? 'badge-emerald' : 'badge-gold'} text-xs`}>
                  {test.subject} • {test.mode === 'test' ? 'Timed Test' : 'Practice'}
                </span>
                <span className="text-xs font-extrabold text-amber-500">{test.difficulty}</span>
              </div>

              <h3 className="font-extrabold text-xl text-white mb-1 leading-snug">
                {test.title}
              </h3>
              
              {test.endTime && (
                <p className="text-[11px] font-bold text-red-400 mb-3 flex items-center gap-1">
                  <Clock size={12} /> Due: {new Date(test.endTime).toLocaleString()}
                </p>
              )}
              {!test.endTime && <div className="mb-3"></div>}

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#08140f]/60 border border-[#10b981]/10 text-xs font-semibold text-emerald-100 mb-4">
                <div className="text-center">
                  <p className="text-[10px] text-emerald-100/50 uppercase">Questions</p>
                  <p className="font-bold text-sm text-white mt-0.5">{test.questionsCount}</p>
                </div>
                <div className="text-center border-x border-[#10b981]/10">
                  <p className="text-[10px] text-emerald-100/50 uppercase">Time</p>
                  <p className="font-bold text-sm text-white mt-0.5">{test.mode === 'test' ? `${test.durationMinutes} m` : '∞'}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-emerald-100/50 uppercase">Max Marks</p>
                  <p className="font-bold text-sm text-white mt-0.5">{test.totalMarks}</p>
                </div>
              </div>
            </div>

            <Link
              to={`/dashboard/tests/${test.id}/attempt`}
              className={`w-full justify-center ${test.mode === 'test' ? 'btn-primary' : 'btn-gold'} text-xs !py-3`}
            >
              <span>{test.mode === 'test' ? 'Start Timed Test' : 'Start Practice Quiz'}</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
