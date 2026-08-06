import { useState, useEffect } from 'react'
import { Star, BookOpen, Beaker, Phone, Atom, Dna, HelpCircle } from 'lucide-react'
import ScrollReveal from '../../components/animations/ScrollReveal'
import PageTransition from '../../components/animations/PageTransition'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import TiltCard from '../../components/animations/TiltCard'
import facultyService from '../../services/facultyService'
import { getDirectImageUrl } from '../../utils/imageHelper'

const subjectIcons = {
  Physics: <Atom size={20} />,
  Mathematics: <BookOpen size={20} />,
  Chemistry: <Beaker size={20} />,
  Biology: <Dna size={20} />,
  English: <BookOpen size={20} />,
  'Computer Science': <BookOpen size={20} />,
  General: <Star size={20} />,
}

export default function Faculty() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFaculty = async () => {
      const res = await facultyService.getFaculty()
      if (res && res.success) {
        setFaculty(res.data)
      }
      setLoading(false)
    }
    fetchFaculty()
  }, [])

  return (
    <PageTransition>
      {/* Page Header */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden bg-gradient-to-br from-[#060e0a] to-[#08140f]">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-20 w-72 h-72 rounded-full blur-3xl bg-amber-500/10" />
        </div>
        <div className="section-container relative z-10">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto space-y-5 pt-4 sm:pt-6">
            <span className="badge badge-gold font-extrabold inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-full shadow-xs mx-auto">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span>Our Educators</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-white leading-tight text-center tracking-tight">
              Expert <span className="text-gradient-gold inline">Faculty</span>
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed text-emerald-100/70 font-semibold">
              Learn from Ghotki's most experienced and dedicated educators, specializing in MDCAT, ECAT, and Board examinations.
            </p>
          </div>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="section-padding bg-[#08140f]">
        <div className="section-container">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : faculty.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Star size={40} className="mx-auto text-amber-500/40 animate-pulse" />
              <h3 className="text-xl font-bold text-white">Faculty Profiles Coming Soon</h3>
              <p className="text-sm text-emerald-100/50">Our team is being updated. Check back shortly.</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {faculty.map((member) => (
                <StaggerItem key={member._id}>
                  <TiltCard intensity={6}>
                    <div className="card-glass group overflow-hidden h-full flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15 hover:border-emerald-400/40">
                      <div>
                        {/* Photo */}
                        <div className="relative mx-auto w-36 h-36 mb-6 rounded-full overflow-hidden ring-4 ring-[#10b981]/15 group-hover:ring-amber-500/60 transition-all duration-500 shadow-md bg-emerald-500/10 flex items-center justify-center">
                          {member.photoUrl ? (
                            <img
                              referrerPolicy="no-referrer"
                              src={getDirectImageUrl(member.photoUrl)}
                              alt={member.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <span className="text-5xl font-black text-emerald-400">
                              {member.name?.charAt(4) || member.name?.charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* Subject Badge */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-emerald-400">{subjectIcons[member.subject] || <Star size={20} />}</span>
                          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500">
                            {member.subject}
                          </span>
                        </div>

                        {/* Name & Role */}
                        <h3 className="text-xl font-extrabold text-center mb-2 text-white">
                          {member.name}
                        </h3>
                        <div className="text-center mb-4">
                          <span className="badge badge-emerald text-xs font-bold">{member.designation}</span>
                        </div>

                        {/* Bio */}
                        {member.bio && (
                          <p className="text-sm text-center leading-relaxed mb-4 text-emerald-100/70 font-semibold">
                            {member.bio}
                          </p>
                        )}

                        {/* Qualifications */}
                        {(member.qualification || member.experience) && (
                          <div className="text-center space-y-1 mb-3 text-xs text-emerald-100/50 font-semibold">
                            {member.qualification && <p>{member.qualification}</p>}
                            {member.experience && <p>{member.experience} Experience</p>}
                          </div>
                        )}
                      </div>

                      {/* Phone */}
                      {member.phone && (
                        <div className="pt-4 border-t border-[#10b981]/15 text-center mt-4">
                          <a
                            href={`tel:${member.phone.replace(/-/g, '')}`}
                            className="inline-flex items-center justify-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <Phone size={12} />
                            <span>{member.phone}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>
    </PageTransition>
  )
}
