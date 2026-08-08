import { useState, useEffect } from 'react'
import { Star, Trophy, GraduationCap } from 'lucide-react'
import ScrollReveal from '../../components/animations/ScrollReveal'
import PageTransition from '../../components/animations/PageTransition'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import successStoryService from '../../services/successStoryService'
import SpotlightCard from '../../components/ui/SpotlightCard'
import TiltCard from '../../components/animations/TiltCard'
import { getDirectImageUrl } from '../../utils/imageHelper'

export default function SuccessStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStories = async () => {
      const res = await successStoryService.getStories()
      if (res && res.success) {
        setStories(res.data)
      }
      setLoading(false)
    }
    fetchStories()
  }, [])

  return (
    <PageTransition>
      {/* Page Header */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden bg-gradient-to-br from-[#060e0a] to-[#08140f]">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        <div className="section-container relative z-10">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto space-y-5 pt-4 sm:pt-6">
            <span className="badge badge-gold font-extrabold inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-full shadow-xs mx-auto">
              <Trophy size={12} className="text-amber-500 fill-amber-500" />
              <span>Achievements</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-white leading-tight text-center tracking-tight">
              Success <span className="text-gradient-gold inline">Stories</span>
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed text-emerald-100/70 font-semibold">
              Celebrating the outstanding achievements of our students.
            </p>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="section-padding bg-[#08140f]">
        <div className="section-container">
          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16 px-4">
              <div className="card-glass bg-[#0a1b14]/50 border border-amber-500/20 p-8 rounded-3xl text-center shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
                <p className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 mb-2">1st</p>
                <h4 className="text-base font-black text-white uppercase tracking-wider">MDCAT Position</h4>
                <p className="text-xs text-emerald-100/50 mt-2 font-semibold">Top rank in highly competitive medical admissions</p>
              </div>
              
              <div className="card-glass bg-[#0a1b14]/50 border border-emerald-500/20 p-8 rounded-3xl text-center shadow-lg relative overflow-hidden group hover:border-emerald-400/50 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                <p className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300 mb-2">30+</p>
                <h4 className="text-base font-black text-white uppercase tracking-wider">MBBS/BDS Admissions</h4>
                <p className="text-xs text-emerald-100/50 mt-2 font-semibold">Students selected in prestigious public medical colleges</p>
              </div>
              
              <div className="card-glass bg-[#0a1b14]/50 border border-amber-500/20 p-8 rounded-3xl text-center shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
                <p className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 mb-2">100%</p>
                <h4 className="text-base font-black text-white uppercase tracking-wider">Pre-Eng Success</h4>
                <p className="text-xs text-emerald-100/50 mt-2 font-semibold">Perfect selection rate for engineering candidates</p>
              </div>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Trophy size={40} className="mx-auto text-amber-500/40" />
              <h3 className="text-xl font-bold text-white">No Success Stories Published Yet</h3>
              <p className="text-sm text-emerald-100/50">Student achievements will appear here once published by the academy.</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {stories.map((story) => (
                <StaggerItem key={story._id}>
                  <TiltCard intensity={5} className="h-full">
                    <SpotlightCard className="card-glass group relative overflow-hidden h-full bg-[#0a1b14]/50 border border-[#10b981]/15 p-6 flex flex-col justify-between">
                      {/* Gold accent top */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400" />

                      <div>
                        {/* Stars */}
                        <div className="flex gap-1 mb-4">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={16} className="text-amber-500 fill-amber-500 transition-all duration-300" />
                          ))}
                        </div>

                        {/* Category Badge & Image */}
                        <div className="flex items-start gap-4 mb-4">
                          {story.photoUrl && (
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shrink-0">
                              <img referrerPolicy="no-referrer" src={getDirectImageUrl(story.photoUrl)} alt={story.studentName} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <span className="badge badge-emerald mb-2 inline-block">
                              {story.category}
                            </span>
                            <h3 className="text-xl font-bold text-white">
                              {story.studentName}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed mb-4 text-emerald-100/70 font-semibold">
                          {story.achievement}
                        </p>

                        {story.institute && (
                          <p className="text-xs font-bold mb-4 text-emerald-400">
                            {story.institute} {story.score ? `— ${story.score}` : ''}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-[#10b981]/10 pt-4">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {story.year}
                        </span>
                        <GraduationCap size={18} className="text-emerald-400 group-hover:text-amber-400 transition-colors" />
                      </div>
                    </SpotlightCard>
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* Spacer */}
          <div className="h-16 sm:h-24" />

          {/* More coming soon */}
          <ScrollReveal className="text-center">
            <div className="card-glass p-8 rounded-2xl bg-[#0a1b14]/50 border border-[#10b981]/15 max-w-2xl mx-auto">
              <Trophy size={32} className="mx-auto mb-4 text-amber-500" />
              <h3 className="text-xl font-bold mb-2 text-white">
                More Success Stories Coming Soon
              </h3>
              <p className="text-sm text-emerald-100/60 font-semibold leading-relaxed">
                We're continuously collecting and celebrating the achievements of our students.
                Check back regularly for updates!
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  )
}
