import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../services/api'
import { 
  Star, GraduationCap, Trophy, Beaker, BookOpen, ArrowRight, UserCheck, 
  ChevronRight, MapPin, Clock, Calendar, ShieldCheck, Award, Atom, Dna 
} from 'lucide-react'
import CountUp from '../../components/animations/CountUp'
import ScrollReveal from '../../components/animations/ScrollReveal'
import PageTransition from '../../components/animations/PageTransition'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import SpotlightCard from '../../components/ui/SpotlightCard'
import { getDirectImageUrl } from '../../utils/imageHelper'

const subjectIcons = {
  Physics: <Atom size={18} />,
  Mathematics: <BookOpen size={18} />,
  Chemistry: <Beaker size={18} />,
  Biology: <Dna size={18} />,
  English: <BookOpen size={18} />,
  'Computer Science': <BookOpen size={18} />,
  General: <Star size={18} />,
}

export default function Home() {
  const [liveStats, setLiveStats] = useState({
    students: 0,
    lectures: 0,
    tests: 0,
    mcqs: 0,
    faculty: 0,
  })
  const [facultyPreview, setFacultyPreview] = useState([])
  const [achievements, setAchievements] = useState([])
  const [heroSlides, setHeroSlides] = useState([])
  const [activeSlide, setActiveSlide] = useState(0)
  const facultyRef = useRef(null)
  const successRef = useRef(null)
  const [isFacultyHovered, setIsFacultyHovered] = useState(false)
  const [isSuccessHovered, setIsSuccessHovered] = useState(false)

  useEffect(() => {
    api.get('/admin/public-stats').then((res) => {
      if (res.data?.success && res.data?.stats) setLiveStats(res.data.stats)
    }).catch(() => { })

    api.get('/faculty').then((res) => {
      if (res.data?.success) setFacultyPreview(res.data.data.slice(0, 8))
    }).catch(() => { })

    api.get('/success-stories').then((res) => {
      if (res.data?.success) setAchievements(res.data.data.slice(0, 8))
    }).catch(() => { })

    api.get('/hero-slides').then((res) => {
      if (res.data?.success && res.data?.data?.length > 0) {
        setHeroSlides(res.data.data)
      }
    }).catch(() => { })
  }, [])

  // Auto-cycle hero slides every 5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  // Auto-scroll Carousels
  useEffect(() => {
    const scrollCarousel = (ref) => {
      if (ref.current) {
        const { scrollLeft, scrollWidth, clientWidth } = ref.current
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          ref.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          ref.current.scrollBy({ left: 320, behavior: 'smooth' })
        }
      }
    }

    let facultyInterval;
    let successInterval;

    if (!isFacultyHovered) {
      facultyInterval = setInterval(() => scrollCarousel(facultyRef), 3500)
    }
    if (!isSuccessHovered) {
      successInterval = setInterval(() => scrollCarousel(successRef), 4000)
    }

    return () => {
      clearInterval(facultyInterval)
      clearInterval(successInterval)
    }
  }, [isFacultyHovered, isSuccessHovered])

  const stats = [
    { icon: <GraduationCap />, value: liveStats.students, suffix: '+', label: 'Enrolled Students', sub: 'Pre-Med & Pre-Eng' },
    { icon: <UserCheck />, value: liveStats.faculty || facultyPreview.length, suffix: '+', label: 'Expert Faculty', sub: 'Dedicated Educators' },
    { icon: <Award />, value: liveStats.lectures, suffix: '+', label: 'Video Lectures', sub: 'Structured Courses' },
    { icon: <Trophy />, value: liveStats.tests, suffix: '+', label: 'Mock Tests', sub: 'Online Practice' },
  ]

  return (
    <PageTransition>
      {/* ========== HERO SECTION — Fullscreen Background Slideshow ========== */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background Slideshow Images */}
        {heroSlides.length > 0 ? heroSlides.map((slide, idx) => (
          <div
            key={slide._id || idx}
            className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
            style={{ opacity: idx === activeSlide ? 1 : 0, zIndex: 0 }}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title || 'Star Educational Academy'}
              className="w-full h-full object-cover"
            />
          </div>
        )) : (
          <div className="absolute inset-0 bg-[#060e0a]">
            <div className="w-full h-full object-cover opacity-30 cosmic-emerald-bg" />
          </div>
        )}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060e0a]/90 via-[#060e0a]/80 to-[#08140f] z-[1]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-overlay z-[2]" />

        {/* Centered Overlay Content */}
        <div className="relative z-10 section-container flex flex-col items-center justify-center text-center gap-6 sm:gap-8 pt-32 pb-32 sm:pt-40 sm:pb-40">

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2.5 px-5 py-2.5 text-xs font-black rounded-full shadow-lg bg-[#060e0a]/80 border border-amber-500/80 text-amber-400 backdrop-blur-sm">
              <Star size={14} className="fill-amber-400 animate-spin-slow" />
              <span>Session 2026 — Admissions Open</span>
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <img
              src="/images/logo.png"
              alt="Star Educational Academy Logo"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] mx-auto"
            />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] text-white tracking-tight"
          >
            Shape Your <span className="text-gradient-gold inline">Future</span>
            <br />
            With Excellence
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base sm:text-xl leading-relaxed font-semibold text-emerald-100/85 max-w-2xl mx-auto"
          >
            Premier coaching for Grades IX–XII. Pre-Medical & Pre-Engineering
            tracks with expert faculty and proven results. ECAT & MCAT preparation
            that delivers <strong className="font-extrabold text-amber-400">outstanding success</strong>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-2 w-full max-w-sm sm:max-w-none mx-auto px-4 sm:px-0"
          >
            <Link
              to="/register"
              className="btn-gold h-12 sm:h-14 px-6 sm:px-10 rounded-2xl text-sm sm:text-lg font-black shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Apply Now</span>
            </Link>

            <Link
              to="/about"
              className="btn-outline h-12 sm:h-14 px-6 sm:px-10 rounded-2xl text-sm sm:text-lg font-black transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>Explore Programs</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Session Meta Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto w-full"
          >
            <div className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-[#060e0a]/60 border border-[#10b981]/15 backdrop-blur-md text-white shadow-lg">
              <Calendar className="text-amber-500 shrink-0" size={18} />
              <div className="text-left">
                <span className="text-emerald-100/50 block text-[10px] uppercase font-bold tracking-wider">Commences</span>
                <strong className="text-amber-400 font-extrabold text-sm">10-08-2026</strong>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-[#060e0a]/60 border border-[#10b981]/15 backdrop-blur-md text-white shadow-lg">
              <Clock className="text-amber-500 shrink-0" size={18} />
              <div className="text-left">
                <span className="text-emerald-100/50 block text-[10px] uppercase font-bold tracking-wider">Timings</span>
                <strong className="text-emerald-200 font-extrabold text-sm">3:15 – 7:00 PM</strong>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-[#060e0a]/60 border border-[#10b981]/15 backdrop-blur-md text-white shadow-lg">
              <MapPin className="text-amber-500 shrink-0" size={18} />
              <div className="text-left">
                <span className="text-emerald-100/50 block text-[10px] uppercase font-bold tracking-wider">Campus</span>
                <strong className="text-emerald-200 font-extrabold text-sm">D.A.V. School</strong>
              </div>
            </div>
          </motion.div>

          {/* Slide Indicator Dots */}
          {heroSlides.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 pt-4">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-8 h-3 bg-amber-500' : 'w-3 h-3 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="section-padding relative overflow-hidden bg-[#08140f]">
        <div className="section-container">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StaggerItem key={i}>
                <SpotlightCard className="text-center group hover:border-[#10b981]/30 p-6 rounded-2xl bg-[#0a1b14]/50 border border-[#10b981]/15">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 shadow-xs border border-[#10b981]/20">
                    {stat.icon}
                  </div>
                  <p className="text-3xl sm:text-4xl font-black mb-1 text-white">
                    <CountUp end={stat.value} suffix={stat.suffix} duration={2.5} />
                  </p>
                  <p className="font-extrabold text-sm mb-0.5 text-emerald-100/80">{stat.label}</p>
                  <p className="text-xs font-semibold text-emerald-100/50">{stat.sub}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ========== ABOUT PREVIEW ========== */}
      <section className="section-padding relative overflow-hidden bg-[#0a1b14]">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <ScrollReveal direction="left">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#10b981]/20">
                <img
                  src="/images/adv-2.png"
                  alt="Star Educational Academy"
                  className="w-full h-auto object-cover"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="space-y-6">
              <span className="badge badge-gold font-bold inline-flex items-center gap-1.5 px-4 py-1 text-xs">
                <Award size={12} className="text-amber-400" />
                Director's Message
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-[1.25] text-white pt-1">
                A Message from the <span className="text-gradient-gold inline-block">Director</span>
              </h2>
              
              <div className="space-y-4 text-emerald-100/80 font-medium">
                <p className="text-emerald-400 font-extrabold text-base">Dear Students,</p>
                <p className="text-sm leading-relaxed text-emerald-100/70">
                  Success is never a matter of chance; it is the outcome of hard work, discipline, consistency, and proper guidance. At Star Academy Ghotki, our aim is not only to prepare you for MDCAT and ECAT, but also to develop your confidence, strengthen your concepts, and guide you toward achieving excellence in your academic journey.
                </p>
                <p className="text-sm leading-relaxed text-emerald-100/70">
                  We firmly believe that every student carries the ability to succeed. With sincere effort from students, continuous support from parents, and dedicated teaching from our faculty, no goal is out of reach.
                </p>
                <p className="text-sm leading-relaxed text-emerald-100/70 font-semibold italic border-l-2 border-amber-500 pl-4 my-3">
                  "Stay committed, stay disciplined, trust your efforts, and keep moving forward. Your success story starts with the choices you make today."
                </p>
              </div>

              <div className="pt-2 border-t border-[#10b981]/15">
                <p className="text-white font-black text-sm">Sir Irshad Ahmed Ogahi</p>
                <p className="text-[10px] font-bold text-amber-500">Director, Star Academy Ghotki</p>
              </div>

              <div className="mt-6 pt-2 flex justify-center lg:justify-start">
                <Link
                  to="/about"
                  className="btn-gold h-11 px-6 rounded-xl text-xs font-extrabold flex items-center gap-2"
                >
                  <span>Explore About Us</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ========== FACULTY PREVIEW ========== */}
      <section className="section-padding relative overflow-hidden bg-[#08140f]">
        <div className="section-container relative z-10">
          <ScrollReveal className="flex flex-col items-center justify-center text-center mb-12 space-y-3">
            <span className="badge badge-gold font-bold inline-flex items-center gap-1.5 px-4 py-1 text-xs">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              Our Team
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.25] text-center text-white">
              Meet Our <span className="text-gradient-gold inline-block">Distinguished</span> Faculty
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed text-emerald-100/60">
              Highly qualified and experienced educators committed to guiding every student towards their academic goals.
            </p>
          </ScrollReveal>

          <div
            className="relative w-full max-w-full overflow-visible animate-scaleIn"
            onMouseEnter={() => setIsFacultyHovered(true)}
            onMouseLeave={() => setIsFacultyHovered(false)}
          >
            <button
              onClick={() => {
                if (facultyRef.current) {
                  facultyRef.current.scrollBy({ left: -300, behavior: 'smooth' })
                }
              }}
              className="carousel-arrow carousel-arrow-left hidden md:flex"
              aria-label="Scroll left"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button
              onClick={() => {
                if (facultyRef.current) {
                  facultyRef.current.scrollBy({ left: 300, behavior: 'smooth' })
                }
              }}
              className="carousel-arrow carousel-arrow-right hidden md:flex"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
            <div ref={facultyRef} className="scroll-carousel">
              {facultyPreview.map((member, i) => (
                <div key={member._id || i} className="w-[280px] sm:w-[320px]">
                  <SpotlightCard className="card group text-center overflow-hidden h-full flex flex-col items-center justify-between p-6 bg-[#0a1b14]/50 border border-[#10b981]/15 space-y-4">
                    <div className="flex flex-col items-center text-center w-full">
                      <div className="relative mx-auto w-28 h-28 mb-4 rounded-full overflow-hidden ring-4 ring-[#10b981]/20 group-hover:ring-amber-500/60 transition-all duration-300 shadow-md bg-emerald-500/10 flex items-center justify-center">
                        {member.photoUrl ? (
                          <img referrerPolicy="no-referrer" src={getDirectImageUrl(member.photoUrl)} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-black text-emerald-400">{member.name?.charAt(4) || member.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-1.5">
                        <span className="text-emerald-400">{subjectIcons[member.subject] || <Star size={14} />}</span>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500">
                          {member.subject}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-emerald-100 text-center">
                        {member.name}
                      </h3>
                    </div>
                    {member.designation && member.designation !== 'Faculty Member' ? (
                      <div className="mt-2 text-center">
                        <span className="badge badge-emerald text-xs font-bold">
                          {member.designation}
                        </span>
                      </div>
                    ) : (
                      <div className="h-6" />
                    )}
                  </SpotlightCard>
                </div>
              ))}
            </div>
          </div>

          <ScrollReveal className="text-center mt-12 sm:mt-16">
            <Link to="/faculty" className="btn-outline shadow-xs">
              <span>View All Faculty</span>
              <ArrowRight size={14} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== SUCCESS STORIES ========== */}
      <section className="section-padding relative overflow-hidden bg-[#0a1b14]">
        <div className="section-container relative z-10">
          <ScrollReveal className="flex flex-col items-center justify-center text-center mb-12 space-y-3">
            <span className="badge badge-gold font-bold inline-flex items-center gap-1.5 px-4 py-1 text-xs">
              <Trophy size={12} className="text-amber-500 fill-amber-500" />
              Achievements
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.25] text-center">
              Our Students <span className="text-gradient-gold inline">Shine Bright</span>
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed text-emerald-100/60">
              Every year, our students achieve remarkable results in board exams, MDCAT, ECAT,
              and secure admissions in top universities across Pakistan.
            </p>
          </ScrollReveal>

          <div
            className="relative w-full max-w-full overflow-visible"
            onMouseEnter={() => setIsSuccessHovered(true)}
            onMouseLeave={() => setIsSuccessHovered(false)}
          >
            <button
              onClick={() => {
                if (successRef.current) {
                  successRef.current.scrollBy({ left: -300, behavior: 'smooth' })
                }
              }}
              className="carousel-arrow carousel-arrow-left hidden md:flex"
              aria-label="Scroll left"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button
              onClick={() => {
                if (successRef.current) {
                  successRef.current.scrollBy({ left: 300, behavior: 'smooth' })
                }
              }}
              className="carousel-arrow carousel-arrow-right hidden md:flex"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>

            <div ref={successRef} className="scroll-carousel">
              {achievements.map((story, i) => (
                <div key={story._id || i} className="w-[280px] sm:w-[320px]">
                  <SpotlightCard className="card group relative overflow-hidden h-full flex flex-col p-6 shadow-xl hover:shadow-2xl bg-[#08140f]/60 border border-[#10b981]/15 transition-all">
                    {/* Gold accent top */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-amber-400" />

                    <div className="space-y-4 flex-1">
                      <div className="flex flex-col items-center mb-2">
                        <div className="w-24 h-24 rounded-full border-2 border-amber-500 shadow-lg overflow-hidden mb-3 bg-[#0a1b14] flex items-center justify-center">
                          {story.imageUrl || story.image || story.photoUrl ? (
                            <img referrerPolicy="no-referrer" src={getDirectImageUrl(story.imageUrl || story.image || story.photoUrl)} alt={story.studentName || story.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl font-black text-emerald-400">{(story.studentName || story.name)?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={14} className="fill-amber-500 drop-shadow-sm" />
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <h3 className="text-lg font-extrabold text-white leading-snug">
                          {story.studentName || story.name}
                        </h3>
                        <p className="text-sm leading-relaxed text-emerald-100/70 font-semibold mt-2">
                          {story.achievement}
                        </p>
                        {story.institute && (
                          <p className="text-xs font-bold text-emerald-400 mt-2">
                            {story.institute} {story.score ? `— ${story.score}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#10b981]/15 mt-6 flex items-center justify-between relative z-10">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {story.year}
                      </span>
                      <span className="badge badge-emerald text-[10px] font-bold shadow-xs">
                        {story.category || 'Achievement'}
                      </span>
                    </div>
                  </SpotlightCard>
                </div>
              ))}
            </div>
          </div>

          <ScrollReveal className="text-center mt-12 sm:mt-16">
            <Link to="/success-stories" className="btn-outline text-base">
              <span>View All Success Stories</span>
              <ArrowRight size={14} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== CTA BANNER SECTION ========== */}
      <section className="section-padding relative overflow-hidden bg-[#08140f]">
        <div className="section-container animate-fadeIn">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl p-8 sm:p-14 lg:p-20 text-center shadow-2xl max-w-4xl mx-auto bg-gradient-to-br from-[#060e0a] via-[#0a1b14] to-[#08140f] border border-[#10b981]/25">
              <div className="relative z-10 flex flex-col items-center text-center gap-6 sm:gap-8">

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.2] text-center">
                  Session 2026 is <span className="text-gradient-gold inline">Now Open</span>
                </h2>

                <p className="text-base sm:text-lg leading-relaxed text-emerald-100/90 text-center max-w-2xl font-semibold">
                  Admission forms & advance seat booking available from <strong className="text-amber-400 font-extrabold">20-07-2026</strong>.
                  Classes commence <strong className="text-amber-400 font-extrabold">10-08-2026</strong>.
                </p>

                <div className="inline-flex flex-wrap items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-[#060e0a]/80 border border-[#10b981]/15 text-white text-xs sm:text-sm font-bold backdrop-blur-md shadow-md my-1">
                  <span className="flex items-center gap-2 text-emerald-100">
                    <MapPin className="text-amber-500" size={16} />
                    <span>D.A.V. School, Ladies Bazaar, Ghotki</span>
                  </span>
                  <span className="hidden sm:inline opacity-40 text-emerald-100/30">|</span>
                  <span className="flex items-center gap-2 text-emerald-100">
                    <Clock className="text-amber-500" size={16} />
                    <span>3:15 PM – 7:00 PM</span>
                  </span>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-6 pt-4">
                  <Link
                    to="/register"
                    className="btn-gold py-4 px-10 rounded-2xl text-lg font-black flex items-center justify-center gap-2"
                  >
                    <GraduationCap size={22} />
                    <span>Apply Now</span>
                  </Link>

                  <a
                    href="https://wa.me/923083309704?text=Hello! I'm interested in admissions for Session 2026."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline py-4 px-10 rounded-2xl text-lg font-black flex items-center justify-center gap-2"
                  >
                    <span>Contact Us</span>
                    <ArrowRight size={18} />
                  </a>
                </div>

              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  )
}
