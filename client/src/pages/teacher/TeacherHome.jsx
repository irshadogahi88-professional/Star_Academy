import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import api from '../../services/api'
import { 
  GraduationCap, 
  Video, 
  HelpCircle, 
  PlusCircle, 
  Users, 
  ArrowRight, 
  CheckCircle,
  FileText,
  Cpu
} from 'lucide-react'

export default function TeacherHome() {
  const { user } = useAuthStore()
  const teacherName = user?.fullName || 'Faculty Member'

  const [metrics, setMetrics] = useState({ students: 0, mcqs: 0, tests: 0, lectures: 0 })
  const [recentTests, setRecentTests] = useState([])

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/teacher-metrics')
        if (res.data?.success) setMetrics(res.data.metrics)
      } catch (err) {
        console.error('Failed to fetch teacher metrics:', err)
      }
    }
    const fetchRecentTests = async () => {
      try {
        const res = await api.get('/tests')
        const list = res.data?.data || res.data?.tests || []
        setRecentTests(list.slice(0, 3))
      } catch (err) {
        console.error('Failed to fetch tests:', err)
      }
    }
    fetchMetrics()
    fetchRecentTests()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-[#10b981]/25 bg-[#0a1b14]/50 backdrop-blur-xl">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="badge badge-gold font-bold inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <GraduationCap size={14} /> Faculty Control Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black leading-snug text-white">
            Welcome, <span className="text-gradient-gold inline-block">{teacherName}</span>!
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/70 leading-relaxed font-semibold pt-1">
            Manage online lectures, generate AI exam papers, review student performance, and maintain the central MCQ Question Bank.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/teacher/tests/create" className="btn-gold text-sm shadow-md">
              <PlusCircle size={16} />
              <span>Create New Test</span>
            </Link>
            <Link to="/teacher/mcq" className="btn-outline text-sm">
              <HelpCircle size={16} />
              <span>Question Bank</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 text-emerald-100">
        <div className="card-glass rounded-3xl !p-6 flex flex-col justify-center items-start gap-4 lg:col-span-2 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-100/50">Enrolled Students</p>
            <p className="text-3xl sm:text-4xl font-black text-white mt-1">{metrics.students}</p>
          </div>
        </div>

        <div className="card-glass rounded-3xl !p-6 flex flex-col justify-center items-start gap-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-amber-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-2xl font-bold shrink-0">
            <HelpCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-100/50">MCQ Bank</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{metrics.mcqs?.toLocaleString()}</p>
          </div>
        </div>

        <div className="card-glass rounded-3xl !p-6 flex flex-col justify-center items-start gap-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-purple-500/30 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-2xl font-bold shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-100/50">Active Tests</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{metrics.tests}</p>
          </div>
        </div>

        <div className="card-glass rounded-3xl !p-6 flex items-center justify-between gap-4 lg:col-span-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-blue-500/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-3xl font-bold shrink-0">
              <Video size={28} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-100/50">Video Lectures Available</p>
              <p className="text-3xl font-black text-white mt-1">{metrics.lectures}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Management Shortcuts & Recent Activities */}
      <div className="grid lg:grid-cols-3 gap-8 pt-2">
        {/* Left 2 Cols: Management Modules */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-2xl font-bold text-white">
            Faculty Tools & Management
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <Link to="/teacher/tests/create" className="card-glass !p-6 flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/40 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl font-bold">
                <Cpu size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  AI Test Generator
                </h3>
                <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed font-semibold">
                  Generate chapter quizzes automatically with Google Gemini AI or select manually from MCQ Bank.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Launch Creator <ArrowRight size={12} />
              </span>
            </Link>

            <Link to="/teacher/mcq" className="card-glass !p-6 flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/40 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-xl font-bold">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Question Bank Manager
                </h3>
                <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed font-semibold">
                  Add, edit, tag, and categorize multiple choice questions by subject, class, and difficulty rating.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1">
                Manage Bank <ArrowRight size={12} />
              </span>
            </Link>

            <Link to="/teacher/lectures" className="card-glass !p-6 flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/40 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-xl font-bold">
                <Video size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Upload Video Lectures
                </h3>
                <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed font-semibold">
                  Publish YouTube / Vimeo class recording links and attach downloadable PDF study notes for students.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Publish Content <ArrowRight size={12} />
              </span>
            </Link>

            <Link to="/teacher/results" className="card-glass !p-6 flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/40 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl font-bold">
                <CheckCircle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Student Exam Analytics
                </h3>
                <p className="text-xs text-emerald-100/60 mt-1 leading-relaxed font-semibold">
                  Inspect student test submissions, highest/lowest scores, and tab-switch integrity violation flags.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                View Results <ArrowRight size={12} />
              </span>
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Recent Exam Activity */}
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-white">
            Recent Activity
          </h2>

          <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl !p-6 space-y-4">
            {recentTests.length === 0 ? (
              <p className="text-xs text-emerald-100/50 font-semibold">No recent tests created yet.</p>
            ) : (
              recentTests.map((t, i) => (
                <div key={t._id || i} className={`${i < recentTests.length - 1 ? 'border-b border-[#10b981]/15 pb-3' : ''} space-y-1`}>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">{t.subject} • {t.mode || 'Test'}</span>
                  <p className="font-bold text-sm text-white">{t.title}</p>
                  <p className="text-xs text-emerald-100/50 font-semibold">{t.questions?.length || 0} Questions • {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
