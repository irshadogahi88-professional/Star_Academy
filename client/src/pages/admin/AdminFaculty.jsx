import { useState, useEffect } from 'react'
import { GraduationCap, Plus, Edit2, Trash2, Star } from 'lucide-react'
import { getDirectImageUrl } from '../../utils/imageHelper'
import facultyService from '../../services/facultyService'

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    name: '',
    designation: '',
    qualification: '',
    experience: '',
    subject: 'Chemistry',
    phone: '',
    photoUrl: '',
  })

  const fetchFaculty = async () => {
    setLoading(true)
    const res = await facultyService.getAllFaculty()
    if (res && res.success) {
      setFaculty(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFaculty()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm({ name: '', designation: '', qualification: '', experience: '', subject: 'Chemistry', phone: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (f) => {
    setEditingId(f._id)
    setForm({
      name: f.name || '',
      designation: f.designation || '',
      qualification: f.qualification || '',
      experience: f.experience || '',
      subject: f.subject || 'Chemistry',
      phone: f.phone || '',
      photoUrl: f.photoUrl || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name) return

    if (editingId) {
      const res = await facultyService.updateFaculty(editingId, form)
      if (res && res.success) {
        setNotice(`Updated ${form.name}'s profile!`)
      }
    } else {
      const res = await facultyService.createFaculty(form)
      if (res && res.success) {
        setNotice(`Added ${form.name} to faculty directory!`)
      }
    }
    setShowModal(false)
    fetchFaculty()
    setTimeout(() => setNotice(''), 4000)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Remove ${name} from public Faculty Directory?`)) {
      const res = await facultyService.deleteFaculty(id)
      if (res && res.success) {
        setNotice(`Removed ${name} from directory.`)
        fetchFaculty()
        setTimeout(() => setNotice(''), 4000)
      }
    }
  }

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <GraduationCap size={12} /> Academic Leadership
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Faculty Members Directory
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">
            Update public website faculty profiles, designations, qualifications, and display order.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn-gold text-xs !py-3 !px-5 shadow-md flex items-center gap-2">
          <Plus size={12} />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-extrabold text-xs flex items-center gap-2">
          <Star size={14} />
          <span>{notice}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : faculty.length === 0 ? (
        <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 !p-12 text-center space-y-3 border-dashed rounded-3xl">
          <GraduationCap size={40} className="mx-auto text-emerald-500/40" />
          <h3 className="font-extrabold text-base text-white">No Faculty Members Yet</h3>
          <p className="text-xs text-emerald-100/60 font-semibold max-w-sm mx-auto">Click "Add Faculty Member" to create the first profile for the public website directory.</p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {faculty.map((f) => (
            <div key={f._id} className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400 transition-all rounded-3xl !p-6 space-y-4 shadow-md relative">
              <div className="flex items-center justify-between">
                <span className="badge badge-gold text-[10px] font-extrabold bg-amber-500/10 border border-amber-500/30 text-amber-400">Order #{f.order || 0}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(f)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-[#10b981]/10">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(f._id, f.name)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {f.photoUrl ? (
                  <img referrerPolicy="no-referrer" src={getDirectImageUrl(f.photoUrl)} alt={f.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-black text-xl flex items-center justify-center">
                    {f.name.charAt(4) || f.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-base text-white leading-tight">{f.name}</h3>
                  <p className="text-xs text-emerald-400 font-bold mt-0.5">{f.designation}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#10b981]/10 text-xs">
                <p className="text-emerald-100/70 font-semibold"><span className="font-extrabold text-white">Degree:</span> {f.qualification || '—'}</p>
                <p className="text-emerald-100/70 font-semibold"><span className="font-extrabold text-white">Experience:</span> {f.experience || '—'}</p>
                <p className="text-amber-400 font-extrabold"><span className="font-extrabold text-white">Subject:</span> {f.subject}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-lg !p-6 space-y-4 bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl">
            <h2 className="text-xl font-black text-white">
              {editingId ? 'Edit Faculty Profile' : 'Add New Faculty Member'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sir Irshad Ahmed Ogahi"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                  Designation / Role
                </label>
                <input
                  type="text"
                  required
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  placeholder="e.g. Director & Chemistry Specialist"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    placeholder="e.g. M.Sc Chemistry (Gold Medalist)"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                    Teaching Experience
                  </label>
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="e.g. 18+ Years"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-bold focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="LR">LR</option>
                    <option value="All">All</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 0300-1234567"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                  Photo URL (Optional)
                </label>
                <input
                  type="text"
                  value={form.photoUrl}
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                  placeholder="e.g. /images/faculty/irshad.jpg"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-100/70 hover:bg-[#0a1b14]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gold text-xs !py-2 !px-5 shadow-xs">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
