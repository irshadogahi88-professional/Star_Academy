import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'
import { LogIn, GraduationCap, Menu, X, MessageCircleCode } from 'lucide-react'
import api from '../../services/api'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Faculty', path: '/faculty' },
  { name: 'Success Wall', path: '/success-stories' },
  { name: 'Lectures', path: '/lectures' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()
  const [marquee, setMarquee] = useState('')

  useEffect(() => {
    api.get('/settings').then(res => {
      if (res.data?.success && res.data?.data?.marqueeText) {
        setMarquee(res.data.data.marqueeText)
      }
    }).catch(() => {})
  }, [])

  const getPortalLink = () => {
    if (!user) return { path: '/login', label: 'Login' }
    if (user.role === 'admin' || user.role === 'director') return { path: '/admin', label: 'Admin Portal' }
    if (user.role === 'clerk') return { path: '/clerk', label: 'Clerk Desk' }
    if (user.role === 'teacher') return { path: '/teacher', label: 'Teacher Portal' }
    return { path: '/dashboard', label: 'My Dashboard' }
  }

  const portal = getPortalLink()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location])

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none">
        {marquee && (
          <div className="w-full bg-[#10b981]/15 border-b border-[#10b981]/30 backdrop-blur-md text-[#34d399] text-[11px] sm:text-xs font-bold py-2 px-4 overflow-hidden whitespace-nowrap pointer-events-auto">
            <div className="animate-marquee inline-block">
              {marquee}
            </div>
          </div>
        )}
      </div>

      <header
        className={`fixed left-4 right-4 sm:left-6 sm:right-6 z-40 transition-all duration-500 ease-in-out rounded-2xl border pointer-events-auto ${
          isScrolled
            ? 'bg-[#060e0a]/80 backdrop-blur-[24px] border-[#10b981]/25 shadow-2xl py-3'
            : 'bg-transparent border-[#10b981]/10 py-5 sm:py-6'
        }`}
        style={{ 
          top: marquee ? '36px' : '16px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6" style={{ minHeight: '3.5rem' }}>
          
          {/* Left Section: Logo & Brand */}
          <div className="flex-1 flex items-center justify-start min-w-0">
            <Link to="/" className="flex items-center gap-3.5 group shrink-0">
              <div className="relative">
                <img
                  src="/images/logo.png"
                  alt="Star Educational Academy Logo"
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#060e0a] rounded-full" />
              </div>
              <div className="flex flex-col justify-center">
                <h1
                  className="text-base sm:text-lg font-black leading-none text-white tracking-wide group-hover:text-emerald-400 transition-colors"
                >
                  Star Educational
                </h1>
                <p className="text-[10px] font-black tracking-widest uppercase mt-1 text-amber-500/90">
                  Academy • Ghotki
                </p>
              </div>
            </Link>
          </div>

          {/* Center Section: Navigation Links */}
          <div className="hidden lg:flex items-center justify-center shrink-0">
            <nav className="flex items-center gap-2 bg-[#060e0a]/70 px-4 py-2 rounded-xl border border-[#10b981]/15 backdrop-blur-xl shadow-lg">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 flex items-center justify-center whitespace-nowrap ${
                      isActive
                        ? 'text-[#060e0a] font-bold'
                        : 'text-emerald-100/80 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg shadow-md z-0"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Section: Actions */}
          <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <a
                href="https://wa.me/923083309704"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-[#060e0a] transition-all duration-300 shadow-lg group"
                title="Official WhatsApp"
              >
                <MessageCircleCode size={18} className="transition-transform group-hover:scale-110" />
              </a>

              <Link
                to={portal.path}
                className="h-10 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#060e0a] border border-emerald-500/20 text-emerald-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 whitespace-nowrap"
              >
                <LogIn size={14} />
                <span>{portal.label}</span>
              </Link>

              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="h-10 px-4.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-[#060e0a] font-extrabold text-xs sm:text-sm hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <GraduationCap size={16} />
                  <span>Admission 2026</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-[#060e0a] transition-all border border-emerald-500/30 shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[#060e0a] border-l border-[#10b981]/15 text-white shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button Header */}
              <div className="absolute top-5 right-5 z-20">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-[#060e0a] border border-emerald-500/30 transition-all cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 pt-24 overflow-y-auto">
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[#10b981]/15">
                  <img src="/images/logo.png" alt="SEA Logo" className="h-11 w-11 rounded-full border-2 border-amber-500" />
                  <div>
                    <p className="font-black text-base text-white">
                      Star Educational
                    </p>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Academy • Ghotki</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`px-4 py-3 rounded-xl text-base font-bold transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-amber-500 text-[#060e0a] shadow-lg'
                            : 'text-emerald-100/80 hover:bg-emerald-500/10'
                        }`}
                      >
                        <span>{link.name}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-[#060e0a]" />}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="p-6 border-t border-[#10b981]/15 flex flex-col gap-3 bg-[#0a1b14]/90">
                <Link
                  to={portal.path}
                  className="w-full text-center py-3 rounded-xl border border-emerald-500/20 text-emerald-300 font-bold text-sm hover:bg-emerald-500/10 flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  <span>{portal.label}</span>
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="w-full text-center py-3 rounded-xl bg-amber-500 text-[#060e0a] font-extrabold text-sm hover:bg-amber-400 flex items-center justify-center gap-2 shadow-md"
                  >
                    <GraduationCap size={18} />
                    <span>Register for 2026</span>
                  </Link>
                )}
                <a
                  href="https://wa.me/923083309704"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-[#060e0a] text-sm font-extrabold bg-emerald-400 hover:bg-emerald-300 shadow-lg"
                >
                  <MessageCircleCode size={18} />
                  <span>Official WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
