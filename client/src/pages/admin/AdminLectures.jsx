import { useState, useEffect } from 'react'
import { FaVideo, FaPlus, FaTrashAlt, FaCheck, FaSearch, FaExternalLinkAlt, FaFilePdf } from 'react-icons/fa'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import api from '../../services/api'

export default function AdminLectures() {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Physics',
    grade: 'XI',
    mediaType: 'youtube',
    mediaUrl: '',
    description: '',
    isPublicPreview: false,
  })

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLectures = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15'
      })
      if (searchTerm) params.append('search', searchTerm)

      const res = await api.get(`/lectures?${params.toString()}`)
      if (res.data.success) {
        setLectures(res.data.data)
        if (res.data.pagination) setTotalPages(res.data.pagination.pages)
      }
    } catch (err) {
      console.error('Error fetching lectures:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLectures()
  }, [page, searchTerm])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/lectures', formData)
      if (res.data.success) {
        setLectures([res.data.data, ...lectures])
        setShowModal(false)
        setStatusMsg('✅ Lecture uploaded successfully!')
        setTimeout(() => setStatusMsg(null), 3000)
        setFormData({ title: '', subject: 'Physics', grade: 'XI', mediaType: 'youtube', mediaUrl: '', description: '', isPublicPreview: false })
      }
    } catch (err) {
      alert('Failed to save lecture: ' + err.response?.data?.message || err.message)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await api.delete(`/lectures/${id}`)
        setLectures(lectures.filter((l) => l._id !== id))
        setStatusMsg('✅ Lecture deleted successfully!')
        setTimeout(() => setStatusMsg(null), 3000)
      } catch (err) {
        alert('Failed to delete lecture: ' + err.message)
      }
    }
  }

  const filtered = lectures

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1">
            <FaVideo size={12} /> Resource Manager
          </span>
          <h1 className="text-3xl font-black text-[#0E4429] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
            Video Lectures
          </h1>
          <p className="text-xs text-[#3a4a40]">Upload educational video links and notes for students.</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-primary text-xs !py-3 !px-4 shadow-sm">
          <FaPlus size={12} />
          <span>Add New Lecture</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs flex items-center gap-2">
          <FaCheck size={14} className="text-emerald-700" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="card !p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a4a40]/60" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lectures by title or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCE8DD] text-xs font-semibold focus:outline-none focus:border-[#147a4a]"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card !p-5 flex flex-col gap-4 animate-pulse bg-white/60">
              <div className="flex justify-between items-start">
                <div className="h-5 bg-emerald-100 rounded-full w-20"></div>
                <div className="h-6 w-6 bg-red-100 rounded-md"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <div className="h-4 bg-emerald-100 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lecture) => (
            <StaggerItem key={lecture._id}>
              <div className="card !p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-gold text-[10px]">{lecture.subject}</span>
                    {lecture.isPublicPreview && (
                      <span className="badge badge-emerald text-[10px] uppercase font-black tracking-widest bg-emerald-100 text-emerald-700">Demo</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(lecture._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                    <FaTrashAlt size={12} />
                  </button>
                </div>
                <h3 className="font-bold text-[#0E4429] text-base leading-tight">{lecture.title}</h3>
                <p className="text-xs text-[#3a4a40] font-semibold">Grade: {lecture.grade}</p>
                
                <div className="mt-auto pt-4 border-t border-[#DCE8DD]">
                  <a href={lecture.mediaUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#147a4a] hover:underline flex items-center gap-1.5">
                    <FaVideo size={12} /> View {lecture.mediaType === 'pdf' ? 'Notes' : 'Video'} Link
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center p-10 text-[#3a4a40] font-bold">No lectures found.</div>
          )}
        </StaggerContainer>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-[#DCE8DD] bg-white text-[#0E4429] font-bold text-xs disabled:opacity-50 hover:bg-emerald-50 transition-colors"
          >
            Prev
          </button>
          
          <div className="flex items-center gap-1 mx-1">
            {[...Array(totalPages)].map((_, idx) => {
              const p = idx + 1;
              if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                      page === p
                        ? 'bg-[#147a4a] text-white shadow-sm'
                        : 'bg-white text-charcoal border border-[#DCE8DD] hover:bg-emerald-50'
                    }`}
                  >
                    {p}
                  </button>
                )
              }
              if (p === page - 2 || p === page + 2) {
                return <span key={p} className="text-charcoal-light font-bold px-1 text-xs">...</span>
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-[#DCE8DD] bg-white text-[#0E4429] font-bold text-xs disabled:opacity-50 hover:bg-emerald-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-lg !p-6 sm:!p-8 space-y-5 bg-white">
            <h2 className="text-2xl font-bold text-[#0E4429]" style={{ fontFamily: 'var(--font-heading)' }}>
              Upload Lecture
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#DCE8DD] text-sm focus:outline-none focus:border-[#147a4a]" placeholder="e.g. Intro to Vectors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">Subject</label>
                  <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#DCE8DD] text-sm font-semibold focus:outline-none focus:border-[#147a4a]">
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="LR">LR</option>
                    <option value="All">All</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">Grade</label>
                  <select value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#DCE8DD] text-sm font-semibold focus:outline-none focus:border-[#147a4a]">
                    <option value="IX">IX</option>
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">Media Type</label>
                  <select value={formData.mediaType} onChange={(e) => setFormData({...formData, mediaType: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#DCE8DD] text-sm font-semibold focus:outline-none focus:border-[#147a4a]">
                    <option value="youtube">YouTube Video</option>
                    <option value="gdrive">Google Drive Video</option>
                    <option value="pdf">PDF Notes</option>
                    <option value="other">Other Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">Media URL</label>
                  <input required type="url" value={formData.mediaUrl} onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[#DCE8DD] text-sm focus:outline-none focus:border-[#147a4a]" placeholder="https://..." />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-cream-alt p-3 rounded-xl border border-[#DCE8DD]">
                <input 
                  type="checkbox" 
                  id="demo-mode"
                  checked={formData.isPublicPreview} 
                  onChange={(e) => setFormData({...formData, isPublicPreview: e.target.checked})} 
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="demo-mode" className="text-xs font-bold text-[#0E4429] cursor-pointer select-none">
                  Set as Public Demo
                  <span className="block text-[10px] text-[#3a4a40] font-semibold mt-0.5">Allows non-registered students to view this lecture on the public website.</span>
                </label>
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-[#3a4a40] border border-[#DCE8DD]">Cancel</button>
                <button type="submit" className="btn-primary text-xs !py-2 !px-5 shadow-sm">Save Lecture</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
