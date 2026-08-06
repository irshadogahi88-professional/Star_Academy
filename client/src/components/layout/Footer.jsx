import { Link } from 'react-router-dom'
import { GraduationCap, Phone, MapPin, ShieldAlert, Heart } from 'lucide-react'
import { FaFacebookF, FaInstagram } from 'react-icons/fa'

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Faculty', path: '/faculty' },
  { name: 'Success Stories', path: '/success-stories' },
  { name: 'Lectures', path: '/lectures' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact Us', path: '/contact' },
]

const programLinks = [
  { name: 'Pre-Medical Track (MDCAT)', path: '/about' },
  { name: 'Pre-Engineering Track (ECAT)', path: '/about' },
  { name: 'Grade IX & X Coaching', path: '/about' },
  { name: 'Grade XI & XII Coaching', path: '/about' },
  { name: 'Video Lectures & Notes', path: '/lectures' },
  { name: 'Online Test System', path: '/login' },
]

export default function Footer() {
  return (
    <footer className="bg-[#060e0a] text-[#e2ede7] overflow-hidden relative border-t border-[#10b981]/15">
      {/* Session 2026 Announcement Banner */}
      <div className="py-3.5 bg-gradient-to-r from-amber-500/10 via-[#0a1e15] to-amber-500/10 text-amber-300 border-b border-[#10b981]/15">
        <div className="section-container flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
          <p className="font-extrabold text-sm sm:text-base flex items-center justify-center gap-2">
            <GraduationCap size={18} className="text-amber-400" />
            <span>Session 2026 Admissions Open — Classes Commence 10-08-2026</span>
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-1.5 px-4.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all hover:scale-105 shadow-md bg-amber-500 text-[#060e0a] hover:bg-amber-400 shrink-0"
          >
            <span>Apply Online</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="section-container py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Academy Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3.5">
              <img
                src="/images/logo.png"
                alt="Star Educational Academy Logo"
                className="h-14 w-14 rounded-full object-cover border-2 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              />
              <div>
                <h3 className="text-lg font-black text-white leading-tight">
                  Star Educational
                </h3>
                <p className="text-xs font-black tracking-wider uppercase text-amber-500">
                  Academy, Ghotki
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-emerald-100/70 font-medium">
              Where hardworking boys and girls build a bright and successful future through dedication and excellence. Premier coaching for Grades IX–XII.
            </p>

            {/* Premium Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://web.facebook.com/p/Star-Educational-Academy-Ghotki-100078502346228/?_rdc=1&_rdr#"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#08140f] border border-[#10b981]/20 text-[#e2ede7] hover:border-[#1877F2] hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-all duration-300 hover:-translate-y-1 shadow-md"
                aria-label="Facebook"
              >
                <FaFacebookF size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#08140f] border border-[#10b981]/20 text-[#e2ede7] hover:border-[#bc1888] hover:bg-[#bc1888]/10 hover:text-[#bc1888] transition-all duration-300 hover:-translate-y-1 shadow-md"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://wa.me/923083309704"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#08140f] border border-[#10b981]/20 text-[#e2ede7] hover:border-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-400 transition-all duration-300 hover:-translate-y-1 shadow-md"
                aria-label="WhatsApp"
              >
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-[#10b981]/15">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-500">
                Quick Links
              </h4>
            </div>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm font-semibold text-emerald-100/70 hover:text-amber-400 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]/30" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs Column */}
          <div>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-[#10b981]/15">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-500">
                Our Programs
              </h4>
            </div>
            <ul className="space-y-3.5">
              {programLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-sm font-semibold text-emerald-100/70 hover:text-amber-400 hover:translate-x-1.5 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]/30" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details Column */}
          <div>
            <div className="flex items-center gap-2 mb-6 pb-2 border-b border-[#10b981]/15">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-500">
                Contact Info
              </h4>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Director</p>
                <p className="text-sm text-white font-extrabold">Sir Irshad Ahmed Ogahi</p>
                <a href="tel:03083309704" className="inline-flex items-center gap-2 text-xs mt-1 transition-colors hover:text-amber-400 text-emerald-100/70 font-semibold">
                  <Phone size={11} className="text-amber-500" />
                  0308-3309704
                </a>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Administrator</p>
                <p className="text-sm text-white font-extrabold">Muhammad Jamil Arain</p>
                <a href="tel:03063004887" className="inline-flex items-center gap-2 text-xs mt-1 transition-colors hover:text-amber-400 text-emerald-100/70 font-semibold">
                  <Phone size={11} className="text-amber-500" />
                  0306-3004887
                </a>
              </div>
              <div className="pt-4 space-y-2 border-t border-[#10b981]/15">
                <div className="flex items-start gap-2 text-xs text-emerald-100/70 font-medium">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-amber-500" />
                  <a href="https://www.google.com/maps?daddr=2858%2BPJF,+Ghotki" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                    D.A.V. School, Ladies Bazaar, Ghotki
                  </a>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-100/70 font-medium">
                  <GraduationCap size={13} className="shrink-0 text-amber-500" />
                  <span>Class Timings: 3:15 PM – 7:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-[#10b981]/15 py-8 bg-[#050c08]">
        <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs font-bold text-emerald-100/50 flex items-center justify-center gap-1.5">
            <span>© {new Date().getFullYear()} Star Educational Academy. Made with</span>
            <Heart size={10} className="text-amber-500 fill-amber-500" />
            <span>in Ghotki.</span>
          </p>
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-black text-amber-500">
            <span>MDCAT 1st Position</span>
            <span className="opacity-40">•</span>
            <span>30+ MBBS/BDS Admissions</span>
            <span className="opacity-40">•</span>
            <span>100% Pre-Eng Success</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
