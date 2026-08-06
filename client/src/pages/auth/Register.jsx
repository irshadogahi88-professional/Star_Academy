import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Phone, GraduationCap, CheckCircle, Receipt, MapPin } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirmPassword: '', class: '', stream: '' })
  const [showPw, setShowPw] = useState(false)
  const [localError, setLocalError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const { register, loading, error } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }
    if (!form.class) {
      setLocalError('Please select your class')
      return
    }
    if (!form.stream) {
      setLocalError('Please select your stream')
      return
    }

    const payload = {
      fullName: form.fullName,
      phone: form.phone,
      email: form.email,
      password: form.password,
      role: 'student',
      grade: form.class,
      stream: form.stream,
    }

    const result = await register(payload)
    if (result.success) {
      setSuccessMsg(result.message || 'Registration submitted successfully!')
    } else {
      setLocalError(result.error)
    }
  }

  const update = (field, value) => setForm({ ...form, [field]: value })

  if (successMsg) {
    return (
      <section className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center py-20 px-4 bg-transparent">
        <div className="card-glass max-w-lg text-center !p-8 space-y-6 border border-[#10b981]/25 bg-[#0a1b14]/50 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-black text-white">
            Registration Submitted!
          </h2>
          <p className="text-sm text-emerald-100/70 leading-relaxed font-semibold">
            {successMsg}
          </p>

          <div className="p-5 rounded-2xl bg-[#060e0a]/80 text-[#e2ede7] text-left space-y-3 text-xs border border-[#10b981]/15">
            <p className="font-extrabold text-amber-500 flex items-center gap-1.5 text-xs">
              <Receipt size={14} /> Next Step to Activate Your Account:
            </p>
            <p className="text-emerald-100/80 leading-relaxed text-[12px] font-medium">
              Visit Star Educational Academy office with your student registration details, pay your one-time admission fee, and our administrator/clerk will approve your account.
            </p>
            <p className="text-[11px] text-emerald-100/50 flex items-center gap-1.5 pt-2 border-t border-[#10b981]/10">
              <MapPin size={12} className="text-amber-500" /> Location: D.A.V. School, Ladies Bazaar, Ghotki
            </p>
          </div>

          <Link to="/login" className="btn-gold w-full text-sm font-extrabold !py-3">
            <span>Proceed to Sign In</span>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center py-20 px-4 bg-transparent">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <img src="/images/logo.png" alt="SEA Logo" className="w-16 h-16 mx-auto mb-3 rounded-full border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" />
          <h1 className="text-3xl font-black text-white">Create Student Account</h1>
          <p className="text-xs text-emerald-100/60 font-semibold mt-1">Register for Star Educational Academy — Session 2026</p>
        </div>

        <div className="card-glass !p-8 sm:!p-10 bg-[#0a1b14]/50 backdrop-blur-xl border border-[#10b981]/15">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-amber-500/80 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  required
                  placeholder="Khan"
                  className="input-field shadow-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-amber-500/80 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  required
                  placeholder="0308-3309704"
                  className="input-field shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-amber-500/80 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                  placeholder="khan@gmail.com"
                  className="input-field shadow-sm"
                />
              </div>
            </div>

            {/* Class & Stream */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-amber-500/80 mb-1.5">Class</label>
                <select
                  value={form.class}
                  onChange={(e) => update('class', e.target.value)}
                  required
                  className="w-full px-4 py-3 min-h-[46px] rounded-xl border border-[#10b981]/25 text-xs font-bold text-emerald-100 bg-[#060e0a] focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="" className="bg-[#0a1b14]">Select Class</option>
                  <option value="9" className="bg-[#0a1b14]">Grade IX (Matric)</option>
                  <option value="10" className="bg-[#0a1b14]">Grade X (Matric)</option>
                  <option value="11" className="bg-[#0a1b14]">Grade XI (F.Sc)</option>
                  <option value="12" className="bg-[#0a1b14]">Grade XII (F.Sc)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-amber-500/80 mb-1.5">Stream / Group</label>
                <select
                  value={form.stream}
                  onChange={(e) => update('stream', e.target.value)}
                  required
                  className="w-full px-4 py-3 min-h-[46px] rounded-xl border border-[#10b981]/25 text-xs font-bold text-emerald-100 bg-[#060e0a] focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="" className="bg-[#0a1b14]">Select Stream</option>
                  <option value="general" className="bg-[#0a1b14]">Matric / General Science (9-10)</option>
                  <option value="pre-medical" className="bg-[#0a1b14]">Pre-Medical (11-12)</option>
                  <option value="pre-engineering" className="bg-[#0a1b14]">Pre-Engineering (11-12)</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-amber-500/80 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                  placeholder="Min. 6 characters"
                  className="input-field !pr-11 shadow-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-100/40 z-10 hover:text-emerald-400 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-amber-500/80 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  required
                  placeholder="Re-enter your password"
                  className="input-field shadow-sm"
                />
              </div>
            </div>

            {(localError || error) && (
              <div className="p-3 rounded-xl text-xs text-center font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                {localError || error}
              </div>
            )}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center !py-3.5 sm:!py-4 text-sm font-extrabold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/20"
              >
                {loading ? <span className="w-5 h-5 border-2 border-emerald-950 border-t-emerald-300 rounded-full animate-spin"></span> : 'Submit Registration'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs font-semibold text-emerald-100/60">
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold text-emerald-400 hover:text-emerald-300 hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
