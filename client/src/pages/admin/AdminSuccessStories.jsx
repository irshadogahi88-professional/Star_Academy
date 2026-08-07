import { useState, useEffect } from 'react'
import { Trophy, Plus, Trash2, Check, Search, Edit2 } from 'lucide-react'
import { getDirectImageUrl } from '../../utils/imageHelper'
import api from '../../services/api'

export default function AdminSuccessStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    studentName: '',
    achievement: '',
    category: 'MDCAT',
    institute: '',
    score: '',
    year: new Date().getFullYear().toString(),
    photoUrl: '',
  })

  const fetchStories = async () => {
    setLoading(true)
    try {
      const res = await api.get('/success-stories')
      if (res.data.success) {
        setStories(res.data.data)
      } else {
        setStories(res.data || [])
      }
    } catch (err) {
      console.error('Error fetching success stories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        const res = await api.patch(`/success-stories/${editingId}`, formData)
        if (res.data && (res.data.success || res.data._id)) {
          const updated = res.data.data || res.data
          setStories(stories.map(s => s._id === editingId ? updated : s))
          setShowModal(false)
          setStatusMsg('✅ Success Story updated successfully!')
          setTimeout(() => setStatusMsg(null), 3000)
          setEditingId(null)
          setFormData({ studentName: '', achievement: '', category: 'MDCAT', institute: '', score: '', year: new Date().getFullYear().toString(), photoUrl: '' })
        }
      } else {
        const res = await api.post('/success-stories', formData)
        if (res.data && (res.data.success || res.data._id)) {
          const newStory = res.data.data || res.data
          setStories([newStory, ...stories])
          setShowModal(false)
          setStatusMsg('✅ Success Story added successfully!')
          setTimeout(() => setStatusMsg(null), 3000)
          setFormData({ studentName: '', achievement: '', category: 'MDCAT', institute: '', score: '', year: new Date().getFullYear().toString(), photoUrl: '' })
        }
      }
    } catch (err) {
      alert('Failed to save story: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEditClick = (story) => {
    setEditingId(story._id)
    setFormData({
      studentName: story.studentName || '',
      achievement: story.achievement || '',
      category: story.category || 'MDCAT',
      institute: story.institute || '',
      score: story.score || '',
      year: story.year || new Date().getFullYear().toString(),
      photoUrl: story.photoUrl || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this success story?')) {
      try {
        await api.delete(`/success-stories/${id}`)
        setStories(stories.filter((s) => s._id !== id))
        setStatusMsg('✅ Story deleted successfully!')
        setTimeout(() => setStatusMsg(null), 3000)
      } catch (err) {
        alert('Failed to delete story: ' + (err.response?.data?.message || err.message))
      }
    }
  }

  const filtered = stories.filter(s => 
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.institute?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 text-emerald-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Trophy size={12} /> Hall of Fame Manager
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Success Stories
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">Manage the successful candidates displayed on the public Success Wall.</p>
        </div>

        <button onClick={() => {
          setEditingId(null)
          setFormData({ studentName: '', achievement: '', category: 'MDCAT', institute: '', score: '', year: new Date().getFullYear().toString(), photoUrl: '' })
          setShowModal(true)
        }} className="btn-primary text-xs !py-3 !px-4 shadow-sm flex items-center gap-2">
          <Plus size={12} />
          <span>Add Candidate</span>
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
            placeholder="Search candidates by name or destination..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <span className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((story) => (
            <div key={story._id} className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 transition-all rounded-3xl !p-5 flex flex-col gap-3 relative shadow-md">
              <div className="flex justify-between items-start gap-2">
                <span className="badge badge-gold text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400">{story.year}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEditClick(story)} className="text-blue-400 hover:bg-blue-500/10 p-1.5 rounded-md transition-colors" title="Edit Candidate">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(story._id)} className="text-red-400 hover:bg-red-500/10 p-1.5 rounded-md transition-colors" title="Delete Candidate">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#10b981]/25 shrink-0 bg-[#060e0a]">
                  {story.photoUrl ? (
                    <img referrerPolicy="no-referrer" src={getDirectImageUrl(story.photoUrl)} alt={story.studentName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                      {story.studentName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">{story.studentName}</h3>
                  <p className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider mt-0.5">{story.institute}</p>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-emerald-100/70 font-medium border-t border-[#10b981]/10 pt-3">
                <span className="badge badge-emerald mb-1.5">{story.category}</span>
                <p className="font-semibold text-emerald-100">{story.achievement}</p>
                {story.score && <p className="text-xs text-emerald-100/50 mt-1">Score: {story.score}</p>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center p-10 text-emerald-100/50 font-bold">No candidates found.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-lg !p-6 sm:!p-8 space-y-5 bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-black text-white">
              {editingId ? 'Edit Success Candidate' : 'Add Success Candidate'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Candidate Name</label>
                <input required type="text" value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Ali Raza" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Achievement (Title)</label>
                <input required type="text" value={formData.achievement} onChange={(e) => setFormData({...formData, achievement: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Secured admission in MBBS" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Destination (Institute)</label>
                  <input type="text" value={formData.institute} onChange={(e) => setFormData({...formData, institute: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. Dow Medical College" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Score/Rank</label>
                  <input type="text" value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. 185/200" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:border-emerald-400">
                    <option value="MDCAT">MDCAT</option>
                    <option value="ECAT">ECAT</option>
                    <option value="Board Position">Board Position</option>
                    <option value="Scholarship">Scholarship</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Year of Selection</label>
                  <input required type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400" placeholder="2026" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Photo URL (Optional)</label>
                <input type="url" value={formData.photoUrl} onChange={(e) => setFormData({...formData, photoUrl: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400" placeholder="https://..." />
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="px-4 py-2 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-100/70 hover:bg-[#0a1b14]">Cancel</button>
                <button type="submit" className="btn-primary text-xs !py-2 !px-5 shadow-sm">Save Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
