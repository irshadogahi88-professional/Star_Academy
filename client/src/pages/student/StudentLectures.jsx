import { useState, useEffect } from 'react'
import { Search, Play, Download, FileText, BookOpen } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import api from '../../services/api'

const subjects = ['All', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'English']

export default function StudentLectures() {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState('All')
  const [activeType, setActiveType] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await api.get('/lectures')
        if (res.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.lectures || []
          setLectures(list)
        }
      } catch (err) {
        console.error('Failed to fetch lectures:', err)
      }
      setLoading(false)
    }
    fetchLectures()
  }, [])

  const getEmbedUrl = (url, mediaType) => {
    if (!url) return null
    
    if (mediaType === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)
      if (match && match[2].length === 11) {
        videoId = match[2]
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url
    }
    
    if (mediaType === 'gdrive' || url.includes('drive.google.com')) {
      let embedUrl = url.replace(/\/view\??.*/, '/preview').replace(/\/edit\??.*/, '/preview')
      if (!embedUrl.endsWith('/preview') && embedUrl.includes('/d/')) {
        const parts = embedUrl.split('/d/')
        if (parts[1]) {
          const fileId = parts[1].split('/')[0]
          embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
        }
      }
      return embedUrl
    }
    
    return url
  }

  const filtered = lectures.filter((item) => {
    if (activeSubject !== 'All' && item.subject !== activeSubject) return false
    const isVideo = item.mediaType !== 'pdf'
    if (activeType === 'video' && !isVideo) return false
    if (activeType === 'notes' && isVideo) return false
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">
            Lectures & Study Notes
          </h1>
          <p className="text-sm text-emerald-100/70 font-semibold mt-1">
            Access unlocked recorded video sessions and official PDF notes for your grade.
          </p>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="card-glass !p-4 bg-[#0a1b14]/50 border border-[#10b981]/15 space-y-4 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex-shrink-0 transition-all border ${
                activeSubject === sub
                  ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-sm'
                  : 'bg-[#060e0a] text-emerald-100/70 border-[#10b981]/15 hover:bg-[#10b981]/10 hover:text-emerald-400'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic or chapter..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[#060e0a] border border-[#10b981]/25 text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>
          <div className="flex rounded-xl overflow-hidden border border-[#10b981]/15 p-1 bg-[#060e0a] gap-1 flex-shrink-0">
            {[{ key: 'all', label: 'All' }, { key: 'video', label: '🎥 Videos' }, { key: 'notes', label: '📄 Notes' }].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveType(t.key)}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                  activeType === t.key ? 'bg-emerald-500 text-emerald-950' : 'text-emerald-100/50 hover:text-emerald-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <StaggerItem key={item._id || item.id}>
            <div className="card-glass !p-6 flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/30 transition-all h-full rounded-2xl">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge badge-emerald text-xs">{item.subject}</span>
                  <span className="text-xs font-bold text-emerald-100/50">{item.chapter}</span>
                </div>
                <h3 className="font-extrabold text-lg text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-emerald-100/60 font-semibold">
                  {item.mediaType !== 'pdf' ? '🎥 Video Lecture' : '📄 Study Notes'} • {item.grade ? `Grade ${item.grade}` : ''}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#10b981]/15">
                {item.mediaType !== 'pdf' ? (
                  <button
                    onClick={() => setSelectedVideo(item)}
                    className="btn-primary w-full text-xs !py-2.5 justify-center"
                  >
                    <Play size={10} />
                    <span>Play Video Lecture</span>
                  </button>
                ) : (
                  <a
                    href={item.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold w-full text-xs !py-2.5 justify-center"
                  >
                    <Download size={10} />
                    <span>Download PDF Notes</span>
                  </a>
                )}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0a1b14] text-white rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-[#10b981]/15">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">
                {selectedVideo.title}
              </h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-3 py-1 bg-[#060e0a] text-emerald-400 border border-[#10b981]/15 rounded-lg hover:text-emerald-300 hover:bg-[#0a1b14]/50 text-xs font-bold"
              >
                Close ✖
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl bg-black border border-[#10b981]/10 overflow-hidden shadow-inner">
              {selectedVideo.mediaUrl ? (
                <iframe
                  src={getEmbedUrl(selectedVideo.mediaUrl, selectedVideo.mediaType)}
                  title={selectedVideo.title}
                  className="w-full h-full absolute inset-0 border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-center p-6 space-y-3 flex flex-col items-center justify-center h-full">
                  <Play size={48} className="text-amber-500" />
                  <p className="font-extrabold text-lg text-white">No stream URL provided.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-100/70 font-semibold">
              <span>Chapter: {selectedVideo.chapter}</span>
              <span>Subject: {selectedVideo.subject} • Grade {selectedVideo.grade || 'XI/XII'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
