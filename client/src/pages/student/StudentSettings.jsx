import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { User, Lock, Save, CheckCircle, AlertTriangle } from 'lucide-react'
import api from '../../services/api'

export default function StudentSettings() {
  const { user, setUser } = useAuthStore()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setSavedMsg('')
    setErrorMsg('')

    try {
      const res = await api.patch('/auth/profile', { fullName, phone })
      if (res.data?.success) {
        setSavedMsg('Profile settings updated successfully!')
        if (setUser) setUser({ ...user, fullName, phone })
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.')
    }
    setSavingProfile(false)
    setTimeout(() => { setSavedMsg(''); setErrorMsg('') }, 4000)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    setSavingPassword(true)
    setSavedMsg('')
    setErrorMsg('')

    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword })
      if (res.data?.success) {
        setSavedMsg('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to change password.')
    }
    setSavingPassword(false)
    setTimeout(() => { setSavedMsg(''); setErrorMsg('') }, 4000)
  }

  return (
    <div className="space-y-8 max-w-3xl text-emerald-100">
      <div>
        <h1 className="text-3xl font-black text-white">
          Account Settings & Security
        </h1>
        <p className="text-sm text-emerald-100/70 font-semibold mt-1">
          Manage your personal details and account credentials.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Info Card */}
      <form onSubmit={handleSaveProfile} className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl !p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <User size={18} className="text-emerald-400" />
          <span>Personal Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-emerald-100/70 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#060e0a] border border-[#10b981]/25 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-100/70 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#060e0a] border border-[#10b981]/25 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-emerald-100/70 mb-1">Class / Grade</label>
            <input
              type="text"
              disabled
              value={user?.studentDetails?.grade || user?.class || '—'}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#060e0a]/40 text-emerald-100/40 border border-[#10b981]/10 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-100/70 mb-1">Track / Stream</label>
            <input
              type="text"
              disabled
              value={user?.studentDetails?.stream || user?.stream || '—'}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#060e0a]/40 text-emerald-100/40 border border-[#10b981]/10 cursor-not-allowed"
            />
          </div>
        </div>

        <button type="submit" disabled={savingProfile} className="btn-primary text-xs !py-3">
          <Save size={14} />
          <span>{savingProfile ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </form>

      {/* Change Password Card */}
      <form onSubmit={handleChangePassword} className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl !p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Lock size={18} className="text-emerald-400" />
          <span>Change Security Password</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-emerald-100/70 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#060e0a] border border-[#10b981]/25 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-100/70 mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#060e0a] border border-[#10b981]/25 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
        </div>

        <button type="submit" disabled={savingPassword} className="btn-gold text-xs !py-3">
          <Lock size={14} />
          <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
        </button>
      </form>
    </div>
  )
}
