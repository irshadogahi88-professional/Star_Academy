import { useLocation, Link, useParams, useNavigate } from 'react'
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaPrint, FaLightbulb } from 'react-icons/fa'

export default function TestResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const state = location.state || {}
  const userAnswers = state.answers || {}
  const apiData = state.apiData || null
  
  const questions = apiData?.questions || []
  const testInfo = state.testInfo || apiData?.test || {}

  // Determine if detailed answers should be shown
  const showAnswersAtEnd = testInfo.showAnswersAtEnd !== false && testInfo.showResultsToStudents !== false

  const totalQuestionsCount = state.totalQuestions || questions.length || 0
  
  // Calculate correct count securely (prefer API evaluated score if available)
  let correctCount = 0
  if (state.score !== undefined) {
    correctCount = state.score / 4 // Assuming 4 marks per correct answer
  } else {
    questions.forEach((q) => {
      if (userAnswers[q._id || q.id] === q.correctOptionIndex) correctCount++
    })
  }

  const scorePercentage = totalQuestionsCount > 0 ? (correctCount / totalQuestionsCount) * 100 : 0

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12 flex flex-col items-center selection:bg-[#147a4a]/20">
      
      {/* Print / Action Header */}
      <div className="max-w-4xl w-full flex flex-col sm:flex-row justify-between items-center px-4 pt-8 pb-6 gap-4 print:hidden">
        <button 
          onClick={() => navigate("/dashboard/tests")}
          className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 shadow-sm transition-all"
        >
          <FaArrowLeft />
          <span>Back to Tests</span>
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-6 py-3 bg-[#0E4429] hover:bg-[#0a321e] text-white rounded-xl font-bold shadow-md transition-all"
        >
          <FaPrint className="w-4 h-4" />
          <span>Download Result (PDF)</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="max-w-4xl w-full px-4 mb-8 print:hidden">
        <div className="p-4 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start text-amber-800 shadow-sm">
          <div className="font-medium text-sm">
            <span className="font-bold uppercase tracking-wider mr-2 text-amber-900">Notice:</span>
            Errors and omissions are possible. For any correction, feel free to send us a message through the contact form or report it to your instructor.
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className="px-4 w-full max-w-4xl mb-12">
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 text-center shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#147a4a] to-gold"></div>
          
          <div className="w-20 h-20 bg-gradient-to-br from-[#147a4a]/10 to-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="w-10 h-10 text-[#147a4a]" />
          </div>
          
          <h2 className="text-3xl font-black text-[#0E4429] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {testInfo?.title || 'Test Results'}
          </h2>
          <p className="text-gray-500 mb-8 text-lg font-medium">Performance Report</p>
          
          <div className="bg-gray-50 p-6 sm:p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center justify-around gap-8 md:gap-0">
            <div className="text-center w-full md:w-1/2">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0E4429] to-[#147a4a] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {scorePercentage.toFixed(0)}%
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs sm:text-sm">Overall Score</p>
            </div>
            
            <div className="h-px w-full md:h-20 md:w-px bg-gray-200"></div>
            
            <div className="text-center w-full md:w-1/2">
              <div className="text-4xl font-black text-[#0E4429] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {correctCount} <span className="text-2xl text-gray-400">/ {totalQuestionsCount}</span>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs sm:text-sm">Correct Answers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Review */}
      {showAnswersAtEnd ? (
        <div className="max-w-4xl w-full px-4">
          <h3 className="text-2xl font-black text-[#0E4429] mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Detailed Answer Review</h3>
          
          <div className="space-y-6">
            {questions.map((mcq, idx) => {
              const studentAnswer = userAnswers[mcq._id || mcq.id]
              const isCorrect = studentAnswer === mcq.correctOptionIndex
              const isSkipped = studentAnswer === -1 || studentAnswer === undefined

              let statusColor = "bg-red-500"
              let badgeStyle = "bg-red-50 text-red-700"
              let statusText = "Incorrect"
              
              if (isCorrect) {
                statusColor = "bg-emerald-500"
                badgeStyle = "bg-emerald-50 text-emerald-700"
                statusText = "Correct"
              } else if (isSkipped) {
                statusColor = "bg-amber-500"
                badgeStyle = "bg-amber-50 text-amber-700"
                statusText = "Skipped"
              }

              return (
                <div key={mcq._id || mcq.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 break-inside-avoid relative overflow-hidden">
                  {/* Status Sidebar */}
                  <div className={`absolute left-0 top-0 w-1.5 h-full ${statusColor}`}></div>
                  
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-6 pl-4 gap-4">
                    <h4 className="text-lg font-bold text-[#0E4429] leading-relaxed">
                      <span className="text-gray-400 mr-2">{idx + 1}.</span> {mcq.questionText}
                    </h4>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap self-start ${badgeStyle}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="space-y-3 pl-4 mb-6">
                    {mcq.options.map((opt, optIdx) => {
                      const isStudentChoice = studentAnswer === optIdx
                      const isActualCorrect = mcq.correctOptionIndex === optIdx
                      
                      let style = "border-gray-100 bg-gray-50/50 text-gray-600"
                      let icon = null
                      
                      if (isActualCorrect) {
                        style = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm"
                        icon = <FaCheckCircle className="w-5 h-5 ml-auto text-emerald-600" />
                      } else if (isStudentChoice && !isActualCorrect) {
                        style = "border-red-400 bg-red-50 text-red-900 font-bold"
                        icon = <FaTimesCircle className="w-5 h-5 ml-auto text-red-500" />
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

                  {mcq.explanation && (
                    <div className="pl-4 mt-2">
                      <div className="p-5 bg-blue-50/80 border border-blue-100/50 rounded-2xl">
                        <div className="flex items-center space-x-2 text-blue-800 font-bold mb-2">
                          <FaLightbulb className="w-4 h-4 text-blue-600" />
                          <span>Explanation</span>
                        </div>
                        <p className="text-blue-900/90 text-sm leading-relaxed">{mcq.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl w-full px-4">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto text-2xl mb-2">
              <FaCheckCircle />
            </div>
            <h3 className="text-2xl font-bold text-[#0E4429]" style={{ fontFamily: 'var(--font-heading)' }}>
              Detailed Review Hidden
            </h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Your instructor has configured this test to hide the detailed answer key upon completion to maintain exam integrity. You can refer to your overall score above.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
