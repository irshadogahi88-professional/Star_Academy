import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaReceipt, FaPhoneAlt } from 'react-icons/fa'
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
    <section className="min-h-[100dvh] flex flex-col justify-center items-center py-16 px-4 sm:px-8 lg:px-24 bg-transparent relative z-10">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-10 text-center">
          <img src="/images/logo.png" alt="SEA Logo" className="w-16 h-16 mx-auto mb-5 rounded-full border-2 border-gold shadow-md" />
          <h1 className="text-3xl sm:text-4xl font-black text-[#0E4429] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Welcome Back</h1>
          <p className="text-sm text-[#3a4a40] font-bold">Sign in to your Star Educational Academy portal</p>
        </div>

        <div className="card !p-6 sm:!p-10 shadow-2xl border border-white/50 bg-white/95 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-2">Email Address</label>
              <div className="relative">
                <FaEnvelope size={14} className="input-icon" />
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
              <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-2">Password</label>
              <div className="relative">
                <FaLock size={14} className="input-icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="Enter your password"
                  className="input-field !pr-11 shadow-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3a4a40] z-10 hover:text-emerald-primary transition-colors">
                  {showPw ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#3a4a40] hover:text-emerald-primary transition-colors">
                <input type="checkbox" className="w-4 h-4 rounded text-[#147a4a] border-gray-300 focus:ring-emerald-primary" />
                <span>Remember me</span>
              </label>
              <Link to="/contact" className="text-[#147a4a] hover:underline">Need Help?</Link>
            </div>

            {/* Error or Pending Approval Banner */}
            {(localError || error) && (
              <div className={`p-4 rounded-xl text-xs font-bold leading-relaxed border ${
                isPendingApproval
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-red-50 border-red-200 text-red-700 shadow-sm'
              }`}>
                {isPendingApproval ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                      <FaExclamationTriangle size={16} className="text-amber-600 flex-shrink-0" />
                      <span>Approval Required</span>
                    </div>
                    <p className="text-[12px] leading-relaxed font-semibold text-amber-800/90">
                      {localError || error}
                    </p>
                    <div className="pt-3 border-t border-amber-200/60 flex flex-col gap-2 text-[12px] font-extrabold text-amber-900">
                      <span className="flex items-center gap-2"><FaReceipt size={14} className="text-amber-700" /> Pay Admission Fee at Office</span>
                      <span className="flex items-center gap-2"><FaPhoneAlt size={14} className="text-amber-700" /> 0308-3309704 / 0306-3004887</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5">
                    <FaExclamationTriangle size={14} className="shrink-0 mt-0.5 text-red-600" />
                    <p className="break-words font-semibold">{localError || error}</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="pt-2 pb-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center !py-4 text-base font-extrabold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-emerald-primary/30"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : 'Secure Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-[#3a4a40] font-bold">
              Don't have an account?{' '}
              <Link to="/register" className="font-black text-[#147a4a] hover:text-[#0E4429] hover:underline transition-colors">Register Now</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
