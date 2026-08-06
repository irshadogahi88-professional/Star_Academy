import { useState, useEffect } from 'react'
import { CheckCircle, Trash2, Plus, Save, X, FileText, Check, Loader2 } from 'lucide-react'
import api from '../../services/api'

export default function McqReviewEditorModal({ isOpen, onClose, mcqs: initialMcqs, sourceDoc, subject, classLevel, onCompleteSuccess }) {
  const [mcqList, setMcqList] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (initialMcqs) {
      setMcqList(initialMcqs.map((q, idx) => ({ ...q, tempId: idx + 1 })))
    }
  }, [initialMcqs])

  if (!isOpen) return null

  const updateQuestionText = (index, text) => {
    const updated = [...mcqList]
    updated[index].questionText = text
    setMcqList(updated)
  }

  const updateOptionText = (qIndex, optIndex, text) => {
    const updated = [...mcqList]
    updated[qIndex].options[optIndex] = text
    setMcqList(updated)
  }

  const setCorrectOption = (qIndex, optIndex) => {
    const updated = [...mcqList]
    updated[qIndex].correctIndex = optIndex
    setMcqList(updated)
  }

  const deleteQuestion = (qIndex) => {
    const updated = mcqList.filter((_, idx) => idx !== qIndex)
    setMcqList(updated)
  }

  const addNewQuestion = () => {
    setMcqList([
      ...mcqList,
      {
        tempId: Date.now(),
        questionText: 'New Custom Question Statement...',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        explanation: 'Default explanation',
        subject: subject || 'Physics',
        class: classLevel || 'XI',
        chapter: 'General',
        difficulty: 'Medium',
        sourceDoc: sourceDoc || 'Manual Addition',
      },
    ])
  }

  const handleSaveToBank = async () => {
    if (mcqList.length === 0) {
      setErrorMsg('No MCQs available to save.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const response = await api.post('/tests/batch-save-mcqs', { mcqs: mcqList })
      if (response.data.success) {
        onCompleteSuccess(`Successfully added ${mcqList.length} reviewed MCQs to MCQ Bank!`)
        onClose()
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save batch MCQs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="card-glass w-full max-w-4xl max-h-[90vh] flex flex-col !p-6 bg-[#0a1b14] border border-[#10b981]/25 rounded-3xl shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#10b981]/15 pb-4 flex-shrink-0">
          <div>
            <span className="badge badge-emerald text-xs font-bold inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText size={12} /> Source: {sourceDoc}
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              Review & Fine-Tune Extracted MCQs ({mcqList.length} Items)
            </h2>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-emerald-100/50 hover:bg-[#10b981]/10 hover:text-emerald-400 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable MCQ Cards List */}
        <div className="overflow-y-auto flex-1 my-4 space-y-4 pr-2">
          {mcqList.map((mcq, qIdx) => (
            <div key={mcq.tempId || qIdx} className="p-4 rounded-2xl border border-[#10b981]/15 bg-[#060e0a]/40 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {qIdx + 1}
                </span>

                <input
                  type="text"
                  value={mcq.questionText}
                  onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                />

                <button
                  type="button"
                  onClick={() => deleteQuestion(qIdx)}
                  className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0 transition-colors"
                  title="Remove Question"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                {mcq.options.map((opt, optIdx) => {
                  const isCorrect = mcq.correctIndex === optIdx
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                        isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' : 'bg-[#0a1b14] border-[#10b981]/10 text-emerald-100/80'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectOption(qIdx, optIdx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isCorrect ? 'bg-emerald-500 text-emerald-950' : 'bg-[#060e0a] text-emerald-100/60 hover:bg-[#10b981]/10'
                        }`}
                        title="Click to set as Correct Answer"
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </button>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                        className="w-full text-xs font-semibold bg-transparent focus:outline-none text-emerald-100"
                      />

                      {isCorrect && <Check className="text-emerald-400 flex-shrink-0" size={12} />}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl text-xs font-bold text-center bg-red-500/10 text-red-400 border border-red-500/25 flex-shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#10b981]/15 flex-shrink-0">
          <button
            type="button"
            onClick={addNewQuestion}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-all"
          >
            <Plus size={12} /> Add Extra MCQ
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#060e0a] border border-[#10b981]/25 text-xs font-bold text-emerald-100/70 hover:bg-[#0a1b14] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleSaveToBank}
              className="btn-gold text-xs !py-2 !px-5 shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={12} />
                  <span>Saving to Bank...</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span>Approve & Batch Save ({mcqList.length} MCQs)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
