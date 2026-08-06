import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { 
  LayoutDashboard, 
  Video, 
  HelpCircle, 
  PlusCircle, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  UserCheck,
  FileText,
  Home
} from 'lucide-react'

const navItems = [
  { name: 'Overview', path: '/teacher', icon: <LayoutDashboard size={18} /> },
  { name: 'Manage Lectures', path: '/teacher/lectures', icon: <Video size={18} /> },
  { name: 'MCQ Question Bank', path: '/teacher/mcq', icon: <HelpCircle size={18} /> },
  { name: 'Manage Tests', path: '/teacher/tests', icon: <FileText size={18} /> },
  { name: 'Create New Test', path: '/teacher/tests/create', icon: <PlusCircle size={18} /> },
  { name: 'Class Results', path: '/teacher/results', icon: <BarChart3 size={18} /> },
]

export default function TeacherLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const teacher = user || {
    fullName: 'Sir Irshad Ahmed Ogahi',
    email: 'director@staracademy.edu.pk',
    role: 'Director / Senior Faculty',
    subject: 'Physics',
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#060e0a] text-emerald-100 flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#060e0a] border-r border-[#10b981]/15 text-white flex-shrink-0 min-h-screen sticky top-0 z-50">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#10b981]/15 flex items-center gap-3">
          <img src="/images/logo.png" alt="Star Academy Logo" className="h-10 w-10 rounded-full border-2 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]" />
          <div>
            <h2 className="font-black text-base leading-tight text-white">
              Star Academy
            </h2>
            <p className="text-[10px] font-extrabold tracking-widest text-amber-500 uppercase mt-0.5">
              Teacher Portal
            </p>
          </div>
        </div>

        {/* Teacher Profile Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-[#0a1b14]/50 border border-[#10b981]/15 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 font-black text-base flex items-center justify-center shadow-xs flex-shrink-0">
              {teacher.fullName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-white truncate leading-tight">{teacher.fullName}</p>
              <p className="text-xs text-amber-500 font-semibold truncate capitalize mt-0.5">
                {teacher.role}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#10b981]/10 flex items-center justify-between text-xs">
            <span className="text-emerald-100/50 text-[11px] font-bold">Faculty Role:</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <UserCheck size={10} /> Faculty Admin
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 flex flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-extrabold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500 text-emerald-950 shadow-lg border border-emerald-400/20'
                    : 'text-emerald-100/70 hover:bg-[#10b981]/10 hover:text-emerald-400'
                }`}
              >
                <span className={isActive ? 'text-emerald-950' : 'text-emerald-100/50'}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-[#10b981]/15 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-extrabold border border-emerald-500/10 text-sm transition-all duration-200"
          >
            <Home size={16} />
            <span>Website Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-extrabold text-sm shadow-md transition-all duration-200"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-[#060e0a] border-b border-[#10b981]/15 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <Link to="/teacher" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-8 rounded-full border border-amber-500" />
          <span className="font-bold text-sm text-white">Faculty Portal</span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
        >
          {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fadeIn">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="relative z-10 w-72 max-w-[80vw] bg-[#060e0a] border-r border-[#10b981]/15 text-white flex flex-col justify-between p-4 shadow-2xl">
            <div>
              <div className="p-4 border-b border-[#10b981]/15 flex items-center gap-3 mb-4">
                <img src="/images/logo.png" alt="Star Logo" className="h-9 w-9 rounded-full border border-amber-500" />
                <div>
                  <h3 className="font-bold text-sm text-white">Star Academy</h3>
                  <p className="text-[10px] text-amber-500 uppercase font-bold">Faculty Portal</p>
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
                        isActive ? 'bg-emerald-500 text-emerald-950' : 'text-emerald-100/70 hover:bg-emerald-500/10'
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 font-bold text-sm transition-all duration-200"
              >
                <Home size={16} />
                <span>Website Home</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-sm shadow-md transition-all duration-200"
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
