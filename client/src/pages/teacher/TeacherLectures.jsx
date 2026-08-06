import { useState, useEffect } from 'react'
import { FaVideo, FaPlus, FaTrashAlt, FaCheck, FaFilePdf, FaBookOpen, FaExternalLinkAlt } from 'react-icons/fa'

import api from '../../services/api'

export default function TeacherLectures() {
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Physics',
    classLevel: '11',
    chapter: '',
    videoUrl: '',
    pdfUrl: '',
  })

  useEffect(() => {
    fetchLectures()
  }, [])

  const fetchLectures = async () => {
    try {
      const res = await api.get('/lectures')
      if (res.data && res.data.lectures) {
        setLectures(res.data.lectures)
      } else if (Array.isArray(res.data)) {
        setLectures(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch lectures:', err)
    }
    setLoading(false)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.videoUrl) return

    try {
      const newLect = {
        title: formData.title,
        subject: formData.subject,
        class: formData.classLevel,
        chapter: formData.chapter,
        videoUrl: formData.videoUrl,
        pdfUrl: formData.pdfUrl,
      }
      const res = await api.post('/lectures', newLect)
      if (res.data && res.data.success) {
        setLectures([res.data.data, ...lectures])
      } else {
        setLectures([res.data, ...lectures]) // Fallback if no specific data prop
      }
      setFormData({
        title: '',
        subject: 'Physics',
        classLevel: '11',
        chapter: '',
        videoUrl: '',
        pdfUrl: '',
      })
      setShowModal(false)
    } catch (err) {
      alert('Failed to publish lecture: ' + err.message)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1">
            <FaVideo size={12} /> Lecture Portal
          </span>
          <h1 className="text-3xl font-black text-[#0E4429] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
            Class Lectures & Study Notes
          </h1>
          <p className="text-xs text-[#3a4a40]">Publish video lecture links and PDF notes for enrolled students.</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-primary text-xs !py-3 !px-5 self-start sm:self-center">
          <FaPlus size={12} />
          <span>Add New Lecture</span>
        </button>
      </div>

      {/* Lecture List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-10"><span className="w-8 h-8 border-4 border-[#147a4a] border-t-transparent rounded-full animate-spin"></span></div>
        ) : lectures.length === 0 ? (
          <p className="text-center text-sm text-[#3a4a40] py-10 font-bold">No lectures published yet.</p>
        ) : (
          lectures.map((lecture) => (
            <div key={lecture._id || lecture.id} className="card !p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 border-l-4 border-l-[#147a4a]">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-emerald text-[11px] font-extrabold">{lecture.subject} • Grade {lecture.class || lecture.classLevel}</span>
                  <span className="text-xs text-[#3a4a40] font-medium">{lecture.chapter}</span>
                </div>
                <h3 className="font-bold text-lg text-[#0E4429]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {lecture.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#3a4a40] font-semibold pt-1">
                  <a href={lecture.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <FaVideo /> Video Stream Link <FaExternalLinkAlt size={10} />
                  </a>
                  {lecture.pdfUrl && (
                    <a href={lecture.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-red-600 hover:underline">
                      <FaFilePdf /> Download Notes PDF <FaExternalLinkAlt size={10} />
                    </a>
                  )}
                  <span className="text-white/60">• Published {new Date(lecture.createdAt || lecture.dateAdded).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(lecture._id || lecture.id)}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 self-start md:self-center transition-colors"
                title="Delete Lecture"
              >
                <FaTrashAlt size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-xl !p-6 sm:!p-8 space-y-5 bg-white">
            <h2 className="text-2xl font-bold text-[#0E4429]" style={{ fontFamily: 'var(--font-heading)' }}>
              Publish Class Lecture
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Kinematics & Motion Equations"
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE8DD] text-sm focus:outline-none focus:border-[#147a4a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8DD] text-sm font-semibold focus:outline-none focus:border-[#147a4a]"
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
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">Grade Level</label>
                  <select
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8DD] text-sm font-semibold focus:outline-none focus:border-[#147a4a]"
                  >
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11 (XI)</option>
                    <option value="12">Grade 12 (XII)</option>
                    <option value="MDCAT">MDCAT</option>
                    <option value="ECAT">ECAT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">Chapter / Topic</label>
                <input
                  type="text"
                  value={formData.chapter}
                  onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                  placeholder="e.g. Chapter 2: Vectors & Equilibrium"
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE8DD] text-sm focus:outline-none focus:border-[#147a4a]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">YouTube / Video Stream URL</label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE8DD] text-sm focus:outline-none focus:border-[#147a4a]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">PDF Study Notes Link (Optional)</label>
                <input
                  type="url"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="https://example.com/notes.pdf"
                  className="w-full px-4 py-3 rounded-xl border border-[#DCE8DD] text-sm focus:outline-none focus:border-[#147a4a]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-[#DCE8DD] text-xs font-bold text-[#3a4a40]">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs !py-2.5 !px-5">
                  <FaCheck size={12} />
                  <span>Publish Lecture</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
