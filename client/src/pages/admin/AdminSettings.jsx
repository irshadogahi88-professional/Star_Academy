import { useState, useEffect } from 'react'
import { UserCog, Lock, Save, Key, Shield } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import api from '../../services/api'

export default function AdminSettings() {
  const { user, updateUser } = useAuthStore()

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileStatus, setProfileStatus] = useState(null) // { type: 'success' | 'error', text: '' }

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState(null) // { type: 'success' | 'error', text: '' }

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
    }
  }, [user])

  // Handle Profile Update (Name, Email, Phone)
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileStatus(null)

    try {
      const response = await api.patch('/auth/profile', { fullName, email, phone })
      if (response.data && response.data.success) {
        updateUser(response.data.user)
        setProfileStatus({ type: 'success', text: '✅ Admin profile details updated successfully!' })
      } else {
        setProfileStatus({ type: 'error', text: response.data.message || 'Failed to update profile' })
      }
    } catch (err) {
      setProfileStatus({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update profile' })
    } finally {
      setProfileSaving(false)
      setTimeout(() => setProfileStatus(null), 5000)
    }
  }

  // Handle Password Change (Current + New + Confirm New)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordStatus(null)

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: '❌ New password and Confirm password do not match!' })
      setPasswordSaving(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', text: '❌ New password must be at least 6 characters long.' })
      setPasswordSaving(false)
      return
    }

    try {
      const response = await api.post('/auth/change-password', { currentPassword, newPassword })
      if (response.data && response.data.success) {
        setPasswordStatus({ type: 'success', text: '✅ Admin password updated successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordStatus({ type: 'error', text: response.data.message || 'Failed to change password' })
      }
    } catch (err) {
      setPasswordStatus({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to change password' })
    } finally {
      setPasswordSaving(false)
      setTimeout(() => setPasswordStatus(null), 5000)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-emerald-100">
      {/* Header */}
      <div>
        <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Shield size={12} /> Account Governance
        </span>
        <h1 className="text-3xl font-black text-white mt-1">
          Admin Account & Security Settings
        </h1>
        <p className="text-xs text-emerald-100/70 font-semibold">Manage administrative credentials, official email, and change system access password.</p>
      </div>

      {/* Admin Profile Details */}
      <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl !p-8 space-y-6 shadow-md">
        <div className="flex items-center gap-3 border-b border-[#10b981]/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-[#10b981] flex items-center justify-center font-bold">
            <UserCog size={18} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              Admin Profile Information
            </h2>
            <p className="text-xs text-emerald-100/70 font-semibold">Update your administrative name, contact email, and phone line.</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Admin Full Name"
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@staracademy.edu.pk"
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
              Contact Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0308-3309704"
              className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button type="submit" disabled={profileSaving} className="btn-primary text-xs !py-3 !px-6 shadow-md flex items-center gap-2">
              <Save size={14} />
              <span>{profileSaving ? 'Saving Profile...' : 'Save Account Details'}</span>
            </button>
          </div>

          {profileStatus && (
            <div
              className={`p-4 rounded-xl text-xs font-bold text-center border ${
                profileStatus.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : 'bg-red-500/10 text-red-400 border-red-500/25'
              }`}
            >
              {profileStatus.text}
            </div>
          )}
        </form>
      </div>

      {/* Change Password Card (Current + 2x New) */}
      <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl !p-8 space-y-6 shadow-md">
        <div className="flex items-center gap-3 border-b border-[#10b981]/10 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#060e0a] border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
            <Lock size={18} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              Change Password
            </h2>
            <p className="text-xs text-emerald-100/70 font-semibold">Enter your current password followed by your new password twice.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password..."
              className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password..."
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button type="submit" disabled={passwordSaving} className="btn-gold text-xs !py-3 !px-6 shadow-md flex items-center gap-2">
              <Key size={14} />
              <span>{passwordSaving ? 'Updating Password...' : 'Update Admin Password'}</span>
            </button>
          </div>

          {passwordStatus && (
            <div
              className={`p-4 rounded-xl text-xs font-bold text-center border ${
                passwordStatus.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                  : 'bg-red-500/10 text-red-400 border-red-500/25'
              }`}
            >
              {passwordStatus.text}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
