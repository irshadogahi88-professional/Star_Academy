import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuthStore } from '../../store/useAuthStore'
import { 
  FaUserShield, 
  FaUsers, 
  FaReceipt, 
  FaBullhorn, 
  FaCheckCircle, 
  FaClock, 
  FaArrowRight,
  FaFileInvoiceDollar,
  FaVideo,
  FaChartLine
} from 'react-icons/fa'
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-white shadow-xl bg-gradient-to-r from-emerald-deepest to-emerald-dark">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="badge badge-gold font-bold inline-flex items-center gap-1.5 px-3 py-1 text-xs">
            <FaUserShield size={14} className="text-gold" /> Executive Control Panel
          </span>
          <h1 className="text-3xl sm:text-4xl font-black leading-snug text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Welcome, <span className="text-gradient-gold inline-block">{adminName}</span>!
          </h1>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal pt-1">
            Star Educational Academy administrative oversight center. Manage student admissions, approve pending accounts, and issue fee vouchers.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/admin/students" className="btn-gold text-sm shadow-md">
              <FaUsers size={16} />
              <span>Manage Student Accounts</span>
            </Link>
            <Link to="/admin/fees" className="btn-outline-white text-sm">
              <FaReceipt size={16} />
              <span>Fee Vouchers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card rounded-3xl p-6 flex flex-col justify-center items-start gap-4 border border-emerald-900/10 shadow-md bg-white lg:col-span-2 hover:bg-emerald-50/50 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-primary/10 text-emerald-primary flex items-center justify-center text-2xl shrink-0">
            <FaUsers />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-charcoal-light">Total Registered</p>
            <p className="text-3xl sm:text-4xl font-black text-emerald-dark mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {loading ? '...' : `${metrics.totalStudents} Students`}
            </p>
          </div>
        </div>

        <div className="card rounded-3xl p-6 flex flex-col justify-center items-start gap-4 border border-amber-900/10 shadow-md bg-white hover:bg-amber-50/50 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center text-2xl shrink-0">
            <FaClock />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-charcoal-light">Pending Approvals</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {loading ? '...' : `${metrics.pendingStudents}`}
            </p>
          </div>
        </div>

        <div className="card rounded-3xl p-6 flex flex-col justify-center items-start gap-4 border border-emerald-600/10 shadow-md bg-white hover:bg-emerald-50/50 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
            <FaCheckCircle />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-charcoal-light">Approved Accounts</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {loading ? '...' : `${metrics.approvedStudents}`}
            </p>
          </div>
        </div>

        <div className="card rounded-3xl p-6 flex items-center justify-between gap-4 border border-blue-900/10 shadow-md bg-white lg:col-span-4 hover:bg-blue-50/50 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-3xl shrink-0">
              <FaFileInvoiceDollar />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-charcoal-light">Total Test Submissions</p>
              <p className="text-3xl font-black text-blue-800 mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
                {loading ? '...' : `${metrics.totalSubmissions} Attempts`}
              </p>
            </div>
          </div>
          <Link to="/admin/tests" className="btn-outline hidden sm:flex !rounded-2xl">
            View Reports
          </Link>
        </div>
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Distribution Pie Chart */}
        <div className="card p-6 border border-emerald-900/10 shadow-md bg-white flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <FaChartLine className="text-emerald-primary" />
            <h3 className="text-lg font-black text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>Student Registration Status</h3>
          </div>
          <div className="flex-1 min-h-[250px]">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <span className="w-8 h-8 border-4 border-[#147a4a] border-t-transparent rounded-full animate-spin"></span>
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
                    <Cell fill="#147a4a" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Content Metrics Bar Chart */}
        <div className="card p-6 border border-emerald-900/10 shadow-md bg-white flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <FaChartLine className="text-emerald-primary" />
            <h3 className="text-lg font-black text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>Platform Content Overview</h3>
          </div>
          <div className="flex-1 min-h-[250px]">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <span className="w-8 h-8 border-4 border-[#147a4a] border-t-transparent rounded-full animate-spin"></span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Lectures', count: metrics.totalLectures, fill: '#147a4a' },
                    { name: 'Tests', count: metrics.totalTests, fill: '#D4A64A' },
                    { name: 'MCQs', count: metrics.totalMCQs, fill: '#082d1b' },
                    { name: 'Attempts', count: metrics.totalSubmissions, fill: '#3b82f6' },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {
                      [
                        { name: 'Lectures', count: metrics.totalLectures, fill: '#147a4a' },
                        { name: 'Tests', count: metrics.totalTests, fill: '#D4A64A' },
                        { name: 'MCQs', count: metrics.totalMCQs, fill: '#082d1b' },
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
          <h2 className="text-2xl font-bold text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>
            Administrative Operations
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <Link to="/admin/students" className="card p-7 flex flex-col justify-between space-y-5 shadow-lg border border-transparent hover:border-emerald-primary/30 bg-white">
              <div className="w-14 h-14 rounded-2xl bg-emerald-primary/10 text-emerald-primary flex items-center justify-center text-2xl font-bold">
                <FaUsers />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>
                  Student Roster & Verification
                </h3>
                <p className="text-sm text-charcoal-light mt-2 leading-relaxed font-semibold">
                  Approve newly registered students, manage enrollment status, and execute password recovery.
                </p>
              </div>
              <span className="text-sm font-black text-emerald-primary flex items-center gap-1.5 mt-2">
                Open Student Directory <FaArrowRight size={12} />
              </span>
            </Link>

            <Link to="/admin/fees" className="card p-7 flex flex-col justify-between space-y-5 shadow-lg border border-transparent hover:border-gold/50 bg-white">
              <div className="w-14 h-14 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center text-2xl font-bold">
                <FaReceipt />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>
                  Fee Challan & Vouchers
                </h3>
                <p className="text-sm text-charcoal-light mt-2 leading-relaxed font-semibold">
                  Track monthly tuition fee payments, mark vouchers paid, and issue printable Star Academy Challans.
                </p>
              </div>
              <span className="text-sm font-black text-gold-dark flex items-center gap-1.5 mt-2">
                Manage Fee Records <FaArrowRight size={12} />
              </span>
            </Link>
            
            <Link to="/admin/lectures" className="card p-7 flex flex-col justify-between space-y-5 shadow-lg border border-transparent hover:border-blue-500/30 bg-white">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl font-bold">
                <FaVideo />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>
                  Video Lectures Hub
                </h3>
                <p className="text-sm text-charcoal-light mt-2 leading-relaxed font-semibold">
                  Upload and organize YouTube lecture links for different grades and subjects.
                </p>
              </div>
              <span className="text-sm font-black text-blue-600 flex items-center gap-1.5 mt-2">
                Manage Lectures <FaArrowRight size={12} />
              </span>
            </Link>

            <Link to="/admin/announcements" className="card p-7 flex flex-col justify-between space-y-5 shadow-lg border border-transparent hover:border-purple-500/30 bg-white">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-2xl font-bold">
                <FaBullhorn />
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>
                  Marquee Announcements
                </h3>
                <p className="text-sm text-charcoal-light mt-2 leading-relaxed font-semibold">
                  Push urgent alerts, test results, and holiday notifications to the student portal marquee.
                </p>
              </div>
              <span className="text-sm font-black text-purple-600 flex items-center gap-1.5 mt-2">
                Update Announcements <FaArrowRight size={12} />
              </span>
            </Link>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>
            Action Required
          </h2>
          
          <div className="card p-6 shadow-lg bg-white border-t-4 border-amber-500">
            <h3 className="text-sm font-black text-amber-800 uppercase tracking-wider mb-4 bg-amber-50 px-3 py-2 rounded-lg inline-block border border-amber-200">
              Pending Registrations
            </h3>
            {(!metrics.recentPending || metrics.recentPending.length === 0) ? (
              <div className="text-center py-6 text-charcoal-light font-semibold text-sm bg-gray-50 rounded-xl">
                No pending accounts for review.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.recentPending.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-emerald-50 transition-colors rounded-xl border border-gray-100">
                    <div>
                      <p className="font-extrabold text-sm text-emerald-dark">{user.fullName}</p>
                      <p className="text-[11px] text-charcoal-light font-semibold">{user.grade} • {user.stream || 'N/A'}</p>
                    </div>
                    <Link to="/admin/students" className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg hover:bg-emerald-200 transition-colors">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
            {metrics.pendingStudents > 5 && (
              <Link to="/admin/students" className="block text-center text-xs font-bold text-amber-700 mt-4 hover:underline">
                View all {metrics.pendingStudents} pending accounts
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
