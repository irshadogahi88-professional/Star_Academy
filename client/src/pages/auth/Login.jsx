import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, AlertTriangle, Receipt, Phone } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const navigate = useNavigate()
  
  const { login, loading, error } = useAuthStore()
  const [localError, setLocalError] = useState('')
  const [isPendingApproval, setIsPendingApproval] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    setIsPendingApproval(false)

    const result = await login(form.email, form.password)
    if (result.success) {
      const role = result.user?.role
      if (role === 'admin' || role === 'director') {
        navigate('/admin')
      } else if (role === 'clerk') {
        navigate('/clerk')
      } else if (role === 'teacher') {
        navigate('/teacher')
      } else {
        navigate('/dashboard')
      }
    } else {
      setLocalError(result.error)
      if (result.isPendingApproval) {
        setIsPendingApproval(true)
      }
    }
  }

  return (
    <section className="min-h-[100dvh] flex flex-col justify-center items-center py-20 px-4 sm:px-8 lg:px-24 bg-transparent relative z-10">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-10 text-center">
          <img src="/images/logo.png" alt="SEA Logo" className="w-16 h-16 mx-auto mb-5 rounded-full border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" />
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Welcome Back</h1>
          <p className="text-sm text-emerald-100/60 font-semibold">Sign in to your Star Educational Academy portal</p>
        </div>

        <div className="card-glass !p-6 sm:!p-10 shadow-2xl border border-[#10b981]/15 bg-[#0a1b14]/50 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-amber-500/80 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="khan@gmail.com"
                  className="input-field shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-amber-500/80 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Enter your password"
                  className="input-field !pr-11 shadow-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-100/40 z-10 hover:text-emerald-400 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-emerald-100/60 hover:text-emerald-400 transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded bg-[#060e0a] text-emerald-500 border-[#10b981]/20 focus:ring-emerald-500 focus:ring-offset-[#0a1b14]" />
                <span>Remember me</span>
              </label>
              <Link to="/contact" className="text-emerald-400 hover:text-emerald-300 hover:underline">Need Help?</Link>
            </div>

            {/* Error or Pending Approval Banner */}
            {(localError || error) && (
              <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border ${
                isPendingApproval
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm'
                  : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-sm'
              }`}>
                {isPendingApproval ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                      <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 animate-pulse" />
                      <span>Approval Required</span>
                    </div>
                    <p className="text-[12px] leading-relaxed font-semibold text-emerald-100/80">
                      {localError || error}
                    </p>
                    <div className="pt-3 border-t border-amber-500/20 flex flex-col gap-2 text-[12px] font-extrabold text-amber-400">
                      <span className="flex items-center gap-2"><Receipt size={14} className="text-amber-500" /> Pay Admission Fee at Office</span>
                      <span className="flex items-center gap-2"><Phone size={14} className="text-amber-500" /> 0308-3309704 / 0306-3004887</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-red-500 animate-bounce" />
                    <p className="break-words font-semibold">{localError || error}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-2 pb-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center !py-4 text-base font-extrabold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/20"
              >
                {loading ? <span className="w-5 h-5 border-2 border-emerald-950 border-t-emerald-300 rounded-full animate-spin"></span> : 'Secure Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#10b981]/15 text-center">
            <p className="text-sm text-emerald-100/60 font-bold">
              Don't have an account?{' '}
              <Link to="/register" className="font-black text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">Register Now</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
