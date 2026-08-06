import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Star, Trophy, GraduationCap, BookOpen, Users, MapPin, Clock, 
  HelpCircle, ChevronDown, ChevronUp, Dna, Atom 
} from 'lucide-react'
import CountUp from '../../components/animations/CountUp'
import ScrollReveal from '../../components/animations/ScrollReveal'
import PageTransition from '../../components/animations/PageTransition'
import { StaggerContainer, StaggerItem } from '../../components/animations/ScrollReveal'
import milestoneService from '../../services/milestoneService'

const values = [
  { icon: <Trophy size={24} />, title: 'Excellence', desc: 'We set the highest standards in academic coaching and test preparation.' },
  { icon: <Users size={24} />, title: 'Dedication', desc: 'Our faculty is committed to every student\'s individual growth and success.' },
  { icon: <BookOpen size={24} />, title: 'Innovation', desc: 'Modern teaching methods, online resources, and AI-powered test preparation.' },
  { icon: <Star size={24} />, title: 'Results', desc: 'Proven track record with top positions in MDCAT, ECAT, and board exams.' },
]

const programs = [
  {
    title: 'Pre-Medical Track',
    subtitle: 'MDCAT Preparation',
    icon: <Dna size={28} />,
    subjects: ['Physics', 'Chemistry', 'Biology', 'English'],
    grades: 'Grade IX – XII',
    color: 'var(--color-emerald-primary)',
  },
  {
    title: 'Pre-Engineering Track',
    subtitle: 'ECAT Preparation',
    icon: <Atom size={28} />,
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'English'],
    grades: 'Grade IX – XII',
    color: 'var(--color-gold-dark)',
  },
]

const faqs = [
  {
    question: 'How do I register for Session 2026 at Star Educational Academy?',
    answer: 'You can easily apply online by clicking "Register" on our website or by visiting our academy campus at D.A.V. School, Ghotki. After filling out the registration form, your account enters pending status until your admission fee is verified.',
  },
  {
    question: 'What is the fee payment & account approval process?',
    answer: 'We operate on a simple one-time admission & session fee model. Once registered, pay your admission fee challan at our academy office. Upon payment verification, our administration approves your account, enabling instant student portal login.',
  },
  {
    question: 'Are separate classes arranged for male and female students?',
    answer: 'Yes, Star Educational Academy maintains dedicated, separate classroom sessions for boys and girls in Mathematics, Science, and English to ensure a comfortable learning environment.',
  },
  {
    question: 'Which competitive exam preparation programs are offered?',
    answer: 'We provide specialized coaching for Sindh MDCAT (Pre-Medical), ECAT (Pre-Engineering), IBA test preparation, and board exam coaching for Grades IX, X, XI, and XII.',
  },
  {
    question: 'How does the online student portal test engine work?',
    answer: 'Enrolled students receive personalized access to timed mock exams, chapter quizzes, downloadable lecture notes, detailed score analytics, and tab-switch monitoring to prepare for real MDCAT/ECAT conditions.',
  },
]

