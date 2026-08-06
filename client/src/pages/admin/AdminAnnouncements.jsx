import { useState, useEffect } from 'react'
import { Megaphone, Save, Calendar, Info } from 'lucide-react'
import settingsService from '../../services/settingsService'

export default function AdminAnnouncements() {
  const [marqueeText, setMarqueeText] = useState('')
  const [startDate, setStartDate] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true)
      const res = await settingsService.getSettings()
      if (res && res.success && res.data) {
        setMarqueeText(res.data.marqueeText || '')
        setStartDate(res.data.classesStartDate || '')
        setBookingDate(res.data.bookingDate || '')
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await settingsService.updateSettings({
      marqueeText,
      classesStartDate: startDate,
      bookingDate,
    })
    setSaving(false)
    if (res && res.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-emerald-100">
      {/* Header */}
      <div>
        <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Megaphone size={12} /> Marquee & Site Announcements
        </span>
        <h1 className="text-3xl font-black text-white mt-1">
          Public Broadcast Control
        </h1>
        <p className="text-xs text-emerald-100/70 font-semibold">Update the marquee ticker banner displayed on the homepage and student portal header.</p>
      </div>

      {/* Ticker Live Preview */}
      <div className="card-glass !p-5 border-l-4 border-l-amber-500 space-y-2 bg-[#0a1b14]/50 border border-[#10b981]/15 text-white rounded-3xl shadow-lg relative">
        <span className="text-[10px] font-extrabold tracking-widest text-amber-400 uppercase flex items-center gap-1">
          <Info size={12} /> Live Marquee Preview
        </span>
        <div className="overflow-hidden whitespace-nowrap bg-[#060e0a] border border-[#10b981]/25 p-3 rounded-xl text-xs font-semibold text-amber-400">
          {marqueeText || 'No marquee text set. Enter your announcement below.'}
        </div>
      </div>

      {/* Announcement Form */}
      <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl !p-8 space-y-6 shadow-md">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
              Live Ticker Marquee Message
            </label>
            <textarea
              required
              rows={4}
              value={marqueeText}
              onChange={(e) => setMarqueeText(e.target.value)}
              placeholder="Enter marquee announcement message..."
              className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                <span className="inline-flex items-center gap-1"><Calendar size={12} /> Advance Booking Date</span>
              </label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                <span className="inline-flex items-center gap-1"><Calendar size={12} /> Classes Commencement Date</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button type="submit" disabled={saving} className="btn-primary text-xs !py-3 !px-6 shadow-md flex items-center gap-2">
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Publish Ticker Broadcast'}</span>
            </button>
          </div>

          {saved && (
            <div className="p-4 rounded-xl text-xs font-bold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              🎉 Announcement marquee updated and broadcast live!
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
