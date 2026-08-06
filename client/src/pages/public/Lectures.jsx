import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaLock, FaPlayCircle, FaFileAlt, FaGraduationCap } from 'react-icons/fa'
import { GiAtom, GiDna1 } from 'react-icons/gi'
import { FaFlask } from 'react-icons/fa'
import { TbMathSymbols } from 'react-icons/tb'
import ScrollReveal from '../../components/animations/ScrollReveal'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import SpotlightCard from '../../components/ui/SpotlightCard'
import api from '../../services/api'

const subjects = [
  { name: 'All', icon: null },
  { name: 'Physics', icon: <GiAtom size={15} /> },
  { name: 'Chemistry', icon: <FaFlask size={14} /> },
  { name: 'Biology', icon: <GiDna1 size={15} /> },
  { name: 'Mathematics', icon: <TbMathSymbols size={15} /> },
  { name: 'English', icon: <FaFileAlt size={14} /> },
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
        if (activeType !== 'all') {
          // Mapping frontend type to backend mediaType
          if (activeType === 'video') params.append('mediaType', 'youtube') // Note: this might need adjustment if multiple video types exist, maybe backend should handle 'video' vs 'pdf'. Actually backend has `mediaType`. For now, we will just fetch all and filter or modify backend query.
          // Wait, the previous filter was frontend. Let's just pass `type=video` or `notes` and adjust backend if needed, OR we just use the query params. The backend uses `query.mediaType`.
        }
        
        // Actually, let's keep frontend filtering if the backend hasn't been fully adapted for "video" vs "pdf" mapping.
        // But with pagination we MUST use backend filtering. 
        // Let's pass the raw params.
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
    <>
      <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#082d1b] to-[#0E4429]">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-20 w-72 h-72 rounded-full blur-3xl bg-gold" />
        </div>
        <div className="section-container relative z-10">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto space-y-5 pt-4 sm:pt-6">
            <span className="badge badge-gold font-extrabold inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-full shadow-xs mx-auto">
              <FaPlayCircle size={12} className="text-[#D4A64A]" />
              <span>Learning Resources</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-white leading-tight text-center tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Video <span className="text-gradient-gold inline">Lectures</span> & Notes
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed text-white/90 font-medium">
              Access recorded lectures and study notes. Login to unlock full content.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="py-8 sticky top-[5rem] z-30 shadow-lg backdrop-blur-md bg-cream/95 border-b border-sage">
        <div className="section-container space-y-6">
          
          {/* Subject Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
            {subjects.map((s) => (
              <button
                key={s.name}
                onClick={() => setActiveSubject(s.name)}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm sm:text-base font-extrabold transition-all duration-200 shadow-sm ${
                  activeSubject === s.name
                    ? 'bg-[#147a4a] text-white border border-[#147a4a] shadow-md scale-105'
                    : 'bg-white text-[#1C2620] border border-[#DCE8DD] hover:bg-[#147a4a]/10 hover:text-[#147a4a]'
                }`}
              >
                {s.icon}
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          {/* Search Bar and Content Type Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2 border-t border-sage/60">
            <div className="relative flex-1 w-full max-w-xl">
              <FaSearch size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/50 pointer-events-none z-10" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lectures by title or topic..."
                className="w-full pl-12 pr-6 py-4 rounded-3xl border border-[#DCE8DD] bg-white text-base font-semibold text-charcoal focus:outline-none focus:border-[#147a4a] focus:ring-4 focus:ring-[#147a4a]/20 shadow-sm min-h-[56px]"
              />
            </div>
            
            <div className="flex rounded-3xl overflow-hidden shrink-0 border border-[#DCE8DD] p-2 bg-white gap-2 min-h-[56px] items-center shadow-sm w-full sm:w-auto justify-center">
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
                      ? 'bg-[#147a4a] text-white shadow-xs'
                      : 'text-charcoal-light hover:text-[#147a4a] hover:bg-cream-alt'
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
      <section className="section-padding bg-cream">
        <div className="section-container">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 h-64 flex flex-col justify-between animate-pulse bg-white/50">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="h-6 bg-emerald-100 rounded-full w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <FaPlayCircle size={40} className="mx-auto text-[#147a4a]/40" />
              <h3 className="text-xl font-bold text-[#0E4429]">
                {lectures.length === 0 ? 'No Lectures Published Yet' : 'No Matching Lectures Found'}
              </h3>
              <p className="text-sm text-[#3a4a40]">
                {lectures.length === 0
                  ? 'Lectures will appear here once published by faculty.'
                  : 'Try changing filters or clearing your search.'}
              </p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((lecture, i) => (
                <StaggerItem key={lecture._id || i}>
                  <SpotlightCard className="card group relative overflow-hidden h-full flex flex-col justify-between p-6!">
                    {lecture.isLocked ? (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 text-center bg-emerald-dark/95 backdrop-blur-md">
                        <FaLock size={32} className="mb-3 text-gold" />
                        <p className="text-white font-extrabold text-base mb-4">Login to Access</p>
                        <Link to="/login" className="btn-gold text-xs font-extrabold px-5 py-2.5"><span>Login Now</span></Link>
                      </div>
                    ) : (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 p-6 text-center bg-emerald-dark/90 backdrop-blur-sm">
                        <FaPlayCircle size={36} className="mb-3 text-white" />
                        <a href={lecture.mediaUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs font-extrabold px-5 py-2.5 shadow-md">
                          <span>{lecture.mediaType === 'pdf' ? 'View Notes' : 'Watch Video'}</span>
                        </a>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                              lecture.mediaType !== 'pdf' ? 'bg-emerald-primary/10 text-emerald-primary border-emerald-primary/20' : 'bg-gold/15 text-gold-dark border-gold/30'
                            }`}>
                            {lecture.mediaType !== 'pdf' ? '🎥 Video' : '📄 Notes'}
                          </span>
                          {!lecture.isLocked && lecture.isPublicPreview && (
                            <span className="badge badge-emerald text-[10px] uppercase font-black tracking-widest bg-emerald-100 text-emerald-700">Demo</span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-charcoal-light">{lecture.chapter || ''}</span>
                      </div>
                      <h3 className="font-extrabold text-lg mb-2 leading-snug text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>{lecture.title}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-sage">
                      <span className="badge badge-emerald text-xs font-bold">{lecture.subject}</span>
                      <span className="text-xs font-bold text-charcoal-light">{lecture.grade ? `Grade ${lecture.grade}` : ''}</span>
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-sage bg-white text-emerald-dark font-bold disabled:opacity-50 hover:bg-cream-alt transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1 mx-2">
                {[...Array(totalPages)].map((_, idx) => {
                  const p = idx + 1;
                  // Show current, first, last, and neighbors
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${
                          page === p
                            ? 'bg-emerald-primary text-white shadow-md'
                            : 'bg-white text-charcoal border border-sage hover:bg-cream-alt'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  }
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-charcoal-light font-bold px-1">...</span>
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl border border-sage bg-white text-emerald-dark font-bold disabled:opacity-50 hover:bg-cream-alt transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-cream-alt">
        <div className="section-container text-center">
          <ScrollReveal className="flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-primary/10 border border-emerald-primary/20 flex items-center justify-center mx-auto mb-4 text-emerald-primary">
              <FaLock size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-center text-emerald-dark" style={{ fontFamily: 'var(--font-heading)' }}>
              Full Access for Enrolled Students
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto text-center text-charcoal-light">
              Register and get approved to access all video lectures, downloadable notes, and online practice tests.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-5">
              <Link to="/register" className="btn-gold text-base shadow-md">
                <FaGraduationCap size={18} />
                <span>Register Now</span>
              </Link>
              <Link to="/login" className="btn-outline text-base">
                <span>Login</span>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
