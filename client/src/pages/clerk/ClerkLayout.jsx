import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { Home, Users, Receipt, Trophy, Settings, LogOut, Menu, X, Shield, UserCheck } from 'lucide-react'

const navItems = [
  { name: 'Clerk Overview', path: '/clerk', icon: <Home size={18} /> },
  { name: 'Student Approval Queue', path: '/clerk/students', icon: <Users size={18} /> },
  { name: 'Fee Challans & Receipts', path: '/clerk/challans', icon: <Receipt size={18} /> },
  { name: 'Success Stories Manager', path: '/clerk/success-stories', icon: <Trophy size={18} /> },
  { name: 'Settings', path: '/clerk/settings', icon: <Settings size={18} /> },
]

export default function ClerkLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const clerkUser = user || {
    fullName: 'Academy Office Clerk',
    email: 'clerk@staracademy.edu.pk',
    role: 'clerk',
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#060e0a] text-emerald-100 flex flex-col lg:flex-row relative">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0a1b14]/60 border-r border-[#10b981]/15 text-white flex-shrink-0 min-h-screen sticky top-0 z-50 backdrop-blur-md">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#10b981]/15 flex items-center gap-3">
          <img src="/images/logo.png" alt="Star Academy Logo" className="h-10 w-10 rounded-full border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]" />
          <div>
            <h2 className="font-black text-base leading-tight text-white">
              Star Academy
            </h2>
            <p className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase mt-0.5">
              Clerk Desk Portal
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-[#060e0a]/50 border border-[#10b981]/15 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black text-base flex items-center justify-center shadow-xs flex-shrink-0">
              {clerkUser.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-white truncate leading-tight">{clerkUser.fullName}</p>
              <p className="text-xs text-amber-400/80 font-bold truncate capitalize mt-0.5">
                Front Office Clerk
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#10b981]/10 flex items-center justify-between text-xs">
            <span className="text-emerald-100/60 text-[11px] font-semibold">Role:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
              <Shield size={10} /> Official Staff
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-md border border-emerald-500/20'
                    : 'text-emerald-100/70 hover:bg-emerald-500/5 hover:text-emerald-300'
                }`}
              >
                <span className={isActive ? 'text-amber-400' : 'text-emerald-100/50'}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#10b981]/15 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/5 border border-[#10b981]/10 hover:bg-emerald-500/10 text-emerald-400 font-bold text-sm transition-all duration-200"
          >
            <Home size={16} />
            <span>Website Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 font-bold text-sm shadow-md transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-[#0a1b14] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#10b981]/15">
        <Link to="/clerk" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-8 rounded-full border border-amber-500/40" />
          <span className="font-bold text-sm text-white">Clerk Desk</span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-10 w-72 max-w-[80vw] bg-[#0a1b14] text-white flex flex-col justify-between p-4 border-r border-[#10b981]/15 shadow-2xl">
            <div>
              <div className="p-4 border-b border-[#10b981]/15 flex items-center gap-3 mb-4">
                <img src="/images/logo.png" alt="Star Logo" className="h-9 w-9 rounded-full border border-amber-500/40" />
                <div>
                  <h3 className="font-bold text-sm text-white">Star Academy</h3>
                  <p className="text-[10px] text-amber-400 uppercase font-bold">Clerk Desk</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
                        isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-emerald-100/70 hover:bg-emerald-500/5'
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="mt-6 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/5 border border-[#10b981]/10 hover:bg-emerald-500/10 text-emerald-400 font-bold text-sm transition-all duration-200"
              >
                <Home size={16} />
                <span>Website Home</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 font-bold text-sm shadow-md transition-all duration-200"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
