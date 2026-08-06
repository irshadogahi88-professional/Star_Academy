import { useState, useEffect } from 'react'
import { FaImage, FaPlus, FaTrash, FaCheckCircle, FaEdit } from 'react-icons/fa'
import axios from 'axios'

export default function AdminGallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ title: '', category: 'General', imageUrl: '' })

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/gallery/all')
      if (res.data?.success) {
        setImages(res.data.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [])

  const getDirectImageUrl = (url) => {
    if (!url) return ''
    
    let id = '';
    if (url.includes('drive.google.com/file/d/')) {
      id = url.split('/d/')[1].split('/')[0];
    } else if (url.includes('drive.google.com/open?id=')) {
      id = url.split('id=')[1].split('&')[0];
    } else if (url.includes('drive.google.com/uc?id=')) {
      id = url.split('id=')[1].split('&')[0];
    }

    if (id) {
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
    
    return url
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm({ title: '', category: 'General', imageUrl: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (img) => {
    setEditingId(img._id)
    setForm({ title: img.title || '', category: img.category || 'General', imageUrl: img.imageUrl || '' })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.imageUrl) return

    try {
      if (editingId) {
        const res = await axios.patch(`/api/gallery/${editingId}`, form)
        if (res.data?.success) {
          setNotice('Gallery image updated successfully!')
        }
      } else {
        const res = await axios.post('/api/gallery', form)
        if (res.data?.success) {
          setNotice('Image published to gallery!')
        }
      }
      setShowModal(false)
      fetchGallery()
      setTimeout(() => setNotice(''), 4000)
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this image from the gallery?')) {
      try {
        const res = await axios.delete(`/api/gallery/${id}`)
        if (res.data?.success) {
          setNotice('Image deleted.')
          fetchGallery()
          setTimeout(() => setNotice(''), 4000)
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1">
            <FaImage size={12} /> Media Manager
          </span>
          <h1 className="text-3xl font-black text-[#0E4429] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
            Gallery Dashboard
          </h1>
          <p className="text-xs text-[#3a4a40]">
            Manage public gallery photos. Use Google Drive public links for easy hosting.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn-gold text-xs !py-3 !px-5 shadow-md flex items-center gap-2">
          <FaPlus size={12} />
          <span>Add Photo</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs flex items-center gap-2">
          <FaCheckCircle size={14} className="text-emerald-700" />
          <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#147a4a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="card !p-12 text-center space-y-3 border-2 border-dashed border-[#DCE8DD]">
          <FaImage size={40} className="mx-auto text-[#147a4a]/40" />
          <h3 className="font-extrabold text-base text-[#0E4429]">No Photos Found</h3>
          <p className="text-xs text-[#3a4a40] max-w-sm mx-auto">Click "Add Photo" to start building the public gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img._id} className="card !p-4 space-y-4 border border-sage shadow-sm relative bg-white">
              <div className="flex items-center justify-between absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-sage">
                <button onClick={() => handleOpenEdit(img)} className="p-1.5 text-[#147a4a] hover:bg-emerald-50 rounded">
                  <FaEdit size={12} />
                </button>
                <div className="w-px h-4 bg-sage mx-1" />
                <button onClick={() => handleDelete(img._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                  <FaTrash size={12} />
                </button>
              </div>

              <div className="w-full h-48 rounded-xl overflow-hidden bg-cream-alt">
                <img 
                  src={getDirectImageUrl(img.imageUrl)} 
                  alt={img.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-primary">
                  {img.category}
                </span>
                <h3 className="font-extrabold text-sm text-[#0E4429] leading-snug line-clamp-2" title={img.title}>
                  {img.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="card w-full max-w-md !p-6 space-y-4 bg-white border-2 border-[#147a4a]/30 shadow-2xl">
            <h2 className="text-xl font-black text-[#0E4429]" style={{ fontFamily: 'var(--font-heading)' }}>
              {editingId ? 'Edit Photo' : 'Add Gallery Photo'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">
                  Photo Title / Caption
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Annual Sports Gala 2025"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DD] font-bold focus:outline-none focus:border-[#147a4a]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DD] font-bold focus:outline-none focus:border-[#147a4a]"
                >
                  <option value="General">General</option>
                  <option value="Events">Events & Celebrations</option>
                  <option value="Campus">Campus & Facilities</option>
                  <option value="Awards">Awards & Achievements</option>
                  <option value="Classrooms">Classrooms</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-extrabold text-[#0E4429] mb-1.5">
                  Google Drive Public Link (or Direct URL)
                </label>
                <input
                  type="text"
                  required
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/.../view"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#DCE8DD] font-bold focus:outline-none focus:border-[#147a4a]"
                />
                <p className="text-[10px] text-charcoal-light mt-1 font-medium">
                  Make sure the Google Drive link is set to "Anyone with the link can view".
                </p>
              </div>

              {form.imageUrl && (
                <div className="w-full h-32 rounded-lg overflow-hidden bg-cream-alt mt-2 border border-sage">
                  <img src={getDirectImageUrl(form.imageUrl)} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-sage">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCE8DD] font-bold text-[#3a4a40]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold text-xs !py-2 !px-5 shadow-xs">
                  {editingId ? 'Save Changes' : 'Publish to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
