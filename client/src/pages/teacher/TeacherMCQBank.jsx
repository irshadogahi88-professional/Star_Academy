import { useState, useEffect } from 'react'
import {
  HelpCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Layers,
  List,
  RefreshCw,
  Trash,
} from 'lucide-react'
import DocMcqParserModal from '../../components/modals/DocMcqParserModal'
import McqReviewEditorModal from '../../components/modals/McqReviewEditorModal'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function TeacherMCQBank() {
  const navigate = useNavigate()
  const [mcqs, setMcqs] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [documentBatches, setDocumentBatches] = useState([])
  
  const [activeTab, setActiveTab] = useState('questions') // 'questions' or 'batches'
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('All')
  const [classFilter, setClassFilter] = useState('All')
  const [sourceDocFilter, setSourceDocFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Modals state
  const [showParserModal, setShowParserModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [parsedData, setParsedData] = useState({ mcqs: [], filename: '', subject: 'Physics', classLevel: 'XI' })
  const [bannerMsg, setBannerMsg] = useState('')

  // Single Question Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    subject: 'Physics',
    classLevel: 'XI',
    chapter: '',
    difficulty: 'medium',
    sourceDoc: 'Manual Input',
  })

  // Fetch MCQs from backend
  const fetchMCQs = async () => {
    setLoading(true)
    try {
      let query = `?page=${currentPage}&limit=${itemsPerPage}`
      if (subjectFilter !== 'All') query += `&subject=${subjectFilter}`
      if (classFilter !== 'All') query += `&classLevel=${classFilter}`
      if (sourceDocFilter !== 'All') query += `&sourceDoc=${encodeURIComponent(sourceDocFilter)}`
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`
      
      const res = await api.get(`/tests/mcqs${query}`)
      if (res.data.success) {
        setMcqs(res.data.data)
        setTotalCount(res.data.pagination.total)
        setTotalPages(res.data.pagination.pages)
      }
    } catch (err) {
      console.error('Failed to fetch MCQs', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch batches from backend
  const fetchBatches = async () => {
    try {
      const res = await api.get('/tests/mcqs/batches')
      if (res.data.success) {
        setDocumentBatches(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch batches', err)
    }
  }

  // Effect to re-fetch when filters/pagination changes
  useEffect(() => {
    fetchMCQs()
    if (activeTab === 'batches') {
      fetchBatches()
    }
  }, [currentPage, subjectFilter, classFilter, sourceDocFilter, searchTerm, activeTab])

  const handleParsedSuccess = (extractedMcqs, filename, subj, grade) => {
    setParsedData({
      mcqs: extractedMcqs,
      filename: filename,
      subject: subj,
      classLevel: grade,
    })
    setShowReviewModal(true)
  }

  const handleBatchReviewComplete = (successNotice) => {
    fetchMCQs()
    if (activeTab === 'batches') fetchBatches()
    setBannerMsg(successNotice)
    setTimeout(() => setBannerMsg(''), 6000)
  }

  const handleDeleteBatch = async (sourceDoc) => {
    if (window.confirm(`Are you sure you want to delete ALL MCQs imported from "${sourceDoc}"?`)) {
      setMcqs((prev) => prev.filter((m) => m.sourceDoc !== sourceDoc))
      setDocumentBatches((prev) => prev.filter((b) => b.sourceDoc !== sourceDoc))
      try {
        await api.delete(`/tests/batch-source-doc?sourceDoc=${encodeURIComponent(sourceDoc)}`)
      } catch (err) {
        console.warn('Backend batch delete fallback sync:', err)
      }
    }
  }

  const handleUpdateBatchSubject = async (sourceDoc, newSubject) => {
    setMcqs((prev) =>
      prev.map((m) => (m.sourceDoc === sourceDoc ? { ...m, subject: newSubject } : m))
    )
    try {
      await api.patch('/tests/batch-source-doc', {
        sourceDoc: sourceDoc,
        newSubject: newSubject
      })
    } catch (err) {
      console.warn('Failed to update batch subject in backend:', err)
      alert('Failed to save batch subject update to server.')
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      questionText: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      subject: 'Physics',
      classLevel: '11',
      chapter: '',
      difficulty: 'medium',
      sourceDoc: 'Manual Addition',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (mcq) => {
    setEditingId(mcq._id || mcq.id)
    setFormData({
      questionText: mcq.questionText,
      options: [...mcq.options],
      correctIndex: mcq.correctIndex,
      subject: mcq.subject,
      classLevel: mcq.classLevel || mcq.class,
      chapter: mcq.chapter,
      difficulty: mcq.difficulty,
      sourceDoc: mcq.sourceDoc || 'Manual Addition',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.questionText) return

    try {
      if (editingId) {
        const res = await api.put(`/tests/mcqs/${editingId}`, formData)
        if (res.data.success) {
          setMcqs(mcqs.map((m) => (m._id === editingId || m.id === editingId ? { ...m, ...res.data.data } : m)))
        }
      } else {
        alert('Single MCQ addition will be handled via AI Batch or future endpoint.')
      }
    } catch (err) {
      alert('Failed to save MCQ: ' + err.message)
    } finally {
      setShowModal(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/tests/mcqs/${id}`)
        setMcqs(mcqs.filter((m) => m._id !== id && m.id !== id))
        setTotalCount((prev) => prev - 1)
      } catch (err) {
        alert('Failed to delete MCQ: ' + err.message)
      }
    }
  }

  return (
    <div className="space-y-6 text-emerald-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <HelpCircle size={12} /> MCQ Bank Manager
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Central Question Bank
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">
            Manage questions by subject or bulk import & review from uploaded PDF/Word test papers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowParserModal(true)}
            className="btn-gold text-xs !py-3 !px-4 shadow-sm flex items-center gap-2"
          >
            <Upload size={13} />
            <span>Upload PDF / Word Doc</span>
          </button>

          <button onClick={handleOpenCreate} className="btn-primary text-xs !py-3 !px-4 shadow-sm flex items-center gap-1.5">
            <Plus size={14} />
            <span>Add Single Question</span>
          </button>
        </div>
      </div>

      {bannerMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-extrabold text-xs flex items-center gap-2">
          <Check size={14} />
          <span>{bannerMsg}</span>
        </div>
      )}

      {/* Main View Tabs */}
      <div className="flex rounded-xl bg-[#060e0a] border border-[#10b981]/15 p-1 gap-1 w-full max-w-md">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'questions' ? 'bg-emerald-500 text-emerald-950 font-extrabold' : 'text-emerald-100/50 hover:text-emerald-400'
          }`}
        >
          <List size={14} /> All Questions ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'batches' ? 'bg-emerald-500 text-emerald-950 font-extrabold' : 'text-emerald-100/50 hover:text-emerald-400'
          }`}
        >
          <Layers size={14} /> View by Source File ({documentBatches.length})
        </button>
      </div>

      {activeTab === 'questions' ? (
        <>
          {/* Filter Bar */}
          <div className="card-glass !p-4 bg-[#0a1b14]/50 border border-[#10b981]/15 flex flex-col md:flex-row items-center gap-4 rounded-2xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions by statement or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-emerald-100 text-xs font-semibold focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-400 focus:outline-none"
              >
                <option value="All">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="LR">Logical Reasoning (LR)</option>
                <option value="Computer Science">Computer Science</option>
                <option value="General">General</option>
                <option value="MDCAT Mock">MDCAT Mock</option>
                <option value="ECAT Mock">ECAT Mock</option>
              </select>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-400 focus:outline-none"
              >
                <option value="All">All Grades</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11 (XI)</option>
                <option value="12">Grade 12 (XII)</option>
                <option value="MDCAT">MDCAT</option>
                <option value="ECAT">ECAT</option>
              </select>
            </div>
          </div>

          {sourceDocFilter !== 'All' && (
            <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-400 font-bold shadow-sm">
              <span className="flex items-center gap-2">
                <FileText size={14} />
                <span>Currently filtering list to only show questions from source file: <strong className="text-white">"{sourceDocFilter}"</strong></span>
              </span>
              <button 
                onClick={() => {
                  setSourceDocFilter('All')
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1 bg-amber-500 text-amber-950 rounded-lg hover:bg-amber-400 font-extrabold transition-all"
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* MCQ Table / Card List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-10">
                <span className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
              </div>
            ) : mcqs.length === 0 ? (
              <div className="text-center p-10 text-emerald-100/50 font-bold bg-[#0a1b14]/30 border border-[#10b981]/15 rounded-3xl">No MCQs found matching your criteria.</div>
            ) : (
              <StaggerContainer className="space-y-4">
                {mcqs.map((mcq, idx) => (
                  <StaggerItem key={mcq._id || mcq.id}>
                    <div className="card-glass !p-6 bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/30 transition-all rounded-3xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#10b981]/15 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-emerald-400">#{(currentPage - 1) * itemsPerPage + idx + 1}</span>
                          <span className="badge badge-emerald text-[10px] font-extrabold">{mcq.subject} • Grade {mcq.classLevel || mcq.class}</span>
                          <span className="text-xs text-emerald-100/60 font-semibold">{mcq.chapter}</span>
                          {mcq.sourceDoc && (
                            <span className="text-[10px] font-bold text-amber-500 bg-[#060e0a] px-2 py-0.5 rounded-md border border-[#10b981]/10">
                              Source: {mcq.sourceDoc}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleOpenEdit(mcq)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(mcq._id || mcq.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <p className="font-bold text-base text-white">{mcq.questionText}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {mcq.options && mcq.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                              oIdx === mcq.correctIndex
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold shadow-sm'
                                : 'bg-[#060e0a] border-[#10b981]/15 text-emerald-100/80'
                            }`}
                          >
                            <span>
                              <strong className="mr-2">{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                            </span>
                            {oIdx === mcq.correctIndex && <Check className="text-emerald-400" size={12} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between card-glass !p-4 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-2xl">
            <p className="text-xs font-semibold text-emerald-100/50">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} MCQs
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 rounded-lg border border-[#10b981]/25 disabled:opacity-40 text-xs font-bold text-emerald-400 hover:bg-[#10b981]/10"
              >
                <ChevronLeft size={12} />
              </button>
              <span className="text-xs font-bold text-white px-2">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 rounded-lg border border-[#10b981]/25 disabled:opacity-40 text-xs font-bold text-emerald-400 hover:bg-[#10b981]/10"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Source File / Batch Management Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentBatches.map((batch, index) => (
            <div key={index} className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl hover:border-emerald-400/30 transition-all !p-6 space-y-4 shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold flex-shrink-0">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{batch.sourceDoc}</h3>
                    <span className="badge badge-emerald text-[10px] font-extrabold mt-1">
                      {batch.count} Questions Extracted
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteBatch(batch.sourceDoc)}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-extrabold flex items-center gap-1.5 border border-red-500/25"
                  title="Bulk Delete All MCQs from this Document"
                >
                  <Trash size={12} />
                  <span>Remove File</span>
                </button>
              </div>

              {/* Batch Edit Controls */}
              <div className="p-3.5 rounded-xl bg-[#060e0a] border border-[#10b981]/15 flex items-center justify-between gap-3 text-xs text-emerald-100">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <RefreshCw size={12} className="text-emerald-400" /> Batch Subject:
                </span>

                <select
                  value={batch.subject}
                  onChange={(e) => handleUpdateBatchSubject(batch.sourceDoc, e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#10b981]/25 font-bold text-emerald-400 focus:outline-none bg-[#0a1b14]"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="LR">Logical Reasoning (LR)</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="General">General</option>
                  <option value="MDCAT Mock">MDCAT Mock</option>
                  <option value="ECAT Mock">ECAT Mock</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSourceDocFilter(batch.sourceDoc)
                    setActiveTab('questions')
                    setCurrentPage(1)
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <List size={12} />
                  <span>View Questions</span>
                </button>
                <button
                  onClick={() => {
                    const path = window.location.pathname.startsWith('/admin') 
                      ? '/admin/tests/create' 
                      : '/teacher/tests/create'
                    navigate(path, { 
                      state: { 
                        sourceDoc: batch.sourceDoc, 
                        subject: batch.subject 
                      } 
                    })
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Plus size={12} />
                  <span>Create Test</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Parser Modal */}
      <DocMcqParserModal
        isOpen={showParserModal}
        onClose={() => setShowParserModal(false)}
        onParsedSuccess={handleParsedSuccess}
      />

      {/* Review Editor Modal */}
      <McqReviewEditorModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        mcqs={parsedData.mcqs}
        sourceDoc={parsedData.filename}
        subject={parsedData.subject}
        classLevel={parsedData.classLevel}
        onCompleteSuccess={handleBatchReviewComplete}
      />

      {/* Create / Edit Single Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-2xl !p-6 sm:!p-8 space-y-5 bg-[#0a1b14] border border-[#10b981]/20 rounded-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white">
              {editingId ? 'Edit Question' : 'Create New MCQ'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Question Statement</label>
                <textarea
                  required
                  rows={3}
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter MCQ statement..."
                  className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="LR">Logical Reasoning (LR)</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="General">General</option>
                    <option value="MDCAT Mock">MDCAT Mock</option>
                    <option value="ECAT Mock">ECAT Mock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Grade Level</label>
                  <select
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm font-semibold focus:outline-none"
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

              {/* Options */}
              <div className="space-y-3 text-emerald-100">
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70">Multiple Choice Options</label>
                {formData.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-3">
                    <span className="w-6 text-xs font-extrabold text-white">{String.fromCharCode(65 + oIdx)}.</span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...formData.options]
                        newOpts[oIdx] = e.target.value
                        setFormData({ ...formData, options: newOpts })
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
                    />
                    <label className="flex items-center gap-1 text-xs font-bold text-emerald-400 cursor-pointer">
                      <input
                        type="radio"
                        name="correctIndex"
                        checked={formData.correctIndex === oIdx}
                        onChange={() => setFormData({ ...formData, correctIndex: oIdx })}
                        className="text-emerald-500 focus:ring-emerald-500 bg-[#060e0a] border-[#10b981]/25"
                      />
                      <span>Correct</span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-100/70 hover:bg-[#0a1b14]">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-1">
                  <Check size={14} />
                  <span>Save Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
