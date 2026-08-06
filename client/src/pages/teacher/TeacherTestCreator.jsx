import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Bot, CheckCircle, Clock, Trophy, HelpCircle, Upload, X } from 'lucide-react'
import api from '../../services/api'

export default function TeacherTestCreator() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('manual') // 'manual' | 'ai'
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Physics',
    classLevel: '11',
    timeLimitMinutes: 30,
    passingScore: 50,
    totalMarks: 100,
    examMode: 'timed', // 'timed' | 'practice'
    startTime: '',
    endTime: '',
    showResultsToStudents: true,
    allowPracticeMode: true,
    showAnswersAtEnd: true,
  })
  const [created, setCreated] = useState(false)

  // AI Builder States
  const [selectedFile, setSelectedFile] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [aiParsedMcqs, setAiParsedMcqs] = useState([])

  // Manual Bank Selector States
  const [bankMcqs, setBankMcqs] = useState([])
  const [loadingBank, setLoadingBank] = useState(false)
  const [selectedMcqIds, setSelectedMcqIds] = useState([])
  const [bankSearchTerm, setBankSearchTerm] = useState('')

  // Fetch Bank MCQs when manual mode is selected or filters change
  useEffect(() => {
    if (mode === 'manual') {
      fetchBankMcqs()
    }
  }, [mode, formData.subject, formData.classLevel])

  const fetchBankMcqs = async () => {
    setLoadingBank(true)
    try {
      const query = `?subject=${formData.subject}&classLevel=${formData.classLevel}&limit=100`
      const response = await api.get(`/tests/mcqs${query}`)
      const data = response.data
      if (data.success) {
        setBankMcqs(data.data)
      }
    } catch (err) {
      console.error('Error fetching bank MCQs:', err)
    } finally {
      setLoadingBank(false)
    }
  }

  const toggleMcqSelection = (id) => {
    setSelectedMcqIds(prev => 
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    )
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleAIParse = async () => {
    if (!selectedFile) return
    setIsParsing(true)
    
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedFile)
      formDataUpload.append('subject', formData.subject)
      formDataUpload.append('classLevel', formData.classLevel)

      const response = await api.post('/tests/parse-doc', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const data = response.data
      if (data.success && data.mcqs) {
        setAiParsedMcqs(data.mcqs)
      } else {
        alert(data.message || 'Failed to extract MCQs.')
      }
    } catch (err) {
      alert('Error parsing document: ' + err.message)
    } finally {
      setIsParsing(false)
    }
  }

  const handleBatchSaveAndCreate = async () => {
    if (aiParsedMcqs.length === 0) return
    
    try {
      const response = await api.post('/tests/batch-save-mcqs', { mcqs: aiParsedMcqs })
      const data = response.data
      
      if (!data.success) {
        return alert(data.message || 'Failed to save to bank.')
      }

      const mcqIds = data.data.map(q => q._id)

      const testRes = await api.post('/tests/create-from-bank', {
        title: formData.title,
        subject: formData.subject,
        grade: formData.classLevel,
        mode: 'manual',
        examMode: formData.examMode,
        durationMinutes: formData.timeLimitMinutes,
        totalMarks: mcqIds.length * 5,
        mcqIds: mcqIds,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        showResultsToStudents: formData.showResultsToStudents,
        allowPracticeMode: formData.allowPracticeMode,
        showAnswersAtEnd: formData.showAnswersAtEnd
      })
      
      const testData = testRes.data
      if (testData.success) {
        setCreated(true)
        setTimeout(() => navigate('/teacher'), 2000)
      } else {
        alert(testData.message || 'Failed to publish test.')
      }
    } catch (err) {
      alert('Error saving MCQs and creating test: ' + err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'ai') return // handled by batch save and create
    
    if (mode === 'manual') {
      if (selectedMcqIds.length === 0) return alert('Please select at least one question from the bank.')
      try {
        const response = await api.post('/tests/create-from-bank', {
          title: formData.title,
          subject: formData.subject,
          grade: formData.classLevel,
          mode: 'manual',
          examMode: formData.examMode,
          durationMinutes: formData.timeLimitMinutes,
          totalMarks: selectedMcqIds.length * 5,
          mcqIds: selectedMcqIds,
          startTime: formData.startTime || null,
          endTime: formData.endTime || null,
          showResultsToStudents: formData.showResultsToStudents,
          allowPracticeMode: formData.allowPracticeMode,
          showAnswersAtEnd: formData.showAnswersAtEnd
        })
        
        const data = response.data
        if (data.success) {
          setCreated(true)
          setTimeout(() => navigate('/teacher'), 2000)
        } else {
          alert(data.message || 'Failed to create test.')
        }
      } catch (err) {
        alert('Error creating manual test: ' + err.message)
      }
      return
    }
    
    if (mode === 'random') {
      try {
        const response = await api.post('/tests/create-from-bank', {
          title: formData.title,
          subject: formData.subject,
          grade: formData.classLevel,
          mode: 'random',
          examMode: formData.examMode,
          durationMinutes: formData.timeLimitMinutes,
          totalMarks: formData.totalMarks,
          randomCount: Math.min(100, Math.max(10, Math.floor(formData.totalMarks / 5))), // estimate count based on marks, max 100
          startTime: formData.startTime || null,
          endTime: formData.endTime || null,
          showResultsToStudents: formData.showResultsToStudents,
          allowPracticeMode: formData.allowPracticeMode,
          showAnswersAtEnd: formData.showAnswersAtEnd
        })
        
        const data = response.data
        if (data.success) {
          setCreated(true)
          setTimeout(() => navigate('/teacher'), 2000)
        } else {
          alert(data.message || 'Failed to create test.')
        }
      } catch (err) {
        alert('Error creating random test: ' + err.message)
      }
      return
    }

    setCreated(true)
    setTimeout(() => {
      navigate('/teacher')
    }, 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-emerald-100">
      {/* Header */}
      <div>
        <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <PlusCircle size={12} /> Test Construction Wizard
        </span>
        <h1 className="text-3xl font-black text-white mt-1">
          Create New Examination
        </h1>
        <p className="text-xs text-emerald-100/70 font-semibold">Publish a timed mock exam or practice test for MDCAT, ECAT, or Board preparation.</p>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`card-glass !p-5 text-left border rounded-3xl transition-all ${
            mode === 'manual'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
              : 'border-[#10b981]/15 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className={mode === 'manual' ? 'text-emerald-400' : 'text-emerald-100/50'} size={20} />
            <h3 className="font-extrabold text-base text-white">
              Bank Selector
            </h3>
          </div>
          <p className="text-xs text-emerald-100/60 font-semibold">Manually select specific questions from central MCQ Question Bank.</p>
        </button>

        <button
          type="button"
          onClick={() => setMode('random')}
          className={`card-glass !p-5 text-left border rounded-3xl transition-all ${
            mode === 'random'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-md'
              : 'border-[#10b981]/15 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className={mode === 'random' ? 'text-emerald-400' : 'text-emerald-100/50'} size={20} />
            <h3 className="font-extrabold text-base text-white">
              Random Auto-Sampler
            </h3>
          </div>
          <p className="text-xs text-emerald-100/60 font-semibold">Auto-pick randomized MCQs matching selected Subject, Grade, and Difficulty Ratio.</p>
        </button>

        <button
          type="button"
          onClick={() => setMode('ai')}
          className={`card-glass !p-5 text-left border rounded-3xl transition-all ${
            mode === 'ai'
              ? 'border-amber-500 bg-amber-500/10 shadow-md'
              : 'border-[#10b981]/15 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Bot className={mode === 'ai' ? 'text-amber-400' : 'text-emerald-100/50'} size={20} />
            <h3 className="font-extrabold text-base text-white">
              AI Automated Builder
            </h3>
          </div>
          <p className="text-xs text-emerald-100/60 font-semibold">Use Gemini AI / Uploaded File batch to generate randomized questions.</p>
        </button>
      </div>

      {/* Creation Form */}
      <div className="card-glass !p-8 space-y-6 bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-3xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Test Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. MDCAT Physics Mock Exam 2026 — Vectors & Motion"
              className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-emerald-400 font-extrabold focus:outline-none"
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
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Target Grade</label>
              <select
                value={formData.classLevel}
                onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-emerald-400 font-extrabold focus:outline-none"
              >
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11 (XI)</option>
                <option value="12">Grade 12 (XII)</option>
                <option value="MDCAT">MDCAT</option>
                <option value="ECAT">ECAT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Exam Mode</label>
              <select
                value={formData.examMode}
                onChange={(e) => setFormData({ ...formData, examMode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-emerald-400 font-extrabold focus:outline-none"
              >
                <option value="timed">Timed Examination Mode</option>
                <option value="practice">Untimed Practice Mode</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                <span className="inline-flex items-center gap-1"><Clock size={12} /> Time Limit (Mins)</span>
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={formData.timeLimitMinutes}
                onChange={(e) => setFormData({ ...formData, timeLimitMinutes: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                <span className="inline-flex items-center gap-1"><Trophy size={12} /> Total Marks</span>
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Passing Score (%)</label>
              <input
                type="number"
                min="30"
                max="90"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Time Slot & Security Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[#060e0a]/40 rounded-2xl border border-[#10b981]/15">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                Test Open Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-sm focus:outline-none text-white focus:border-emerald-400"
              />
              <p className="text-[10px] text-emerald-100/50 mt-1 font-semibold">Test will be hidden from students before this time.</p>
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">
                Test Close Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-sm focus:outline-none text-white focus:border-emerald-400"
              />
              <p className="text-[10px] text-emerald-100/50 mt-1 font-semibold">Test cannot be started after this deadline.</p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-3 p-3 bg-[#060e0a]/50 rounded-xl border border-[#10b981]/15 cursor-pointer hover:border-emerald-400 transition-colors shadow-sm">
                <input
                  type="checkbox"
                  checked={formData.allowPracticeMode}
                  onChange={(e) => setFormData({ ...formData, allowPracticeMode: e.target.checked })}
                  className="w-5 h-5 text-emerald-500 bg-[#060e0a] border-[#10b981]/25 rounded focus:ring-emerald-500"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Allow Practice Mode</span>
                  <span className="text-xs text-emerald-100/60 font-semibold">Uncheck this to force students to only take this test in Exam Mode (strict timer, no instant answers).</span>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-[#060e0a]/50 rounded-xl border border-[#10b981]/15 cursor-pointer hover:border-emerald-400 transition-colors shadow-sm">
                <input
                  type="checkbox"
                  checked={formData.showAnswersAtEnd}
                  onChange={(e) => setFormData({ ...formData, showAnswersAtEnd: e.target.checked })}
                  className="w-5 h-5 text-emerald-500 bg-[#060e0a] border-[#10b981]/25 rounded focus:ring-emerald-500"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">Show Detailed Answers at End</span>
                  <span className="text-xs text-emerald-100/60 font-semibold">Uncheck this to hide the correct options and explanations in the final result screen. They will only see their Score.</span>
                </div>
              </label>
            </div>
          </div>

          {mode === 'ai' && (
            <div className="space-y-6 pt-4 border-t border-[#10b981]/15">
              <div className="bg-[#060e0a]/40 border-2 border-dashed border-[#10b981]/20 rounded-2xl p-8 text-center hover:bg-[#060e0a]/60 transition-colors">
                <Bot size={32} className="mx-auto text-amber-500 mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-white mb-1">Upload Source Document</h3>
                <p className="text-xs text-emerald-100/60 mb-4 font-semibold">Upload a PDF or Word document containing raw text questions. Gemini AI will automatically extract and format them into MCQs.</p>
                
                <input 
                  type="file" 
                  id="doc-upload" 
                  className="hidden" 
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileSelect}
                />
                <label 
                  htmlFor="doc-upload" 
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm cursor-pointer hover:bg-amber-500/20 transition-all shadow-md"
                >
                  <Upload size={16} />
                  <span>{selectedFile ? selectedFile.name : 'Select File (PDF / Word)'}</span>
                </label>
              </div>

              {selectedFile && (
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={handleAIParse}
                    disabled={isParsing}
                    className={`btn-primary shadow-md flex items-center gap-2 ${isParsing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isParsing ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                    ) : (
                      <Bot size={14} />
                    )}
                    <span>{isParsing ? 'Extracting via Gemini AI...' : 'Generate MCQs'}</span>
                  </button>
                </div>
              )}

              {aiParsedMcqs.length > 0 && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-white">Extracted MCQs ({aiParsedMcqs.length})</h3>
                    <button 
                      type="button" 
                      onClick={handleBatchSaveAndCreate}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-emerald-950 font-bold text-xs hover:bg-emerald-400 shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle size={12} />
                      Publish Examination
                    </button>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {aiParsedMcqs.map((mcq, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-[#10b981]/15 bg-[#060e0a]/50 shadow-sm relative group">
                        <button 
                          type="button"
                          onClick={() => setAiParsedMcqs(aiParsedMcqs.filter((_, i) => i !== idx))}
                          className="absolute top-3 right-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                        >
                          Remove
                        </button>
                        <p className="font-bold text-sm text-white mb-3 flex gap-2">
                          <span className="text-emerald-400">{idx + 1}.</span> {mcq.questionText}
                        </p>
                        <div className="grid grid-cols-2 gap-2 pl-6">
                          {mcq.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`text-xs px-3 py-1.5 rounded-lg border ${mcq.correctIndex === oIdx ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold shadow-sm' : 'bg-[#0a1b14] border border-[#10b981]/10 text-emerald-100/70'}`}>
                              <span className="font-bold mr-1">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'manual' && (
            <div className="space-y-4 pt-4 border-t border-[#10b981]/15">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-white text-lg">Select Questions from Bank</h3>
                <span className="text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full shadow-sm">
                  Selected: {selectedMcqIds.length} / {bankMcqs.length}
                </span>
              </div>
              <p className="text-xs text-emerald-100/60 font-semibold">
                Showing available MCQs for <strong>{formData.subject}</strong> (Grade {formData.classLevel}). Change subject above to load different questions.
              </p>

              <div className="relative">
                <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/40" size={14} />
                <input
                  type="text"
                  placeholder="Search questions by keyword..."
                  value={bankSearchTerm}
                  onChange={(e) => setBankSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-[#10b981]/15 p-2 rounded-xl bg-[#060e0a]/40">
                {loadingBank ? (
                  <p className="text-center text-xs p-4 text-emerald-100/50 font-bold">Loading questions...</p>
                ) : bankMcqs.filter(m => m.questionText.toLowerCase().includes(bankSearchTerm.toLowerCase())).length === 0 ? (
                  <p className="text-center text-xs p-4 text-emerald-100/50 font-bold">No questions found in bank for this subject.</p>
                ) : (
                  bankMcqs.filter(m => m.questionText.toLowerCase().includes(bankSearchTerm.toLowerCase())).map((mcq, idx) => {
                    const isSelected = selectedMcqIds.includes(mcq._id)
                    return (
                      <div 
                        key={mcq._id} 
                        onClick={() => toggleMcqSelection(mcq._id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors flex gap-3 ${isSelected ? 'bg-emerald-500/10 border-emerald-500' : 'bg-[#0a1b14] border border-[#10b981]/10 hover:border-emerald-500/30'}`}
                      >
                        <div className="pt-0.5">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 text-emerald-500 bg-[#060e0a] border-[#10b981]/25 rounded focus:ring-emerald-500 pointer-events-none" 
                          />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold mb-1 ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                            {mcq.questionText}
                          </p>
                          <div className="flex gap-2 text-[10px] text-emerald-100/40">
                            <span className="capitalize">{mcq.difficulty || 'Medium'}</span> • <span>{mcq.chapter || 'General'}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {mode !== 'ai' && (
            <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#10b981]/15">
              <button type="button" onClick={() => navigate('/teacher')} className="px-5 py-3 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-100/70 hover:bg-[#0a1b14]">
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs !py-3 !px-6 shadow-md flex items-center gap-1.5">
                <CheckCircle size={14} />
                <span>Publish Examination</span>
              </button>
            </div>
          )}

          {created && (
            <div className="p-4 rounded-xl text-sm font-bold text-center bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 animate-pulse">
              🎉 Action completed successfully! Redirecting...
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
