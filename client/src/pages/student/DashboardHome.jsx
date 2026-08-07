import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import api from '../../services/api'
import testService from '../../services/testService'
import { 
  GraduationCap, 
  PlayCircle, 
  ClipboardCheck, 
  Receipt, 
  Flame, 
  ArrowRight, 
  BookOpen,
  CheckCircle,
  Clock,
  HelpCircle,
  Trophy,
  Calendar,
  Lock,
  ShieldAlert
} from 'lucide-react'

export default function DashboardHome() {
  const { user } = useAuthStore()
  const studentName = user?.fullName || 'Student'

  const [metrics, setMetrics] = useState({ testsAttempted: 0, avgScore: 0, streak: 0 })
  const [recentTests, setRecentTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Keep live time updated for scheduling state updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const analyticsRes = await api.get('/attempts/analytics')
        if (analyticsRes.data) {
          setMetrics({
            testsAttempted: analyticsRes.data.totalAttempts || 0,
            avgScore: analyticsRes.data.overallAccuracy ? analyticsRes.data.overallAccuracy.toFixed(0) : 0,
            streak: analyticsRes.data.streak || 0,
          })
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      }

      try {
        const testsRes = await testService.getAvailableTests()
        if (testsRes && testsRes.success && testsRes.data) {
          setRecentTests(testsRes.data.slice(0, 2))
        }
      } catch (err) {
        console.error('Failed to fetch tests:', err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-[#10b981]/25 bg-[#0a1b14]/50 backdrop-blur-xl">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="badge badge-gold font-bold inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <GraduationCap size={14} /> Student Portal Overview
          </span>
          <h1 className="text-3xl sm:text-4xl font-black leading-snug text-white">
            Welcome back, <span className="text-gradient-gold inline-block">{studentName}</span>!
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/70 leading-relaxed font-semibold pt-1">
            Track your progress, attempt online practice tests, and download class notes for Pre-Medical & Pre-Engineering tracks.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/dashboard/tests" className="btn-gold text-sm shadow-md">
              <ClipboardCheck size={16} />
              <span>Attempt Online Test</span>
            </Link>
            <Link to="/dashboard/lectures" className="btn-outline text-sm">
              <PlayCircle size={16} />
              <span>View Lectures</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="card-glass rounded-3xl !p-6 flex flex-col justify-center items-start gap-4 lg:col-span-2 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold shrink-0">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-100/50">Tests Attempted</p>
            <p className="text-3xl sm:text-4xl font-black text-white mt-1">{metrics.testsAttempted}</p>
          </div>
        </div>

        <div className="card-glass rounded-3xl !p-6 flex flex-col justify-center items-start gap-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-amber-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-2xl font-bold shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-100/50">Average Score</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{metrics.avgScore}%</p>
          </div>
        </div>

        <div className="card-glass rounded-3xl !p-6 flex flex-col justify-center items-start gap-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-orange-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center text-2xl font-bold shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-100/50">Study Streak</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{metrics.streak} Day{metrics.streak !== 1 ? 's' : ''} 🔥</p>
          </div>
        </div>

        <div className="card-glass rounded-3xl !p-6 flex items-center justify-between gap-4 lg:col-span-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-[#10b981]/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-3xl font-bold shrink-0">
              <Receipt size={28} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-100/50">Fee Status</p>
              <p className="text-2xl font-black text-white mt-1">{user?.isApproved ? 'Paid & Verified' : 'Pending Verification'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Tests & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-8 pt-2">
        {/* Left 2 Cols: Active & Practice Tests */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-2xl font-bold text-white">
              Active & Practice Tests
            </h2>
            <Link to="/dashboard/tests" className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : recentTests.length === 0 ? (
              <div className="card-glass !p-8 text-center space-y-2 border-2 border-dashed border-[#10b981]/15 bg-[#0a1b14]/30">
                <ClipboardCheck size={32} className="mx-auto text-emerald-400/40" />
                <p className="text-sm font-bold text-white">No tests available yet</p>
                <p className="text-xs text-emerald-100/50 font-semibold">Tests will appear here once published by faculty.</p>
              </div>
            ) : (
              recentTests.map((t) => {
                const startTime = t.startTime ? new Date(t.startTime) : null
                const endTime = t.endTime ? new Date(t.endTime) : null
                
                let testStatus = 'active'
                if (startTime && startTime > currentTime) {
                  testStatus = 'upcoming'
                } else if (endTime && endTime < currentTime) {
                  testStatus = 'expired'
                }

                let borderAccent = t.mode === 'practice' ? 'border-l-amber-500' : 'border-l-emerald-400'
                let buttonEl = null
                let statusBadge = null

                if (testStatus === 'upcoming') {
                  borderAccent = 'border-l-amber-600 border border-amber-500/10'
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Calendar size={10} /> Upcoming
                    </span>
                  )
                  buttonEl = (
                    <div className="text-center py-2.5 px-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 font-extrabold text-xs flex items-center justify-center gap-1.5 self-start sm:self-center shrink-0 shadow-sm">
                      <Calendar size={12} />
                      <span>Available: {startTime ? startTime.toLocaleString() : ''}</span>
                    </div>
                  )
                } else if (testStatus === 'expired') {
                  borderAccent = 'border-l-red-500 border border-red-500/10'
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/10 text-red-400 border border-red-500/20">
                      <ShieldAlert size={10} /> Expired
                    </span>
                  )
                  buttonEl = (
                    <button
                      disabled
                      className="btn-primary text-xs !py-2.5 !px-5 self-start sm:self-center shrink-0 opacity-30 cursor-not-allowed !bg-red-950/20 !text-red-400/50 !border-red-500/10 flex items-center gap-1.5"
                    >
                      <Lock size={12} />
                      <span>Closed</span>
                    </button>
                  )
                } else {
                  buttonEl = (
                    <Link
                      to={`/dashboard/tests/${t._id}/attempt`}
                      className={`${t.mode === 'practice' ? 'btn-gold' : 'btn-primary'} text-xs !py-2.5 !px-5 self-start sm:self-center shrink-0`}
                    >
                      <span>{t.mode === 'practice' ? 'Practice Now' : 'Start Test'}</span>
                      <ArrowRight size={14} />
                    </Link>
                  )
                }

                return (
                  <div key={t._id} className={`card-glass !p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-l-4 bg-[#0a1b14]/40 border border-[#10b981]/15 hover:border-emerald-400/30 transition-all ${borderAccent}`}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`badge ${t.mode === 'practice' ? 'badge-gold' : 'badge-emerald'} text-[11px] font-extrabold`}>
                          {t.subject} • {t.mode === 'practice' ? 'Practice Mode' : 'Timed Test'}
                        </span>
                        {statusBadge}
                      </div>
                      <h3 className="font-bold text-lg text-white leading-snug">
                        {t.title}
                      </h3>
                      
                      {startTime && testStatus === 'upcoming' && (
                        <p className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Calendar size={12} /> Opens: {startTime.toLocaleString()}
                        </p>
                      )}
                      {endTime && testStatus === 'active' && (
                        <p className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                          <Clock size={12} /> Closes: {endTime.toLocaleString()}
                        </p>
                      )}

                      <div className="text-xs text-emerald-100/60 flex flex-wrap items-center gap-4 font-semibold pt-1">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-emerald-400" /> {t.durationMinutes ? `${t.durationMinutes} Mins` : 'Untimed'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <HelpCircle size={12} className="text-emerald-400" /> {t.questions?.length || 0} MCQs
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Trophy size={12} className="text-amber-500" /> Max: {t.totalMarks || 100}
                        </span>
                      </div>
                    </div>
                    {buttonEl}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Links */}
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-white pb-1">
            Quick Shortcuts
          </h2>

          <div className="space-y-3">
            <Link to="/dashboard/lectures" className="card-glass !p-4 flex items-center gap-3 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:bg-[#060e0a] hover:border-emerald-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold flex-shrink-0">
                <BookOpen size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">Class Video Lectures</p>
                <p className="text-xs text-emerald-100/50 truncate font-semibold">Physics, Chem, Biology, Math</p>
              </div>
              <ArrowRight size={14} className="text-emerald-400 flex-shrink-0" />
            </Link>

            <Link to="/dashboard/challan" className="card-glass !p-4 flex items-center gap-3 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:bg-[#060e0a] hover:border-emerald-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold flex-shrink-0">
                <Receipt size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">Download Fee Challan</p>
                <p className="text-xs text-emerald-100/50 truncate font-semibold">Official Star Academy Voucher</p>
              </div>
              <ArrowRight size={14} className="text-emerald-400 flex-shrink-0" />
            </Link>

            <Link to="/dashboard/analytics" className="card-glass !p-4 flex items-center gap-3 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:bg-[#060e0a] hover:border-emerald-400/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold flex-shrink-0">
                <Clock size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">Performance Insights</p>
                <p className="text-xs text-emerald-100/50 truncate font-semibold">Subject-wise Score Radar</p>
              </div>
              <ArrowRight size={14} className="text-emerald-400 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
