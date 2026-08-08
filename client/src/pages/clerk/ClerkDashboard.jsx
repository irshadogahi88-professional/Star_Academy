import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Receipt, CheckCircle, Hourglass, Trophy, ArrowRight } from 'lucide-react'
import api from '../../services/api'

export default function ClerkDashboard() {
  const [stats, setStats] = useState({
    pendingStudents: 0,
    approvedStudents: 0,
    unpaidChallans: 0,
    totalChallanRevenue: '₨ 0',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/admin/metrics')
        if (response.data.success) {
          const m = response.data.metrics
          setStats({
            pendingStudents: m.pendingStudents || 0,
            approvedStudents: m.approvedStudents || 0,
            unpaidChallans: m.pendingStudents || 0,
            totalChallanRevenue: `₨ ${((m.approvedStudents || 0) * 28000).toLocaleString()}`,
          })
        }
      } catch (err) {
        console.error('Failed to fetch clerk metrics:', err)
      }
      setLoading(false)
    }
    fetchMetrics()
  }, [])

  return (
    <div className="space-y-8 text-emerald-100">
      {/* Welcome Banner */}
      <div className="card-glass !p-8 bg-gradient-to-r from-[#0a1e14] via-[#0E4429] to-[#0a1e14] border border-[#10b981]/25 shadow-2xl rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Front Office Clerk Desk
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Admission Approval & Fee Station
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/70 max-w-xl font-semibold">
              Process student admission fee vouchers, grant platform login clearance, and publish student achievement stories.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/clerk/students" className="btn-gold text-xs !py-3 !px-5 shadow-md flex items-center gap-2">
              <Users size={14} />
              <span>Pending Approvals</span>
            </Link>
            <Link to="/clerk/challans" className="btn-primary text-xs !py-3 !px-5 shadow-md flex items-center gap-2">
              <Receipt size={14} />
              <span>Issue Fee Voucher</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-glass !p-6 border-l-4 border-amber-500 space-y-2 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl shadow-lg relative">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Pending Registrations</span>
            <Hourglass size={20} />
          </div>
          <p className="text-3xl font-black text-white">{stats.pendingStudents}</p>
          <p className="text-[11px] font-semibold text-emerald-100/50">Requires cash/challan verification</p>
        </div>

        <div className="card-glass !p-6 border-l-4 border-emerald-500 space-y-2 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl shadow-lg relative">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Approved Students</span>
            <CheckCircle size={20} />
          </div>
          <p className="text-3xl font-black text-white">{stats.approvedStudents}</p>
          <p className="text-[11px] font-semibold text-emerald-100/50">Active student portal access</p>
        </div>

        <div className="card-glass !p-6 border-l-4 border-blue-500 space-y-2 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl shadow-lg relative">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Unpaid Admission Vouchers</span>
            <Receipt size={20} />
          </div>
          <p className="text-3xl font-black text-white">{stats.unpaidChallans}</p>
          <p className="text-[11px] font-semibold text-emerald-100/50">One-Time Session Fee ₨ 28,000</p>
        </div>

        <div className="card-glass !p-6 border-l-4 border-amber-500 space-y-2 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl shadow-lg relative">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs uppercase font-extrabold tracking-wider">Verified Revenue</span>
            <Trophy size={20} />
          </div>
          <p className="text-3xl font-black text-white">{stats.totalChallanRevenue}</p>
          <p className="text-[11px] font-semibold text-emerald-100/50">Session 2026 Admissions</p>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/clerk/students" className="card-glass !p-6 space-y-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 transition-all rounded-3xl group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Student Approval Station</h3>
            <p className="text-xs text-emerald-100/60 font-semibold mt-1">Verify walk-in fee payment at Dav School office and flip student status to Approved.</p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-400 gap-1 pt-2 group-hover:text-white transition-colors">
            <span>Manage Approvals</span> <ArrowRight size={12} />
          </div>
        </Link>

        <Link to="/clerk/challans" className="card-glass !p-6 space-y-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 transition-all rounded-3xl group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
            <Receipt size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Fee Challans & Voucher Receipts</h3>
            <p className="text-xs text-emerald-100/60 font-semibold mt-1">Issue official bank/office fee challans and mark status as Paid once received.</p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-400 gap-1 pt-2 group-hover:text-white transition-colors">
            <span>Generate & Track Challans</span> <ArrowRight size={12} />
          </div>
        </Link>

        <Link to="/clerk/success-stories" className="card-glass !p-6 space-y-4 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 transition-all rounded-3xl group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Success Stories Manager</h3>
            <p className="text-xs text-emerald-100/60 font-semibold mt-1">Post top student MDCAT & Pre-Engineering positions and MBBS selections onto public website.</p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-400 gap-1 pt-2 group-hover:text-white transition-colors">
            <span>Manage Achievements</span> <ArrowRight size={12} />
          </div>
        </Link>
      </div>
    </div>
  )
}
