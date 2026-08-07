import { useState, useEffect } from 'react'
import { Video, Plus, Trash2, Check, Search, ExternalLink, Edit } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import api from '../../services/api'

export default function AdminLectures() {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)
  const [editingLectureId, setEditingLectureId] = useState(null)

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

  const resetForm = () => {
    setFormData({ title: '', subject: 'Physics', grade: 'XI', mediaType: 'youtube', mediaUrl: '', description: '', isPublicPreview: false })
    setEditingLectureId(null)
  }

  const handleEditClick = (lecture) => {
    setEditingLectureId(lecture._id)
    setFormData({
      title: lecture.title,
      subject: lecture.subject,
      grade: lecture.grade,
      mediaType: lecture.mediaType,
      mediaUrl: lecture.mediaUrl,
      description: lecture.description || '',
      isPublicPreview: lecture.isPublicPreview || false,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingLectureId) {
        const res = await api.put(`/lectures/${editingLectureId}`, formData)
        if (res.data.success) {
          setLectures(lectures.map((l) => l._id === editingLectureId ? res.data.data : l))
          setShowModal(false)
          setStatusMsg('✅ Lecture updated successfully!')
          setTimeout(() => setStatusMsg(null), 3000)
          resetForm()
        }
      } else {
        const res = await api.post('/lectures', formData)
        if (res.data.success) {
          setLectures([res.data.data, ...lectures])
          setShowModal(false)
          setStatusMsg('✅ Lecture uploaded successfully!')
          setTimeout(() => setStatusMsg(null), 3000)
          resetForm()
        }
      }
    } catch (err) {
      alert('Failed to save lecture: ' + (err.response?.data?.message || err.message))
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
    <div className="space-y-6 text-emerald-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Video size={12} /> Resource Manager
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Video Lectures
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">Upload educational video links and notes for students.</p>
        </div>

        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary text-xs !py-3 !px-4 shadow-sm flex items-center gap-2">
          <Plus size={12} />
          <span>Add New Lecture</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-extrabold text-xs flex items-center gap-2">
          <Check size={14} />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl !p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search lectures by title or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 !p-5 flex flex-col gap-4 animate-pulse rounded-3xl">
              <div className="flex justify-between items-start">
                <div className="h-5 bg-emerald-500/10 rounded-full w-20 border border-emerald-500/20"></div>
                <div className="h-6 w-6 bg-red-500/10 rounded-md"></div>
              </div>
              <div className="h-5 bg-[#060e0a] border border-[#10b981]/15 rounded w-3/4"></div>
              <div className="h-4 bg-[#060e0a] border border-[#10b981]/15 rounded w-1/3"></div>
              <div className="mt-auto pt-4 border-t border-[#10b981]/10">
                <div className="h-4 bg-emerald-500/10 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lecture) => (
            <StaggerItem key={lecture._id}>
              <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 transition-all rounded-3xl !p-5 flex flex-col gap-3 relative shadow-md">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-gold text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400">{lecture.subject}</span>
                    {lecture.isPublicPreview && (
                      <span className="badge badge-emerald text-[10px] uppercase font-black tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Demo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleEditClick(lecture)} className="text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded-md transition-colors" title="Edit Lecture">
                      <Edit size={12} />
                    </button>
                    <button onClick={() => handleDelete(lecture._id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-md transition-colors" title="Delete Lecture">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <h3 className="font-extrabold text-white text-base leading-tight">{lecture.title}</h3>
                <p className="text-xs text-emerald-100/70 font-semibold">Grade: {lecture.grade}</p>
                
                <div className="mt-auto pt-4 border-t border-[#10b981]/10">
                  <a href={lecture.mediaUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1.5">
                    <Video size={12} /> View {lecture.mediaType === 'pdf' ? 'Notes' : 'Video'} Link
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center p-10 text-emerald-100/50 font-bold">No lectures found.</div>
          )}
        </StaggerContainer>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-[#10b981]/25 bg-[#060e0a] text-emerald-100 font-bold text-xs disabled:opacity-30 hover:bg-[#0a1b14] transition-colors"
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
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm'
                        : 'bg-[#060e0a] text-emerald-100/60 border border-[#10b981]/25 hover:bg-[#0a1b14]'
                    }`}
                  >
                    {p}
                  </button>
                )
              }
              if (p === page - 2 || p === page + 2) {
                return <span key={p} className="text-emerald-100/50 font-bold px-1 text-xs">...</span>
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg border border-[#10b981]/25 bg-[#060e0a] text-emerald-100 font-bold text-xs disabled:opacity-30 hover:bg-[#0a1b14] transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-lg !p-6 sm:!p-8 space-y-5 bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-black text-white">
              {editingLectureId ? 'Edit Lecture Details' : 'Upload Lecture'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Intro to Vectors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Subject</label>
                  <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400">
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
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Grade</label>
                  <select value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400">
                    <option value="IX">IX</option>
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Media Type</label>
                  <select value={formData.mediaType} onChange={(e) => setFormData({...formData, mediaType: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400">
                    <option value="youtube">YouTube Video</option>
                    <option value="gdrive">Google Drive Video</option>
                    <option value="pdf">PDF Notes</option>
                    <option value="other">Other Link</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Media URL</label>
                  <input required type="url" value={formData.mediaUrl} onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400" placeholder="https://..." />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#060e0a] border border-[#10b981]/20 p-3 rounded-xl">
                <input 
                  type="checkbox" 
                  id="demo-mode"
                  checked={formData.isPublicPreview} 
                  onChange={(e) => setFormData({...formData, isPublicPreview: e.target.checked})} 
                  className="w-4 h-4 text-emerald-500 border border-[#10b981]/25 rounded bg-[#060e0a] focus:ring-emerald-400"
                />
                <label htmlFor="demo-mode" className="text-xs font-bold text-white cursor-pointer select-none">
                  Set as Public Demo
                  <span className="block text-[10px] text-emerald-100/50 font-semibold mt-0.5">Allows non-registered students to view this lecture on the public website.</span>
                </label>
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => { resetForm(); setShowModal(false); }} className="px-4 py-2 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-100/70 hover:bg-[#0a1b14]">Cancel</button>
                <button type="submit" className="btn-primary text-xs !py-2 !px-5 shadow-sm">Save Lecture</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
