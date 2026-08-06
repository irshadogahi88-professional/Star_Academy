import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuthStore } from '../../store/useAuthStore'
import { 
  ShieldAlert, 
  Users, 
  Receipt, 
  Megaphone, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  FileText,
  Video,
  TrendingUp
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

export default function AdminHome() {
  const { user, token } = useAuthStore()
  const adminName = user?.fullName || 'Sir Irshad Ahmed Ogahi'

  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    pendingStudents: 0,
    approvedStudents: 0,
    totalSubmissions: 0,
    totalLectures: 0,
    totalTests: 0,
    totalMCQs: 0,
    recentPending: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/metrics')
        if (res.data?.success && res.data?.metrics) {
          setMetrics(res.data.metrics)
        }
      } catch (err) {
        console.error('Failed to fetch admin metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [token])

  return (
    <div className="space-y-8 text-emerald-100">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white shadow-xl bg-gradient-to-r from-[#0a1e14] via-[#0E4429] to-[#0a1e14] border border-[#10b981]/25">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="badge badge-gold font-bold inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert size={14} /> Executive Control Panel
          </span>
          <h1 className="text-3xl sm:text-4xl font-black leading-snug text-white">
            Welcome, <span className="text-amber-400 inline-block">{adminName}</span>!
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/80 leading-relaxed font-semibold pt-1">
            Star Educational Academy administrative oversight center. Manage student admissions, approve pending accounts, and execute key configurations.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/admin/students" className="btn-gold text-sm shadow-md flex items-center gap-2">
              <Users size={16} />
              <span>Manage Student Accounts</span>
            </Link>
            <Link to="/admin/fees" className="btn-primary text-sm shadow-md flex items-center gap-2">
              <Receipt size={16} />
              <span>Fee Vouchers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card-glass rounded-3xl p-6 flex flex-col justify-center items-start gap-4 border border-[#10b981]/15 shadow-lg bg-[#0a1b14]/50 lg:col-span-2 hover:bg-emerald-500/5 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 flex items-center justify-center text-2xl shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Total Registered</p>
            <p className="text-3xl sm:text-4xl font-black text-white mt-1">
              {loading ? '...' : `${metrics.totalStudents} Students`}
            </p>
          </div>
        </div>

        <div className="card-glass rounded-3xl p-6 flex flex-col justify-center items-start gap-4 border border-[#10b981]/15 shadow-lg bg-[#0a1b14]/50 hover:bg-emerald-500/5 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-amber-400">Pending Approvals</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {loading ? '...' : `${metrics.pendingStudents}`}
            </p>
          </div>
        </div>

        <div className="card-glass rounded-3xl p-6 flex flex-col justify-center items-start gap-4 border border-[#10b981]/15 shadow-lg bg-[#0a1b14]/50 hover:bg-emerald-500/5 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Approved Accounts</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {loading ? '...' : `${metrics.approvedStudents}`}
            </p>
          </div>
        </div>

        <div className="card-glass rounded-3xl p-6 flex items-center justify-between gap-4 border border-[#10b981]/15 shadow-lg bg-[#0a1b14]/50 lg:col-span-4 hover:bg-emerald-500/5 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-3xl shrink-0">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-100/50">Total Test Submissions</p>
              <p className="text-3xl font-black text-white mt-1">
                {loading ? '...' : `${metrics.totalSubmissions} Attempts`}
              </p>
            </div>
          </div>
          <Link to="/admin/tests" className="btn-primary hidden sm:flex !rounded-2xl shadow-sm text-xs font-black">
            View Reports
          </Link>
        </div>
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Distribution Pie Chart */}
        <div className="card-glass p-6 border border-[#10b981]/15 shadow-lg bg-[#0a1b14]/50 rounded-3xl flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-emerald-400" size={18} />
            <h3 className="text-lg font-black text-white">Student Registration Status</h3>
          </div>
          <div className="flex-1 min-h-[250px]">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: metrics.approvedStudents },
                      { name: 'Pending', value: metrics.pendingStudents }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#060e0a', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#e2ede7' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#e2ede7' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Content Metrics Bar Chart */}
        <div className="card-glass p-6 border border-[#10b981]/15 shadow-lg bg-[#0a1b14]/50 rounded-3xl flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-emerald-400" size={18} />
            <h3 className="text-lg font-black text-white">Platform Content Overview</h3>
          </div>
          <div className="flex-1 min-h-[250px]">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Lectures', count: metrics.totalLectures, fill: '#10b981' },
                    { name: 'Tests', count: metrics.totalTests, fill: '#f59e0b' },
                    { name: 'MCQs', count: metrics.totalMCQs, fill: '#059669' },
                    { name: 'Attempts', count: metrics.totalSubmissions, fill: '#3b82f6' },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#10b981" opacity={0.15} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#e2ede7' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#e2ede7' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                    contentStyle={{ backgroundColor: '#060e0a', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#e2ede7' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {
                      [
                        { name: 'Lectures', count: metrics.totalLectures, fill: '#10b981' },
                        { name: 'Tests', count: metrics.totalTests, fill: '#f59e0b' },
                        { name: 'MCQs', count: metrics.totalMCQs, fill: '#059669' },
                        { name: 'Attempts', count: metrics.totalSubmissions, fill: '#3b82f6' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Control Modules Grid */}
      <div className="grid lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Administrative Operations
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <Link to="/admin/students" className="card-glass p-7 flex flex-col justify-between space-y-5 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 rounded-3xl shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Student Roster & Verification
                </h3>
                <p className="text-sm text-emerald-100/60 font-semibold mt-2 leading-relaxed">
                  Approve newly registered students, manage enrollment status, and execute password recovery.
                </p>
              </div>
              <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5 mt-2 group-hover:text-white transition-colors">
                Open Student Directory <ArrowRight size={12} />
              </span>
            </Link>

            <Link to="/admin/fees" className="card-glass p-7 flex flex-col justify-between space-y-5 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 rounded-3xl shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                <Receipt size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Fee Challan & Vouchers
                </h3>
                <p className="text-sm text-emerald-100/60 font-semibold mt-2 leading-relaxed">
                  Track monthly tuition fee payments, mark vouchers paid, and issue printable Star Academy Challans.
                </p>
              </div>
              <span className="text-sm font-black text-amber-400 flex items-center gap-1.5 mt-2 group-hover:text-white transition-colors">
                Manage Fee Records <ArrowRight size={12} />
              </span>
            </Link>
            
            <Link to="/admin/lectures" className="card-glass p-7 flex flex-col justify-between space-y-5 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 rounded-3xl shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                <Video size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Video Lectures Hub
                </h3>
                <p className="text-sm text-emerald-100/60 font-semibold mt-2 leading-relaxed">
                  Upload and organize YouTube lecture links for different grades and subjects.
                </p>
              </div>
              <span className="text-sm font-black text-blue-400 flex items-center gap-1.5 mt-2 group-hover:text-white transition-colors">
                Manage Lectures <ArrowRight size={12} />
              </span>
            </Link>

            <Link to="/admin/announcements" className="card-glass p-7 flex flex-col justify-between space-y-5 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 rounded-3xl shadow-lg transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center text-2xl font-bold group-hover:scale-105 transition-transform">
                <Megaphone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">
                  Marquee Announcements
                </h3>
                <p className="text-sm text-emerald-100/60 font-semibold mt-2 leading-relaxed">
                  Push urgent alerts, test results, and holiday notifications to the student portal marquee.
                </p>
              </div>
              <span className="text-sm font-black text-purple-400 flex items-center gap-1.5 mt-2 group-hover:text-white transition-colors">
                Update Announcements <ArrowRight size={12} />
              </span>
            </Link>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            Action Required
          </h2>
          
          <div className="card-glass p-6 shadow-lg bg-[#0a1b14]/50 border border-[#10b981]/15 border-t-4 border-t-amber-500 rounded-3xl">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-4 bg-amber-500/10 border border-amber-500/25 px-3 py-2 rounded-lg inline-block">
              Pending Registrations
            </h3>
            {(!metrics.recentPending || metrics.recentPending.length === 0) ? (
              <div className="text-center py-6 text-emerald-100/40 font-semibold text-sm bg-[#060e0a] border border-[#10b981]/10 rounded-xl">
                No pending accounts for review.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.recentPending.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3.5 bg-[#060e0a] border border-[#10b981]/15 hover:bg-emerald-500/5 transition-all rounded-xl">
                    <div>
                      <p className="font-extrabold text-sm text-white">{user.fullName}</p>
                      <p className="text-[11px] text-emerald-100/50 font-semibold mt-0.5">{user.grade} • {user.stream || 'N/A'}</p>
                    </div>
                    <Link to="/admin/students" className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px] rounded-lg hover:bg-emerald-500/20 transition-all">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {metrics.pendingStudents > 5 && (
              <Link to="/admin/students" className="block text-center text-xs font-bold text-amber-400 mt-4 hover:underline">
                View all {metrics.pendingStudents} pending accounts
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
