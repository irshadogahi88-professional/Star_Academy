import { useState, useEffect } from 'react'
import { Video, Plus, Trash2, Check, FileText, BookOpen, ExternalLink, Edit } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import api from '../../services/api'

export default function TeacherLectures() {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLectureId, setEditingLectureId] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Physics',
    grade: 'XI',
    mediaType: 'youtube',
    mediaUrl: '',
    description: '',
    isPublicPreview: false,
    chapter: '',
  })

  useEffect(() => {
    fetchLectures()
  }, [])

  const fetchLectures = async () => {
    try {
      const res = await api.get('/lectures')
      if (res.data && res.data.lectures) {
        setLectures(res.data.lectures)
      } else if (res.data && res.data.data) {
        setLectures(res.data.data)
      } else if (Array.isArray(res.data)) {
        setLectures(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch lectures:', err)
    }
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subject: 'Physics',
      grade: 'XI',
      mediaType: 'youtube',
      mediaUrl: '',
      description: '',
      isPublicPreview: false,
      chapter: '',
    })
    setEditingLectureId(null)
  }

  const handleEditClick = (lecture) => {
    setEditingLectureId(lecture._id || lecture.id)
    setFormData({
      title: lecture.title,
      subject: lecture.subject,
      grade: lecture.grade || 'XI',
      mediaType: lecture.mediaType || 'youtube',
      mediaUrl: lecture.mediaUrl || '',
      description: lecture.description || '',
      isPublicPreview: lecture.isPublicPreview || false,
      chapter: lecture.chapter || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.mediaUrl) return

    try {
      if (editingLectureId) {
        const res = await api.put(`/lectures/${editingLectureId}`, formData)
        if (res.data && res.data.success) {
          setLectures(lectures.map((l) => (l._id === editingLectureId || l.id === editingLectureId) ? res.data.data : l))
          resetForm()
          setShowModal(false)
        }
      } else {
        const res = await api.post('/lectures', formData)
        if (res.data && res.data.success) {
          setLectures([res.data.data, ...lectures])
        } else {
          const newItem = res.data.data || res.data
          setLectures([newItem, ...lectures])
        }
        resetForm()
        setShowModal(false)
      }
    } catch (err) {
      alert('Failed to save lecture: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await api.delete(`/lectures/${id}`)
        setLectures(lectures.filter((l) => l._id !== id && l.id !== id))
      } catch (err) {
        alert('Failed to delete lecture.')
      }
    }
  }

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Video size={12} /> Lecture Portal
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Class Lectures & Study Notes
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">Publish video lecture links and PDF notes for enrolled students.</p>
        </div>

        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary text-xs !py-3 !px-5 self-start sm:self-center flex items-center gap-1.5">
          <Plus size={14} />
          <span>Add New Lecture</span>
        </button>
      </div>

      {/* Lecture List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-10">
            <span className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
          </div>
        ) : lectures.length === 0 ? (
          <p className="text-center text-sm text-emerald-100/50 py-10 font-bold bg-[#0a1b14]/30 border border-[#10b981]/15 rounded-3xl">No lectures published yet.</p>
        ) : (
          <StaggerContainer className="space-y-4">
            {lectures.map((lecture) => (
              <StaggerItem key={lecture._id || lecture.id}>
                <div className="card-glass !p-6 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/30 transition-all rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 border-l-4 border-l-emerald-500">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge badge-emerald text-[11px] font-extrabold">{lecture.subject} • Grade {lecture.grade || lecture.class || lecture.classLevel}</span>
                      {lecture.chapter && <span className="text-xs text-emerald-100/60 font-semibold">{lecture.chapter}</span>}
                      {lecture.isPublicPreview && (
                        <span className="badge badge-gold text-[10px] uppercase font-black tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-400">Demo</span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-lg text-white">
                      {lecture.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
                      <a href={lecture.mediaUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 hover:underline ${lecture.mediaType === 'pdf' ? 'text-red-400 hover:text-red-300' : 'text-blue-400 hover:text-blue-300'}`}>
                        {lecture.mediaType === 'pdf' ? (
                          <>
                            <FileText size={12} /> Download Notes PDF <ExternalLink size={10} />
                          </>
                        ) : (
                          <>
                            <Video size={12} /> Video Stream Link <ExternalLink size={10} />
                          </>
                        )}
                      </a>
                      <span className="text-emerald-100/40">• Published {new Date(lecture.createdAt || lecture.dateAdded).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => handleEditClick(lecture)}
                      className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      title="Edit Lecture"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(lecture._id || lecture.id)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                      title="Delete Lecture"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-xl !p-6 sm:!p-8 space-y-5 bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-bold text-white">
              {editingLectureId ? 'Edit Class Lecture' : 'Publish Class Lecture'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Kinematics & Motion Equations"
                  className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
                  >
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
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Grade Level</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
                  >
                    <option value="IX">IX</option>
                    <option value="X">X</option>
                    <option value="XI">XI</option>
                    <option value="XII">XII</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Chapter / Topic</label>
                <input
                  type="text"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="e.g. Chapter 2: Vectors & Equilibrium"
                  className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Media Type</label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400"
                  >
                    <option value="youtube">YouTube Video</option>
                    <option value="gdrive">Google Drive Video</option>
                    <option value="pdf">PDF Notes</option>
                    <option value="other">Other Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Media URL</label>
                  <input
                    type="url"
                    required
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-[#060e0a] border border-[#10b981]/20 p-3 rounded-xl">
                <input 
                  type="checkbox" 
                  id="teacher-demo-mode"
                  checked={formData.isPublicPreview} 
                  onChange={(e) => setFormData({...formData, isPublicPreview: e.target.checked})} 
                  className="w-4 h-4 text-emerald-500 border border-[#10b981]/25 rounded bg-[#060e0a] focus:ring-emerald-400"
                />
                <label htmlFor="teacher-demo-mode" className="text-xs font-bold text-white cursor-pointer select-none">
                  Set as Public Demo
                  <span className="block text-[10px] text-emerald-100/50 font-semibold mt-0.5">Allows non-registered students to view this lecture on the public website.</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => { resetForm(); setShowModal(false); }} className="px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-100/70 hover:bg-[#0a1b14]">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-1">
                  <Check size={14} />
                  <span>Save Lecture</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
