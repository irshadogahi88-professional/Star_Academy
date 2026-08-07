import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Edit2, Trash2, Eye, PlusCircle, X, Save, AlertTriangle } from 'lucide-react'
import api from '../../services/api'
import { useAuthStore } from '../../store/useAuthStore'

export default function TeacherTests() {
  const { user } = useAuthStore()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [editingTest, setEditingTest] = useState(null)
  const [previewTest, setPreviewTest] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0
  })

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await api.get('/tests')
      const allTests = res.data?.data || res.data?.tests || []
      setTests(allTests)
    } catch (err) {
      console.error('Failed to fetch tests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/tests/${deletingId}`)
      setTests(tests.filter(t => t._id !== deletingId))
      setDeletingId(null)
    } catch (err) {
      alert('Failed to delete test')
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put(`/tests/${editingTest._id}`, {
        title: editingTest.title,
        durationMinutes: editingTest.durationMinutes,
        startTime: editingTest.startTime,
        endTime: editingTest.endTime,
        showResultsToStudents: editingTest.showResultsToStudents,
        subject: editingTest.subject,
        grade: editingTest.grade,
        mode: editingTest.mode,
        questions: editingTest.questions,
        allowPracticeMode: editingTest.allowPracticeMode,
        showAnswersAtEnd: editingTest.showAnswersAtEnd,
        passingMarks: editingTest.passingMarks,
        totalMarks: editingTest.questions?.length || editingTest.totalMarks
      })
      if (res.data.success) {
        setTests(tests.map(t => t._id === editingTest._id ? res.data.data : t))
        setEditingTest(null)
      }
    } catch (err) {
      alert('Failed to update test')
    }
  }

  const removeQuestion = (qIndex) => {
    const updatedQs = [...editingTest.questions]
    updatedQs.splice(qIndex, 1)
    setEditingTest({ ...editingTest, questions: updatedQs })
  }

  const handleAddQuestion = () => {
    if (!newQuestion.questionText || newQuestion.options.some(o => !o.trim())) {
      return alert('Please fill all fields for the new question.')
    }
    const updatedQs = [...editingTest.questions, newQuestion]
    setEditingTest({ ...editingTest, questions: updatedQs })
    setShowAddQuestion(false)
    setNewQuestion({ questionText: '', options: ['', '', '', ''], correctOptionIndex: 0 })
  }

  return (
    <div className="space-y-6 text-emerald-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge badge-gold text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <FileText size={12} /> Examination Module
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            Manage Tests
          </h1>
          <p className="text-xs text-emerald-100/70 font-semibold">
            Review, edit, or delete existing examinations.
          </p>
        </div>
        <Link to={window.location.pathname.startsWith('/admin') ? '/admin/tests/create' : '/teacher/tests/create'} className="btn-gold text-sm shadow-md flex items-center gap-1.5 self-start sm:self-center">
          <PlusCircle size={16} /> Create New Test
        </Link>
      </div>

      <div className="card-glass !p-0 overflow-hidden border border-[#10b981]/15 bg-[#0a1b14]/50 rounded-3xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#060e0a] text-white font-extrabold border-b border-[#10b981]/15 uppercase tracking-wider">
                <th className="p-4">Test Title & Subject</th>
                <th className="p-4">Configuration</th>
                <th className="p-4">Access Window</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#10b981]/10 text-emerald-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-emerald-100/50 font-bold">Loading...</td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-emerald-100/50 font-bold">No tests found.</td>
                </tr>
              ) : (
                tests.map(t => (
                  <tr key={t._id} className="hover:bg-[#10b981]/5 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <p className="font-extrabold text-sm">{t.title}</p>
                      <p className="text-[10px] text-emerald-400 font-black uppercase mt-0.5">{t.subject} • Class {t.grade || '11'}</p>
                    </td>
                    <td className="p-4 font-medium text-emerald-100/70">
                      <p className="font-bold">{t.questions?.length || 0} Questions</p>
                      <p className="text-[10px] text-amber-400 font-bold mt-0.5">{t.durationMinutes} Minutes Limit</p>
                    </td>
                    <td className="p-4 font-medium text-emerald-100/60 text-[11px]">
                      {t.startTime ? <p className="text-emerald-400 font-bold">Starts: {new Date(t.startTime).toLocaleString()}</p> : <p>Starts: Anytime</p>}
                      {t.endTime ? <p className="text-red-400 font-bold mt-0.5">Ends: {new Date(t.endTime).toLocaleString()}</p> : <p className="mt-0.5">Ends: Never</p>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setPreviewTest(t)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold text-xs" title="Preview Questions">
                          <Eye size={12} />
                        </button>
                        <button onClick={() => setEditingTest(t)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 font-bold text-xs" title="Edit Test Details">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => setDeletingId(t._id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-bold text-xs" title="Delete Test">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-2xl max-h-[80vh] flex flex-col bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#10b981]/15 flex items-center justify-between bg-[#060e0a]">
              <h2 className="text-lg font-black text-white">{previewTest.title} (Preview)</h2>
              <button onClick={() => setPreviewTest(null)} className="text-emerald-100/50 hover:text-red-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4">
              {previewTest.questions?.map((q, idx) => (
                <div key={idx} className="p-4 bg-[#060e0a]/40 border border-[#10b981]/15 rounded-xl space-y-2">
                  <p className="font-bold text-sm text-white">{idx + 1}. {q.questionText}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={`p-2 rounded-md text-xs font-semibold ${q.correctOptionIndex === oIdx ? 'bg-emerald-500/10 border border-emerald-500 text-emerald-400' : 'bg-[#0a1b14] border border-[#10b981]/10 text-emerald-100/70'}`}>
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-lg !p-6 space-y-4 bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-white">
              Edit Test Configuration
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Test Title</label>
                <input
                  type="text" required
                  value={editingTest.title}
                  onChange={e => setEditingTest({ ...editingTest, title: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Time Limit (Minutes)</label>
                  <input
                    type="number" required min="1"
                    value={editingTest.durationMinutes}
                    onChange={e => setEditingTest({ ...editingTest, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Passing Score (%)</label>
                  <input
                    type="number" min="30" max="90" required
                    value={editingTest.passingScore !== undefined ? editingTest.passingScore : (editingTest.totalMarks ? Math.round((editingTest.passingMarks || (editingTest.totalMarks * 0.4)) / editingTest.totalMarks * 100) : 40)}
                    onChange={e => {
                      const score = Number(e.target.value)
                      const qCount = editingTest.questions?.length || editingTest.totalMarks || 1
                      setEditingTest({ 
                        ...editingTest, 
                        passingScore: score, 
                        passingMarks: Math.round(qCount * (score / 100)) 
                      })
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Subject</label>
                  <select
                    value={editingTest.subject}
                    onChange={e => setEditingTest({ ...editingTest, subject: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-emerald-400 font-extrabold focus:outline-none"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="LR">LR</option>
                    <option value="All">All</option>
                    <option value="MDCAT Mock">MDCAT Mock</option>
                    <option value="ECAT Mock">ECAT Mock</option>
                  </select>
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Grade/Class</label>
                  <select
                    value={editingTest.grade}
                    onChange={e => setEditingTest({ ...editingTest, grade: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-emerald-400 font-extrabold focus:outline-none"
                  >
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="MDCAT">MDCAT</option>
                    <option value="ECAT">ECAT</option>
                  </select>
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Test Mode</label>
                  <select
                    value={editingTest.mode || 'test'}
                    onChange={e => setEditingTest({ ...editingTest, mode: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-emerald-400 font-extrabold focus:outline-none"
                  >
                    <option value="test">Test Mode</option>
                    <option value="practice">Practice Mode</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Open Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={editingTest.startTime ? new Date(new Date(editingTest.startTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={e => setEditingTest({ ...editingTest, startTime: e.target.value || null })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-emerald-100/70 mb-1.5">Close Time (Optional)</label>
                  <input
                    type="datetime-local"
                    value={editingTest.endTime ? new Date(new Date(editingTest.endTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                    onChange={e => setEditingTest({ ...editingTest, endTime: e.target.value || null })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-white text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingTest.showResultsToStudents !== false} 
                    onChange={e => setEditingTest({ ...editingTest, showResultsToStudents: e.target.checked })} 
                    className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-[#060e0a] border-[#10b981]/25" 
                  />
                  <span className="text-xs font-bold text-emerald-100/70">Publish Results (allow students to see score report)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingTest.allowPracticeMode !== false} 
                    onChange={e => setEditingTest({ ...editingTest, allowPracticeMode: e.target.checked })} 
                    className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-[#060e0a] border-[#10b981]/25" 
                  />
                  <span className="text-xs font-bold text-emerald-100/70">Allow Practice Mode (untimed option for study)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={editingTest.showAnswersAtEnd !== false} 
                    onChange={e => setEditingTest({ ...editingTest, showAnswersAtEnd: e.target.checked })} 
                    className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-[#060e0a] border-[#10b981]/25" 
                  />
                  <span className="text-xs font-bold text-emerald-100/70">Show Detailed Answer Key & Explanations on score report</span>
                </label>
              </div>

              <div className="border-t border-[#10b981]/15 pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-white">
                    Manage Questions ({editingTest.questions?.length || 0})
                  </label>
                  <button type="button" onClick={() => setShowAddQuestion(!showAddQuestion)} className="text-xs font-bold text-emerald-400 hover:text-white flex items-center gap-1">
                    <PlusCircle size={12} /> Add Custom MCQ
                  </button>
                </div>

                {showAddQuestion && (
                  <div className="p-3 bg-[#060e0a]/65 border border-[#10b981]/25 rounded-lg mb-3 space-y-2">
                    <input type="text" placeholder="Question Text" value={newQuestion.questionText} onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})} className="w-full px-2 py-1.5 text-xs rounded bg-[#060e0a] border border-[#10b981]/25 text-white" />
                    <div className="grid grid-cols-2 gap-2">
                      {newQuestion.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input type="radio" name="newCorrectOpt" checked={newQuestion.correctOptionIndex === oIdx} onChange={() => setNewQuestion({...newQuestion, correctOptionIndex: oIdx})} className="text-emerald-500 focus:ring-emerald-500" />
                          <input type="text" placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} value={opt} onChange={e => {
                            const newOpts = [...newQuestion.options]; newOpts[oIdx] = e.target.value; setNewQuestion({...newQuestion, options: newOpts})
                          }} className="w-full px-2 py-1 text-xs rounded bg-[#060e0a] border border-[#10b981]/25 text-white" />
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={handleAddQuestion} className="w-full bg-[#147a4a] text-white py-1.5 rounded text-xs font-bold mt-1">Add Question to Test</button>
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {editingTest.questions?.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#060e0a]/40 border border-[#10b981]/15 rounded-lg">
                      <span className="text-xs font-semibold text-white truncate w-3/4">
                        {idx + 1}. {q.questionText}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => removeQuestion(idx)} 
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Remove Question"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {(!editingTest.questions || editingTest.questions.length === 0) && (
                    <p className="text-xs text-emerald-100/50">No questions available.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingTest(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-100/70 bg-[#060e0a] border border-[#10b981]/25 hover:bg-[#0a1b14]">Cancel</button>
                <button type="submit" className="btn-gold text-xs !py-2 !px-5 flex items-center gap-1"><Save size={12} /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="card-glass w-full max-w-sm !p-6 space-y-4 bg-[#0a1b14] border border-red-500/30 rounded-3xl text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-lg font-black text-red-400">Delete Test?</h2>
            <p className="text-xs font-bold text-emerald-100/70">This action is permanent and cannot be undone.</p>
            <div className="flex justify-center gap-3 pt-4">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#060e0a] border border-[#10b981]/25 text-emerald-100/70 hover:bg-[#0a1b14]">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
