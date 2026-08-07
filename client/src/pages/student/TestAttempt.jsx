import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Flag, XCircle, Lightbulb, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import testService from '../../services/testService'

export default function TestAttempt() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState([])
  const [testInfo, setTestInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const [testState, setTestState] = useState('intro') // 'intro', 'running'
  const [mode, setMode] = useState('exam') // 'practice', 'exam'

  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({}) // { questionId: optionIndex }
  const [flagged, setFlagged] = useState({}) // { questionId: boolean }
  const [timeLeft, setTimeLeft] = useState(0)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch test details
  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true)
      const res = await testService.getTestById(id)
      if (res && res.success) {
        setTestInfo(res.data)
        setQuestions(res.data.questions || [])
        setTimeLeft((res.data.durationMinutes || 10) * 60)
      } else {
        alert('Failed to load test. ' + (res.error || ''))
        navigate('/student/tests')
      }
      setLoading(false)
    }
    if (id) fetchTest()
  }, [id, navigate])

  // Timer countdown
  useEffect(() => {
    if (testState !== 'running' || mode !== 'exam') return

    if (timeLeft <= 0) {
      handleSubmitTest(true)
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, testState, mode])

  // Window blur / Tab switch detector (only in exam mode)
  useEffect(() => {
    if (testState !== 'running' || mode !== 'exam') return

    const handleBlur = () => {
      setTabSwitches((prev) => {
        const next = prev + 1
        setShowWarningModal(true)
        if (next >= 3) {
          handleSubmitTest(true)
        }
        return next
      })
    }
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [testState, mode])

  const currentQ = questions.length > 0 ? questions[currentIndex] : null

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleSelectOption = (optionIndex) => {
    if (currentQ) {
      if (mode === 'practice' && userAnswers[currentQ._id || currentQ.id] !== undefined) {
        return // Prevent changing answer in practice mode
      }
      setUserAnswers((prev) => ({ ...prev, [currentQ._id || currentQ.id]: optionIndex }))
    }
  }

  const toggleFlag = () => {
    if (currentQ) {
      setFlagged((prev) => ({ ...prev, [currentQ._id || currentQ.id]: !prev[currentQ._id || currentQ.id] }))
    }
  }

  const handleStart = (selectedMode) => {
    setMode(selectedMode)
    setTestState('running')
  }

  const handleSubmitTest = async (auto = false) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    // Call backend API evaluation
    const payload = {
      answers: userAnswers,
      tabSwitches,
      timeTakenSeconds: testInfo ? (testInfo.durationMinutes * 60) - timeLeft : 0,
      autoSubmitted: auto,
    }

    const apiRes = await testService.submitTestAttempt(id, payload)

    let score = 0
    let resultPayload = null

    if (apiRes && apiRes.success && apiRes.data) {
      score = apiRes.data.score
      resultPayload = apiRes.data
    } else {
      // Fallback local scoring if API fails
      questions.forEach((q) => {
        if (userAnswers[q._id || q.id] === q.correctOptionIndex) {
          score += 4 // Assuming 4 marks per correct answer
        }
      })
    }

    navigate(`/dashboard/tests/${id}/result`, {
      state: {
        answers: userAnswers,
        score,
        totalQuestions: questions.length,
        autoSubmitted: auto,
        tabSwitches,
        apiData: resultPayload,
        testInfo, // Pass test info to result screen for constraints check
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060e0a]">
        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#060e0a] px-4 text-center">
        <AlertTriangle className="text-amber-500 mb-4 animate-pulse" size={48} />
        <h2 className="text-3xl font-black text-white mb-2">No Questions Available</h2>
        <p className="text-emerald-100/50 mb-6 font-semibold">This test currently has no questions assigned to it.</p>
        <button onClick={() => navigate('/student/tests')} className="btn-primary">Return to Dashboard</button>
      </div>
    )
  }

  if (testState === 'intro') {
    const allowPractice = testInfo?.allowPracticeMode !== false // Default true if undefined

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#060e0a] to-[#08140f] flex items-center justify-center p-6 text-white">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
              {testInfo?.title}
            </h1>
            <p className="text-lg text-emerald-100/70 font-semibold">How would you like to attempt this test?</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <button 
              onClick={() => handleStart('practice')}
              disabled={!allowPractice}
              className={`group flex flex-col items-center text-center p-10 rounded-[2rem] border transition-all duration-300 ${
                allowPractice 
                  ? 'bg-[#0a1b14]/50 border-[#10b981]/15 hover:border-emerald-400/40 hover:shadow-2xl hover:-translate-y-1' 
                  : 'bg-[#0a1b14]/20 border-[#10b981]/5 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                allowPractice 
                  ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-emerald-950'
                  : 'bg-[#0a1b14]/40 text-emerald-100/20'
              }`}>
                <Brain size={36} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Practice Mode</h3>
              <p className="text-sm text-emerald-100/60 leading-relaxed font-semibold">
                {allowPractice 
                  ? 'Learn as you go. Selecting an answer immediately reveals the correct option and detailed explanation. No timer.'
                  : 'Practice mode has been disabled for this test by your instructor.'
                }
              </p>
            </button>

            <button 
              onClick={() => handleStart('exam')}
              className="group flex flex-col items-center text-center p-10 rounded-[2rem] border border-[#10b981]/15 bg-[#0a1b14]/50 hover:border-amber-500/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-amber-950 transition-colors">
                <Clock size={36} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Exam Mode</h3>
              <p className="text-sm text-emerald-100/60 leading-relaxed font-semibold">
                Strict timer enabled. Answers are hidden until the final submission. Anti-cheat window blur tracking is active. Tests your true readiness.
              </p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasAnsweredCurrent = userAnswers[currentQ._id || currentQ.id] !== undefined

  return (
    <div className="min-h-screen bg-[#08140f] flex flex-col font-sans text-emerald-100">
      {/* Top Header */}
      <header className="bg-[#060e0a]/80 backdrop-blur-md border-b border-[#10b981]/15 h-20 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-40 shadow-sm">
        <div>
          <h1 className="font-extrabold text-white text-xl truncate max-w-[200px] sm:max-w-md">{testInfo?.title}</h1>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">Question {currentIndex + 1} of {questions.length}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold ${
            mode === 'exam' 
              ? (timeLeft < 60 ? 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20') 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {mode === 'exam' ? <Clock className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
            <span className="tracking-wide font-black">
              {mode === 'exam' ? formatTime(timeLeft) : 'Practice Mode'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Question Area */}
        <div className="flex-1 w-full">
          <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-[2rem] p-8 sm:p-12 mb-8 relative overflow-hidden min-h-[400px]">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-500 to-amber-500"></div>
            
            <div className="flex justify-between items-start mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed pl-2">
                {currentQ.questionText}
              </h2>
              <button
                onClick={toggleFlag}
                title="Flag Question"
                className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                  flagged[currentQ._id || currentQ.id]
                    ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 ring-2 ring-amber-500/40'
                    : 'bg-[#08140f] text-emerald-100/40 border border-[#10b981]/10 hover:bg-[#060e0a] hover:text-emerald-400'
                }`}
              >
                <Flag size={18} />
              </button>
            </div>
            
            <div className="space-y-4 pl-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = userAnswers[currentQ._id || currentQ.id] === idx
                const correctIdx = currentQ.correctOptionIndex !== undefined ? currentQ.correctOptionIndex : currentQ.correctIndex
                
                let btnClass = "border-[#10b981]/25 hover:border-emerald-400/50 hover:bg-[#10b981]/10 text-emerald-100/90 bg-[#060e0a]"
                let iconContent = isSelected ? <div className="w-3 h-3 bg-emerald-400 rounded-full" /> : null
                let iconBorder = isSelected ? "border-emerald-400" : "border-[#10b981]/25"
                
                if (mode === "practice" && hasAnsweredCurrent) {
                  const isCorrectOption = correctIdx !== undefined && correctIdx === idx
                  
                  if (isCorrectOption) {
                    btnClass = "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold shadow-md ring-2 ring-emerald-500/40"
                    iconContent = <CheckCircle className="w-full h-full text-emerald-400" />
                    iconBorder = "border-transparent"
                  } else if (isSelected && !isCorrectOption) {
                    btnClass = "border-red-500 bg-red-500/15 text-red-400 font-bold ring-2 ring-red-500/40"
                    iconContent = <XCircle className="w-full h-full text-red-400" />
                    iconBorder = "border-transparent"
                  } else {
                    btnClass = "border-[#10b981]/5 opacity-40 cursor-not-allowed bg-[#060e0a]"
                  }
                } else if (isSelected) {
                  btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold shadow-sm ring-1 ring-emerald-500"
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={mode === "practice" && hasAnsweredCurrent}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 flex items-center group ${btnClass}`}
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${iconBorder}`}>
                      {iconContent}
                    </div>
                    <span className="text-base sm:text-lg leading-relaxed">{opt}</span>
                  </button>
                )
              })}
            </div>
            
            {/* Practice Mode Explanation Dropdown */}
            <AnimatePresence>
              {mode === "practice" && hasAnsweredCurrent && currentQ.explanation && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="ml-2 overflow-hidden"
                >
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-amber-500 font-bold mb-1 text-sm sm:text-base">Explanation</h4>
                        <p className="text-emerald-100/90 leading-relaxed text-xs sm:text-sm">{currentQ.explanation}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <button
              onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl font-extrabold border border-[#10b981]/25 bg-[#0a1b14] text-emerald-100 hover:bg-[#08140f] disabled:opacity-40 transition-all text-xs sm:text-sm"
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {currentIndex < questions.length - 1 && (
                <button
                  onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}
                  className="flex items-center space-x-1.5 px-4 py-3.5 rounded-2xl font-extrabold border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all text-xs sm:text-sm"
                >
                  <span>Skip</span>
                </button>
              )}
              
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}
                  className="flex items-center space-x-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all text-xs sm:text-sm"
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => handleSubmitTest(false)}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-gold hover:bg-amber-500 text-emerald-950 rounded-2xl font-black shadow-lg shadow-amber-500/20 transition-all text-xs sm:text-sm"
                >
                  <span>{isSubmitting ? "Submitting..." : "Submit Test"}</span>
                  <CheckCircle size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Question Tracker Grid (Visible on mobile/tablet) */}
          <div className="block lg:hidden card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-[2rem] p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-white uppercase tracking-wider text-xs">Question Grid</h3>
              <span className="text-xs font-bold text-emerald-400">{Object.keys(userAnswers).length} / {questions.length} Attempted</span>
            </div>
            
            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 mb-6">
              {questions.map((q, idx) => {
                const isAttempted = userAnswers[q._id || q.id] !== undefined
                const isCurrent = currentIndex === idx
                const isFlagged = flagged[q._id || q.id]
                
                let btnClass = "bg-[#060e0a] text-emerald-100/50 hover:bg-[#08140f] border-[#10b981]/15 border"
                if (isAttempted) {
                  btnClass = "bg-emerald-500 text-emerald-950 border-transparent font-black"
                }
                if (isCurrent) {
                  btnClass = isAttempted 
                    ? "bg-emerald-500 text-emerald-950 ring-2 ring-offset-2 ring-offset-[#08140f] ring-emerald-500" 
                    : "bg-transparent text-amber-500 border-amber-500 border-2"
                }

                return (
                  <button
                    key={q._id || q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-full aspect-square rounded-xl font-bold text-xs flex items-center justify-center transition-all ${btnClass}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 border-2 border-[#0a1b14] rounded-full"></span>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handleSubmitTest(false)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-gold hover:bg-amber-600 text-emerald-950 rounded-xl font-black shadow-md transition-all disabled:opacity-50 text-sm"
            >
              <span>{isSubmitting ? "Submitting..." : "Submit Examination"}</span>
              <CheckCircle size={16} />
            </button>
          </div>
        </div>

        {/* Navigation Sidebar (Desktop) */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-[2rem] p-6 sm:p-8 sticky top-28">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-white uppercase tracking-wider text-sm">Question Tracker</h3>
              <span className="text-xs font-bold text-emerald-100/50">{Object.keys(userAnswers).length} / {questions.length}</span>
            </div>
            
            <div className="grid grid-cols-5 gap-3 mb-8">
              {questions.map((q, idx) => {
                const isAttempted = userAnswers[q._id || q.id] !== undefined
                const isCurrent = currentIndex === idx
                const isFlagged = flagged[q._id || q.id]
                
                let btnClass = "bg-[#060e0a] text-emerald-100/50 hover:bg-[#08140f] border-[#10b981]/15 border"
                if (isAttempted) {
                  btnClass = "bg-emerald-500 text-emerald-950 border-transparent font-black"
                }
                if (isCurrent) {
                  btnClass = isAttempted 
                    ? "bg-emerald-500 text-emerald-950 ring-2 ring-offset-2 ring-offset-[#08140f] ring-emerald-500" 
                    : "bg-transparent text-amber-500 border-amber-500 border-2"
                }

                return (
                  <button
                    key={q._id || q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-full aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all ${btnClass}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-[#0a1b14] rounded-full"></span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="space-y-4 mb-10 p-4 bg-[#08140f]/60 border border-[#10b981]/10 rounded-2xl">
              <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-emerald-100/70">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Answered ({Object.keys(userAnswers).length})</span>
              </div>
              <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-emerald-100/70">
                <div className="w-3 h-3 rounded-full bg-[#060e0a] border border-[#10b981]/15"></div>
                <span>Skipped / Unattempted ({questions.length - Object.keys(userAnswers).length})</span>
              </div>
              <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-emerald-100/70">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Flagged ({Object.values(flagged).filter(Boolean).length})</span>
              </div>
            </div>

            <button
              onClick={() => handleSubmitTest(false)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-gold hover:bg-amber-600 text-emerald-950 rounded-xl font-black shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50"
            >
              <span>{isSubmitting ? "Grading..." : "Submit Test"}</span>
              <CheckCircle size={18} />
            </button>
          </div>
        </div>

      </main>

      {/* Blur Warning Modal (Only for Exam Mode) */}
      <AnimatePresence>
        {showWarningModal && mode === 'exam' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a1b14] border border-amber-500/40 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="font-black text-2xl text-white mb-2">
                  Window Blur Detected
                </h3>
                <p className="text-sm text-emerald-100/60 leading-relaxed font-semibold">
                  Navigating away from the test tab is strictly monitored during timed exams. You have switched windows <strong className="text-amber-500">{tabSwitches} time(s)</strong>. 3 switches will force auto-submission.
                </p>
              </div>
              <button
                onClick={() => setShowWarningModal(false)}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 rounded-xl font-bold shadow-md transition-colors"
              >
                I Understand — Resume Test
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
