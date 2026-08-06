import { useState, useEffect } from 'react'
import { TrendingUp, Trophy, Lightbulb, CheckCircle, Target, Flame } from 'lucide-react'
import api from '../../services/api'

const subjectColors = {
  Physics: '#10b981', // Emerald
  Chemistry: '#f59e0b', // Amber
  Biology: '#059669', // Darker Emerald
  Mathematics: '#06b6d4', // Cyan
  English: '#6b7280', // Gray
}

export default function StudentAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/attempts/analytics')
        if (res.data) {
          setAnalytics(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      }
      setLoading(false)
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const overallAccuracy = analytics?.overallAccuracy ?? 0
  const streak = analytics?.streak ?? 0
  const subjectStats = analytics?.subjectBreakdown || []
  const strengths = analytics?.strengths || []
  const weakAreas = analytics?.weakAreas || []
  const totalAttempts = analytics?.totalAttempts ?? 0

  return (
    <div className="space-y-8 text-emerald-100">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">
          AI Performance Analytics & Progress Tracker
        </h1>
        <p className="text-sm text-emerald-100/70 font-semibold mt-1">
          Detailed subject-wise breakdown calculated from your practice and timed exam submissions.
        </p>
      </div>

      {totalAttempts === 0 ? (
        <div className="card-glass !p-12 text-center space-y-3 border-2 border-dashed border-[#10b981]/15 bg-[#0a1b14]/50 rounded-2xl">
          <TrendingUp size={40} className="mx-auto text-emerald-400/40" />
          <h3 className="font-extrabold text-base text-white">No Analytics Data Yet</h3>
          <p className="text-xs text-emerald-100/50 max-w-sm mx-auto font-semibold">Complete your first mock test or practice quiz to see your performance insights here.</p>
        </div>
      ) : (
        <>
          {/* Top Overview Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card-glass !p-6 flex items-center gap-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/30 transition-all rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold">
                <Target size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-100/50 uppercase">Overall Accuracy</p>
                <p className="text-3xl font-black text-white">
                  {overallAccuracy.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="card-glass !p-6 flex items-center gap-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-amber-500/30 transition-all rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-2xl font-bold">
                <Trophy size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-100/50 uppercase">Tests Completed</p>
                <p className="text-3xl font-black text-white">
                  {totalAttempts}
                </p>
              </div>
            </div>

            <div className="card-glass !p-6 flex items-center gap-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-orange-500/30 transition-all rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center text-2xl font-bold">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-100/50 uppercase">Current Active Streak</p>
                <p className="text-3xl font-black text-white">
                  {streak} Day{streak !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Subject Performance Breakdown */}
          {subjectStats.length > 0 && (
            <div className="card-glass !p-8 space-y-6 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl">
              <h2 className="text-xl font-bold text-white">
                Subject Accuracy Breakdown
              </h2>

              <div className="space-y-6">
                {subjectStats.map((item) => (
                  <div key={item.subject} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-white">{item.subject}</span>
                      <span className="text-emerald-400">
                        {item.accuracy?.toFixed(1)}% ({item.correct}/{item.attempted} Correct)
                      </span>
                    </div>
                    <div className="h-3 w-full bg-[#060e0a] border border-[#10b981]/15 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.accuracy || 0}%`,
                          backgroundColor: subjectColors[item.subject] || '#10b981',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-glass !p-6 border-l-4 border-l-emerald-500 border border-[#10b981]/15 bg-[#0a1b14]/50 space-y-3 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <CheckCircle size={18} />
                <h3>Strongest Modules</h3>
              </div>
              {strengths.length > 0 ? (
                <ul className="text-xs text-emerald-100/70 space-y-2 list-disc list-inside leading-relaxed font-semibold">
                  {strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-100/50 font-semibold">Complete more tests to discover your strongest subjects.</p>
              )}
            </div>

            <div className="card-glass !p-6 border-l-4 border-l-amber-500 border border-[#10b981]/15 bg-[#0a1b14]/50 space-y-3 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
                <Lightbulb size={18} />
                <h3>Recommended Focus Areas</h3>
              </div>
              {weakAreas.length > 0 ? (
                <ul className="text-xs text-emerald-100/70 space-y-2 list-disc list-inside leading-relaxed font-semibold">
                  {weakAreas.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-100/50 font-semibold">Keep practicing to receive personalized recommendations.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
