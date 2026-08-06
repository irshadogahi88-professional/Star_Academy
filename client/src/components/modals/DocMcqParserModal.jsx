import { useState } from 'react'
import { Upload, FileText, File, ClipboardList, Wand2, X, Loader2 } from 'lucide-react'
import api from '../../services/api'

export default function DocMcqParserModal({ isOpen, onClose, onParsedSuccess }) {
  const [activeTab, setActiveTab] = useState('file') // 'file' or 'paste'
  const [selectedFile, setSelectedFile] = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [subject, setSubject] = useState('Physics')
  const [classLevel, setClassLevel] = useState('11')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setErrorMsg('')
    }
  }

  const handleParseSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (activeTab === 'file') {
        if (!selectedFile) {
          setErrorMsg('Please select a PDF or Word document file first.')
          setLoading(false)
          return
        }

        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('subject', subject)
        formData.append('classLevel', classLevel)
        formData.append('filename', selectedFile.name)

        const response = await api.post('/tests/parse-doc', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (response.data.success) {
          onParsedSuccess(response.data.mcqs, response.data.filename, subject, classLevel)
          onClose()
        }
      } else {
        if (!pastedText.trim()) {
          setErrorMsg('Please paste study text or question content.')
          setLoading(false)
          return
        }

        const response = await api.post('/tests/parse-doc', {
          rawText: pastedText,
          filename: 'Pasted_Text_Import',
          subject,
          classLevel,
        })

        if (response.data.success) {
          onParsedSuccess(response.data.mcqs, 'Pasted_Text_Import', subject, classLevel)
          onClose()
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to parse document. Please check the file format.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="card-glass w-full max-w-xl !p-6 space-y-5 bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#10b981]/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Wand2 size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Auto PDF / Word to MCQs Parser
              </h2>
              <p className="text-xs text-emerald-100/60 font-semibold">
                Upload test paper document to automatically extract MCQs for review & banking.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-emerald-100/50 hover:bg-[#10b981]/10 hover:text-emerald-400 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#060e0a] border border-[#10b981]/15 p-1.5 gap-2 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'file' ? 'bg-emerald-500 text-emerald-950 font-extrabold shadow-sm' : 'text-emerald-100/50 hover:text-emerald-400'
            }`}
          >
            <Upload size={14} /> Upload PDF / Word
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'paste' ? 'bg-emerald-500 text-emerald-950 font-extrabold shadow-sm' : 'text-emerald-100/50 hover:text-emerald-400'
            }`}
          >
            <ClipboardList size={14} /> Paste Raw Text
          </button>
        </div>

        <form onSubmit={handleParseSubmit} className="space-y-6">
          {/* Metadata Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-2">
                Target Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
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
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-2">
                Grade / Track Level
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400"
              >
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11 (XI)</option>
                <option value="12">Grade 12 (XII)</option>
                <option value="MDCAT">MDCAT Track</option>
                <option value="ECAT">ECAT Track</option>
              </select>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'file' ? (
            <div className="border-2 border-dashed border-[#10b981]/20 rounded-2xl p-10 text-center space-y-5 bg-[#060e0a]/40 transition-colors hover:bg-[#060e0a]/60">
              <div className="flex justify-center gap-4 text-4xl text-emerald-400">
                <FileText size={42} />
                <File size={42} />
              </div>
              <p className="text-sm font-extrabold text-white">
                Choose or drag & drop `.pdf` or `.docx` test paper
              </p>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
                id="doc-file-upload"
              />
              <label
                htmlFor="doc-file-upload"
                className="btn-gold text-sm !py-3 !px-6 inline-flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
              >
                <Upload size={16} />
                <span>{selectedFile ? selectedFile.name : 'Select Document File'}</span>
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-2">
                Paste Question Content
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste question text here (e.g. 1. What is acceleration? A) Speed B) Change of velocity...)"
                className="w-full px-4 py-4 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 resize-none"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl text-sm font-bold text-center bg-red-500/10 text-red-400 border border-red-500/25 shadow-sm mt-4">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-[#10b981]/15">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-sm font-bold text-emerald-100/70 hover:bg-[#0a1b14] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm !py-3 !px-8 shadow-md flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Parsing Document...</span>
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  <span>Extract & Review MCQs</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
