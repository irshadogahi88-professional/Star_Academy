import { useState } from 'react'
import { Settings, Lock, CheckCircle, UserCheck } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

export default function ClerkSettings() {
  const { user } = useAuthStore()
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirmPass: '' })
  const [notice, setNotice] = useState('')

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirmPass) {
      alert('New password and confirm password do not match!')
      return
    }
    setNotice('Password updated successfully!')
    setPasswords({ current: '', newPass: '', confirmPass: '' })
    setTimeout(() => setNotice(''), 4000)
  }

  return (
    <div className="space-y-6 max-w-3xl text-emerald-100">
      <div>
        <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Settings size={12} /> Account Preferences
        </span>
        <h1 className="text-3xl font-black text-white mt-1">
          Clerk Desk Settings
        </h1>
        <p className="text-xs text-emerald-100/70 font-semibold">Manage security, update password, and view office credentials.</p>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-extrabold text-xs flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{notice}</span>
        </div>
      )}

      {/* Account Info */}
      <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl !p-6 space-y-4 shadow-md">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <UserCheck className="text-emerald-400" size={18} /> Office Profile Credentials
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-extrabold text-emerald-100/50 block mb-0.5">Staff Name:</span>
            <span className="font-bold text-white text-sm">{user?.fullName || 'Academy Office Clerk'}</span>
          </div>
          <div>
            <span className="font-extrabold text-emerald-100/50 block mb-0.5">Office Email:</span>
            <span className="font-bold text-white text-sm">{user?.email || 'clerk@staracademy.edu.pk'}</span>
          </div>
          <div className="sm:col-span-2 pt-1">
            <span className="font-extrabold text-emerald-100/50 block mb-1.5">Role Designation:</span>
            <span className="badge badge-emerald font-extrabold">Official Clerk (Front Office)</span>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl !p-6 space-y-4 shadow-md">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <Lock className="text-emerald-400" size={18} /> Change Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-semibold focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-semibold focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={passwords.confirmPass}
              onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-semibold focus:outline-none focus:border-emerald-400"
            />
          </div>

          <button type="submit" className="btn-primary text-xs !py-2.5 !px-6 shadow-xs">
            Update Security Password
          </button>
        </form>
      </div>
    </div>
  )
}
