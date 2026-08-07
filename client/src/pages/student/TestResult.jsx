import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowLeft, Printer, Lightbulb } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

export default function TestResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  
  const state = location.state || {}
  const userAnswers = state.answers || {}
  const apiData = state.apiData || null
  
  const questions = apiData?.questions || []
  const testInfo = state.testInfo || apiData?.test || {}
  const studentName = user?.fullName || user?.name || 'Student'

  // Determine if detailed answers should be shown
  const showAnswersAtEnd = testInfo.showAnswersAtEnd !== false && testInfo.showResultsToStudents !== false

  const totalQuestionsCount = state.totalQuestions || questions.length || 0
  
  // Calculate correct count securely (prefer API evaluated score if available)
  let correctCount = 0
  if (state.correctAnswers !== undefined) {
    correctCount = state.correctAnswers
  } else if (state.score !== undefined) {
    const marksPerQ = testInfo.totalMarks ? (testInfo.totalMarks / totalQuestionsCount) : 1
    correctCount = Math.round(state.score / marksPerQ)
  } else {
    questions.forEach((q) => {
      if (userAnswers[q._id || q.id] === q.correctOptionIndex) correctCount++
    })
  }

  const scorePercentage = totalQuestionsCount > 0 ? (correctCount / totalQuestionsCount) * 100 : 0

  return (
    <div className="min-h-screen bg-[#08140f] pb-12 flex flex-col items-center selection:bg-emerald-500/20 text-emerald-100">
      
      {/* Print / Action Header */}
      <div className="max-w-4xl w-full flex flex-col sm:flex-row justify-between items-center px-4 pt-8 pb-6 gap-4 print:hidden">
        <button 
          onClick={() => navigate("/dashboard/tests")}
          className="flex items-center space-x-2 px-6 py-3 bg-[#0a1b14] border border-[#10b981]/15 text-emerald-100 rounded-xl font-bold hover:bg-[#060e0a] shadow-sm transition-all"
        >
          <ArrowLeft size={16} />
          <span>Back to Tests</span>
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.45)] hover:shadow-[0_0_25px_rgba(16,185,129,0.75)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Download Result (PDF)</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="max-w-4xl w-full px-4 mb-8 print:hidden">
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start text-amber-400 shadow-sm">
          <div className="font-semibold text-xs leading-relaxed">
            <span className="font-black uppercase tracking-wider mr-2 text-amber-500">Notice:</span>
            Errors and omissions are possible. For any correction, feel free to send us a message through the contact form or report it to your instructor.
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className="px-4 w-full max-w-4xl mb-12">
        <div className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 rounded-[2rem] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-amber-500"></div>
          
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          
          <h2 className="text-3xl font-black text-white mb-2">
            {testInfo?.title || 'Test Results'}
          </h2>
          <p className="text-emerald-100/50 mb-8 text-base font-bold uppercase tracking-widest">Performance Report for {studentName}</p>
          
          <div className="bg-[#08140f]/60 border border-[#10b981]/10 p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-around gap-8 md:gap-0">
            <div className="text-center w-full md:w-1/2">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300 mb-2">
                {scorePercentage.toFixed(0)}%
              </div>
              <p className="text-emerald-100/50 font-bold uppercase tracking-widest text-xs">Overall Score</p>
            </div>
            
            <div className="h-px w-full md:h-20 md:w-px bg-[#10b981]/15"></div>
            
            <div className="text-center w-full md:w-1/2">
              <div className="text-4xl font-black text-white mb-2">
                {correctCount} <span className="text-2xl text-emerald-100/30">/ {totalQuestionsCount}</span>
              </div>
              <p className="text-emerald-100/50 font-bold uppercase tracking-widest text-xs">Correct Answers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="max-w-4xl w-full px-4">
        <h3 className="text-2xl font-black text-white mb-8">
          {showAnswersAtEnd ? "Detailed Answer Review" : "Your Submission Review"}
        </h3>
        
        <div className="space-y-6">
          {questions.map((mcq, idx) => {
            const studentAnswer = userAnswers[mcq._id || mcq.id]
            const isCorrect = studentAnswer === mcq.correctOptionIndex
            const isSkipped = studentAnswer === -1 || studentAnswer === undefined

            // Determine status badge properties
            let statusColor = "bg-blue-500/50"
            let badgeStyle = "bg-blue-500/10 text-blue-400 border border-blue-500/20"
            let statusText = "Submitted"
            
            if (showAnswersAtEnd) {
              if (isCorrect) {
                statusColor = "bg-emerald-500"
                badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                statusText = "Correct"
              } else if (isSkipped) {
                statusColor = "bg-amber-500"
                badgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                statusText = "Skipped"
              } else {
                statusColor = "bg-red-500"
                badgeStyle = "bg-red-500/10 text-red-400 border border-red-500/20"
                statusText = "Incorrect"
              }
            } else if (isSkipped) {
              statusColor = "bg-amber-500/50"
              badgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              statusText = "Skipped"
            }

            return (
              <div key={mcq._id || mcq.id} className="card-glass bg-[#0a1b14]/50 border border-[#10b981]/15 p-6 sm:p-8 rounded-3xl relative overflow-hidden">
                {/* Status Sidebar */}
                <div className={`absolute left-0 top-0 w-1.5 h-full ${statusColor}`}></div>
                
                <div className="flex flex-col sm:flex-row items-start justify-between mb-6 pl-4 gap-4">
                  <h4 className="text-lg font-bold text-white leading-relaxed">
                    <span className="text-emerald-100/40 mr-2">{idx + 1}.</span> {mcq.questionText}
                  </h4>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap self-start ${badgeStyle}`}>
                    {statusText}
                  </span>
                </div>

                <div className="space-y-3 pl-4 mb-6">
                  {mcq.options.map((opt, optIdx) => {
                    const isStudentChoice = studentAnswer === optIdx
                    const isActualCorrect = mcq.correctOptionIndex === optIdx
                    
                    let style = "border-[#10b981]/15 bg-[#060e0a] text-emerald-100/80"
                    let icon = null
                    
                    if (showAnswersAtEnd) {
                      if (isActualCorrect) {
                        style = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold shadow-sm"
                        icon = <CheckCircle className="w-5 h-5 ml-auto text-emerald-400" />
                      } else if (isStudentChoice && !isActualCorrect) {
                        style = "border-red-500 bg-red-500/10 text-red-400 font-bold"
                        icon = <XCircle className="w-5 h-5 ml-auto text-red-400" />
                      }
                    } else {
                      if (isStudentChoice) {
                        style = "border-amber-500 bg-amber-500/10 text-amber-400 font-bold shadow-sm"
                        icon = <span className="ml-auto text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">Your Answer</span>
                      }
                    }

                    return (
                      <div key={optIdx} className={`p-4 rounded-xl border-2 flex items-center transition-all ${style}`}>
                        <div className="mr-3 font-bold opacity-50">{String.fromCharCode(65 + optIdx)}.</div>
                        <div className="text-sm sm:text-base">{opt}</div>
                        {icon}
                      </div>
                    )
                  })}
                </div>

                {showAnswersAtEnd && mcq.explanation && (
                  <div className="pl-4 mt-2">
                    <div className="p-5 bg-emerald-500/5 border border-[#10b981]/15 rounded-2xl">
                      <div className="flex items-center space-x-2 text-amber-500 font-bold mb-2">
                        <Lightbulb className="w-4 h-4" />
                        <span>Explanation</span>
                      </div>
                      <p className="text-emerald-100/80 text-sm leading-relaxed font-semibold">{mcq.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
