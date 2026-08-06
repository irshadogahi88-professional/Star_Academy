import { useState } from 'react'
import { FaFileUpload, FaFilePdf, FaFileWord, FaPaste, FaMagic, FaTimes, FaSpinner } from 'react-icons/fa'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="card w-full max-w-xl !p-6 space-y-5 bg-white border-2 border-[#147a4a]/30 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#DCE8DD] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#147a4a]/10 text-[#147a4a] flex items-center justify-center font-bold">
              <FaMagic size={18} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0E4429]" style={{ fontFamily: 'var(--font-heading)' }}>
                Auto PDF / Word to MCQs Parser
              </h2>
              <p className="text-xs text-[#3a4a40] font-medium">
                Upload test paper document to automatically extract MCQs for review & banking.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-[#3a4a40] hover:bg-[#F1ECE0]">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#F1ECE0] p-1.5 gap-2 mt-2">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'file' ? 'bg-[#147a4a] text-white shadow-md' : 'text-[#3a4a40] hover:bg-[#DCE8DD]'
            }`}
          >
            <FaFileUpload size={14} /> Upload PDF / Word
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'paste' ? 'bg-[#147a4a] text-white shadow-md' : 'text-[#3a4a40] hover:bg-[#DCE8DD]'
            }`}
          >
            <FaPaste size={14} /> Paste Raw Text
          </button>
        </div>

        <form onSubmit={handleParseSubmit} className="space-y-6">
          {/* Metadata Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-2">
                Target Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#DCE8DD] text-sm font-bold text-[#0E4429] focus:outline-none focus:ring-2 focus:ring-[#147a4a]/20 focus:border-[#147a4a]"
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
              <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-2">
                Grade / Track Level
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#DCE8DD] text-sm font-bold text-[#0E4429] focus:outline-none focus:ring-2 focus:ring-[#147a4a]/20 focus:border-[#147a4a]"
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
            <div className="border-2 border-dashed border-[#147a4a]/40 rounded-2xl p-10 text-center space-y-5 bg-[#F1ECE0]/40 transition-colors hover:bg-[#F1ECE0]/70">
              <div className="flex justify-center gap-4 text-4xl text-[#147a4a]">
                <FaFilePdf />
                <FaFileWord />
              </div>
              <p className="text-sm font-extrabold text-[#0E4429]">
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
                <FaFileUpload size={16} />
                <span>{selectedFile ? selectedFile.name : 'Select Document File'}</span>
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-[#0E4429] mb-2">
                Paste Question Content
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste question text here (e.g. 1. What is acceleration? A) Speed B) Change of velocity...)"
                className="w-full px-4 py-4 rounded-xl border border-[#DCE8DD] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#147a4a]/20 focus:border-[#147a4a] resize-none"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl text-sm font-bold text-center bg-red-50 text-red-700 border border-red-200 shadow-sm mt-4">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-4 pt-6 mt-2 border-t border-[#DCE8DD]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border-2 border-[#DCE8DD] text-sm font-bold text-[#3a4a40] hover:bg-gray-50 transition-colors"
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
                  <FaSpinner className="animate-spin" size={16} />
                  <span>Parsing Document...</span>
                </>
              ) : (
                <>
                  <FaMagic size={16} />
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