export default function About() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const [milestones, setMilestones] = useState([])

  useEffect(() => {
    const fetchMilestones = async () => {
      const res = await milestoneService.getMilestones()
      if (res && res.success) setMilestones(res.data)
    }
    fetchMilestones()
  }, [])

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <PageTransition>
      {/* Page Header */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden bg-gradient-to-br from-[#060e0a] to-[#08140f]">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full blur-3xl bg-amber-500/10" />
        </div>
        <div className="section-container relative z-10">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto space-y-5 pt-4 sm:pt-6">
            <span className="badge badge-gold font-extrabold inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-full shadow-xs mx-auto">
              <BookOpen size={12} className="text-amber-500" />
              <span>About Us</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-white leading-tight text-center tracking-tight">
              About <span className="text-gradient-gold inline">Star Educational</span> Academy
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed text-emerald-100/70 font-semibold">
              Building bright futures through dedication, expert guidance, and a relentless commitment to academic excellence in Ghotki.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-[#08140f]">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#10b981]/20">
                  <img src="/images/about.png" alt="Star Educational Academy" className="w-full" />
                </div>
                <div className="absolute -bottom-6 -right-6 p-5 rounded-2xl shadow-xl bg-[#0a1b14] border border-[#10b981]/25">
                  <p className="text-3xl font-black text-emerald-400">
                    <CountUp end={100} suffix="%" />
                  </p>
                  <p className="text-xs font-bold text-emerald-100/50">Success Rate</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-[1.25]">
                Our Mission & Vision
              </h2>
              <p className="text-base leading-relaxed text-emerald-100/70">
                Star Educational Academy is where hardworking boys and girls build a bright and successful
                future through dedication and excellence. We provide separate Mathematics and English classes
                for Pre-Engineering boys and girls, taught by highly qualified teachers.
              </p>
              <p className="text-base leading-relaxed text-emerald-100/70">
                Our vision is to become the leading educational coaching academy in Sindh, producing top
                scorers in MDCAT, ECAT, and board examinations year after year. We believe every student
                has the potential for greatness — they just need the right guidance.
              </p>
              <div className="p-5 rounded-2xl border-l-4 border-l-amber-500 bg-[#0a1b14]/50">
                <p className="text-sm italic font-semibold text-emerald-100/80">
                  "Education is the most powerful weapon which you can use to change the world."
                </p>
                <p className="text-xs mt-2 font-extrabold text-amber-500">
                  — Our guiding philosophy
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-[#0a1b14]">
        <div className="section-container">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Our Core <span className="text-gradient-gold">Values</span>
            </h2>
          </ScrollReveal>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <StaggerItem key={i}>
                <div className="card-glass text-center group h-full bg-[#08140f]/50 border border-[#10b981]/15">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-[#10b981]/10 text-emerald-400 border border-[#10b981]/15">
                    {v.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{v.title}</h3>
                  <p className="text-xs text-emerald-100/60 leading-relaxed">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Programs */}
      <section className="section-padding bg-[#08140f]">
        <div className="section-container">
          <ScrollReveal className="text-center mb-12 space-y-3">
            <span className="badge badge-emerald font-bold inline-flex items-center gap-1.5 px-3.5 py-1 text-xs">
              <GraduationCap size={12} />
              Programs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Academic <span className="text-gradient-gold">Programs</span>
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {programs.map((prog, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="card-glass group h-full flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15">
                  <div>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 bg-emerald-500/10 text-emerald-400 border border-[#10b981]/15">
                        {prog.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-white">{prog.title}</h3>
                        <p className="text-xs font-bold text-amber-500">{prog.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-100/60 leading-relaxed mb-4">
                      Comprehensive coaching covering all subjects with focus on competitive exam preparation.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prog.subjects.map((s) => (
                        <span key={s} className="text-xs px-3 py-1 rounded-full font-bold bg-[#060e0a] text-emerald-300 border border-[#10b981]/15">{s}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-extrabold text-amber-500">{prog.grades}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="section-padding bg-[#0a1b14] border-t border-[#10b981]/15">
        <div className="section-container">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-[1.25]">
              Achievements & <span className="text-gradient-gold">Milestones</span>
            </h2>
          </ScrollReveal>
          <div className="max-w-2xl mx-auto space-y-5">
            {milestones.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-emerald-100/50 text-sm font-semibold">Milestone achievements will appear here.</p>
              </div>
            ) : (
              milestones.map((m, i) => (
                <ScrollReveal key={m._id || i} delay={i * 0.1}>
                  <div className="flex gap-4 items-start p-5 rounded-2xl bg-[#08140f]/60 border border-[#10b981]/15 backdrop-blur-md">
                    <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Trophy size={18} />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{m.year}</span>
                      <p className="text-white font-bold text-sm mt-1.5">{m.title || m.achievement}</p>
                      {m.description && <p className="text-emerald-100/50 text-xs mt-1">{m.description}</p>}
                    </div>
                  </div>
                </ScrollReveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Session Info & Map Location */}
      <section className="section-padding bg-[#08140f]">
        <div className="section-container">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="card-glass p-8! flex flex-col justify-between bg-[#0a1b14]/50 border border-[#10b981]/15">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Clock size={20} className="text-emerald-400" />
                    <h3 className="text-xl font-bold text-white">Session 2026</h3>
                  </div>
                  <div className="space-y-3 text-xs font-semibold text-emerald-100/70">
                    <p><strong>Admission Forms:</strong> Available Now</p>
                    <p><strong>Classes Commence:</strong> 10-08-2026</p>
                    <p><strong>Timings:</strong> 3:15 PM – 7:00 PM</p>
                    <p><strong>Programs:</strong> Pre-Medical (MDCAT) & Pre-Engineering (ECAT)</p>
                  </div>
                </div>
                <Link to="/register" className="btn-gold mt-6 w-full justify-center text-xs font-extrabold">
                  <GraduationCap size={16} />
                  <span>Apply Online</span>
                </Link>
              </div>

              <div className="card-glass p-8! bg-[#0a1b14]/50 border border-[#10b981]/15">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin size={20} className="text-emerald-400" />
                  <h3 className="text-xl font-bold text-white">Our Location</h3>
                </div>
                <a href="https://www.google.com/maps?daddr=2858%2BPJF,+Ghotki" target="_blank" rel="noopener noreferrer" className="block text-xs text-emerald-100/70 mb-4 font-bold hover:text-emerald-400 hover:underline transition-colors">
                  D.A.V. School, Ladies Bazaar, Ghotki, Sindh, Pakistan
                </a>
                <div className="rounded-2xl overflow-hidden h-44 border border-[#10b981]/15">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14136.927364!2d69.315!3d27.965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393d9e9e9e9e9e9f%3A0x9e9e9e9e9e9e9e9e!2sGhotki%2C+Sindh%2C+Pakistan!5e0!3m2!1sen!2s!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Star Educational Academy Location"
                  ></iframe>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Interactive Accordion FAQs Section */}
      <section className="section-padding bg-[#0a1b14] border-t border-[#10b981]/15">
        <div className="section-container max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-12 space-y-3">
            <span className="badge badge-gold font-bold inline-flex items-center gap-1.5 px-4 py-1 text-xs">
              <HelpCircle size={12} className="text-amber-500" />
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Frequently Asked <span className="text-gradient-gold">Questions</span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/60 font-semibold max-w-xl mx-auto">
              Find instant answers regarding admissions, one-time fee payment, account approvals, and class schedules.
            </p>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <ScrollReveal key={index} delay={index * 0.08}>
                  <div
                    className={`card-glass p-5! sm:p-6! transition-all duration-300 cursor-pointer border ${
                      isOpen 
                        ? 'border-emerald-400/40 bg-[#08140f] shadow-lg shadow-emerald-500/5' 
                        : 'hover:border-[#10b981]/30 bg-[#08140f]/40'
                    }`}
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black flex items-center justify-center shrink-0 border border-emerald-500/20">
                          Q{index + 1}
                        </span>
                        <span>{faq.question}</span>
                      </h3>
                      <button className="p-2 rounded-xl bg-[#060e0a] text-emerald-400 border border-[#10b981]/15 shrink-0">
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-[#10b981]/15 text-xs sm:text-sm text-emerald-100/70 font-semibold leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
