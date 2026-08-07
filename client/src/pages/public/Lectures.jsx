import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Lock, PlayCircle, FileText, GraduationCap, Atom, Beaker, Dna, HelpCircle } from 'lucide-react'
import ScrollReveal from '../../components/animations/ScrollReveal'
import PageTransition from '../../components/animations/PageTransition'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import SpotlightCard from '../../components/ui/SpotlightCard'
import api from '../../services/api'

const subjects = [
  { name: 'All', icon: null },
  { name: 'Physics', icon: <Atom size={15} /> },
  { name: 'Chemistry', icon: <Beaker size={14} /> },
  { name: 'Biology', icon: <Dna size={15} /> },
  { name: 'Mathematics', icon: <FileText size={15} /> },
  { name: 'English', icon: <FileText size={14} /> },
]

export default function Lectures() {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState('All')
  const [activeType, setActiveType] = useState('all')
  const [search, setSearch] = useState('')

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchLectures = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '15'
        })
        if (activeSubject !== 'All') params.append('subject', activeSubject)
        if (search) params.append('search', search)

        const res = await api.get(`/lectures?${params.toString()}`)
        if (res.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.lectures || []
          setLectures(list)
          if (res.data.pagination) setTotalPages(res.data.pagination.pages)
        }
      } catch (err) {
        console.error('Failed to fetch lectures:', err)
      }
      setLoading(false)
    }
    fetchLectures()
  }, [page, activeSubject, search])

  // Frontend filtering for mediaType since backend uses specific enums (youtube, gdrive vs pdf)
  const filtered = lectures.filter((l) => {
    if (activeType === 'video' && l.mediaType === 'pdf') return false
    if (activeType === 'notes' && l.mediaType !== 'pdf') return false
    return true
  })

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [activeSubject, search])

  return (
    <PageTransition>
      {/* Page Header */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden bg-gradient-to-br from-[#060e0a] to-[#08140f]">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-20 w-72 h-72 rounded-full blur-3xl bg-amber-500/10" />
        </div>
        <div className="section-container relative z-10">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto space-y-5 pt-4 sm:pt-6">
            <span className="badge badge-gold font-extrabold inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-full shadow-xs mx-auto">
              <PlayCircle size={12} className="text-amber-500" />
              <span>Learning Resources</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-white leading-tight text-center tracking-tight">
              Video <span className="text-gradient-gold inline">Lectures</span> & Notes
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed text-emerald-100/70 font-semibold">
              Access recorded lectures and study notes. Login to unlock full content.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="py-8 sticky top-[5.25rem] sm:top-[6rem] z-30 shadow-lg backdrop-blur-md bg-[#060e0a]/90 border-b border-[#10b981]/15">
        <div className="section-container space-y-6">
          
          {/* Subject Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
            {subjects.map((s) => (
              <button
                key={s.name}
                onClick={() => setActiveSubject(s.name)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold transition-all duration-200 shadow-sm border ${
                  activeSubject === s.name
                    ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-md scale-105'
                    : 'bg-[#0a1b14]/75 text-emerald-100 border-[#10b981]/25 hover:bg-[#10b981]/15 hover:text-emerald-400'
                }`}
              >
                {s.icon}
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          {/* Search Bar and Content Type Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2 border-t border-[#10b981]/15">
            <div className="relative flex-1 w-full max-w-xl">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-100/60 pointer-events-none z-10" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lectures by title or topic..."
                className="w-full pl-12 pr-6 py-4 rounded-3xl border border-[#10b981]/30 bg-[#0a1b14] text-base font-semibold text-emerald-100 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 shadow-sm min-h-[56px]"
              />
            </div>
            
            <div className="flex rounded-3xl overflow-hidden shrink-0 border border-[#10b981]/20 p-2 bg-[#0a1b14] gap-2 min-h-[56px] items-center shadow-sm w-full sm:w-auto justify-center">
              {[
                { key: 'all', label: 'All Content' },
                { key: 'video', label: '🎥 Videos' },
                { key: 'notes', label: '📄 Notes' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveType(t.key)}
                  className={`px-5 py-2.5 text-sm sm:text-base font-black rounded-2xl transition-all duration-200 ${
                    activeType === t.key
                      ? 'bg-emerald-500 text-emerald-950 shadow-xs'
                      : 'text-emerald-100/70 hover:text-emerald-400 hover:bg-[#060e0a]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Lectures Grid */}
      <section className="section-padding bg-[#08140f]">
        <div className="section-container">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card-glass p-6 h-64 flex flex-col justify-between animate-pulse bg-[#0a1b14]/30 border border-[#10b981]/15">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="h-6 bg-emerald-950/60 border border-[#10b981]/10 rounded-full w-24"></div>
                      <div className="h-4 bg-emerald-950/40 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-emerald-950/40 rounded w-3/4"></div>
                    <div className="h-4 bg-emerald-950/40 rounded w-1/2"></div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-[#10b981]/10">
                    <div className="h-5 bg-emerald-950/40 rounded w-20"></div>
                    <div className="h-4 bg-emerald-950/40 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <PlayCircle size={40} className="mx-auto text-emerald-500/40" />
              <h3 className="text-xl font-bold text-white">
                {lectures.length === 0 ? 'No Lectures Published Yet' : 'No Matching Lectures Found'}
              </h3>
              <p className="text-sm text-emerald-100/50">
                {lectures.length === 0
                  ? 'Lectures will appear here once published by faculty.'
                  : 'Try changing filters or clearing your search.'}
              </p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((lecture, i) => {
                const isLocked = lecture.isLocked || !lecture.isPublicPreview
                return (
                <StaggerItem key={lecture._id || i}>
                  <SpotlightCard className="card-glass group relative overflow-hidden h-full flex flex-col justify-between p-6 bg-[#0a1b14]/50 border border-[#10b981]/15">
                    {/* Hover Overlay (Desktop only) */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 text-center bg-[#060e0a]/95 backdrop-blur-md hidden md:flex">
                      {isLocked ? (
                        <>
                          <Lock size={32} className="mb-2 text-amber-500" />
                          <p className="text-white font-extrabold text-sm mb-1">Locked Content</p>
                          <p className="text-emerald-100/60 text-xs mb-4">Register or Login to view full lecture</p>
                          <div className="flex gap-2">
                            <Link to="/register" className="btn-gold text-xs font-extrabold px-4 py-2"><span>Register</span></Link>
                            <Link to="/login" className="px-4 py-2 rounded-xl border border-[#10b981]/25 text-emerald-400 hover:text-white text-xs font-extrabold"><span>Login</span></Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <PlayCircle size={36} className="mb-3 text-white" />
                          <a href={lecture.mediaUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs font-extrabold px-5 py-2.5 shadow-md">
                            <span>{lecture.mediaType === 'pdf' ? 'View Notes' : 'Watch Video'}</span>
                          </a>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col justify-between h-full w-full">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                                lecture.mediaType !== 'pdf' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                              {lecture.mediaType !== 'pdf' ? '🎥 Video' : '📄 Notes'}
                            </span>
                            {!isLocked ? (
                              <span className="badge badge-emerald text-[10px] uppercase font-black tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Demo</span>
                            ) : (
                              <span className="badge badge-gold text-[10px] uppercase font-black tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">Locked</span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-emerald-100/50">{lecture.chapter || ''}</span>
                        </div>
                        <h3 className="font-extrabold text-lg mb-2 leading-snug text-white capitalize">{lecture.title}</h3>
                      </div>

                      <div className="w-full">
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#10b981]/10 mb-4">
                          <span className="badge badge-emerald text-xs font-bold">{lecture.subject}</span>
                          <span className="text-xs font-bold text-emerald-100/50">{lecture.grade ? `Grade ${lecture.grade}` : ''}</span>
                        </div>

                        {/* Mobile Action Button */}
                        <div className="block md:hidden">
                          {isLocked ? (
                            <Link to="/register" className="btn-gold w-full text-xs font-extrabold py-3 justify-center flex items-center gap-1.5">
                              <Lock size={12} className="text-[#060e0a]" />
                              <span>Register to Unlock</span>
                            </Link>
                          ) : (
                            <a href={lecture.mediaUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-xs font-extrabold py-3 justify-center flex items-center gap-1.5">
                              <PlayCircle size={12} className="text-[#060e0a]" />
                              <span>{lecture.mediaType === 'pdf' ? 'View Notes' : 'Watch Video'}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              )})}
            </StaggerContainer>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-[#10b981]/15 bg-[#0a1b14] text-emerald-100 font-bold disabled:opacity-50 hover:bg-[#08140f] transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1 mx-2">
                {[...Array(totalPages)].map((_, idx) => {
                  const p = idx + 1;
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${
                          page === p
                            ? 'bg-emerald-500 text-emerald-950 shadow-md'
                            : 'bg-[#0a1b14] text-emerald-100 border border-[#10b981]/15 hover:bg-[#08140f]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-emerald-100/40 font-bold px-1">...</span>
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-[#10b981]/15 bg-[#0a1b14] text-emerald-100 font-bold disabled:opacity-50 hover:bg-[#08140f] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-[#0a1b14]">
        <div className="section-container text-center">
          <ScrollReveal className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Lock size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-center text-white">
              Full Access for Enrolled Students
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto text-center text-emerald-100/60 font-semibold">
              Register and get approved to access all video lectures, downloadable notes, and online practice tests.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-5">
              <Link to="/register" className="btn-gold text-base shadow-md">
                <GraduationCap size={18} />
                <span>Register Now</span>
              </Link>
              <Link to="/login" className="btn-outline text-base">
                <span>Login</span>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  )
}
