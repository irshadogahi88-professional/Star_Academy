import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, X, ChevronRight } from 'lucide-react'
import api from '../../services/api'
import ScrollReveal from '../../components/animations/ScrollReveal'
import PageTransition from '../../components/animations/PageTransition'
import SpotlightCard from '../../components/ui/SpotlightCard'
import TiltCard from '../../components/animations/TiltCard'
import { getDirectImageUrl } from '../../utils/imageHelper'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const carouselRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-scroll logic
  useEffect(() => {
    let intervalId;
    if (!isHovered && carouselRef.current) {
      intervalId = setInterval(() => {
        if (carouselRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
          // If we reach the end, scroll back to start, else scroll right
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            carouselRef.current.scrollBy({ left: 350, behavior: 'smooth' });
          }
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [isHovered, images]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get('/gallery')
        if (res.data?.success) {
          setImages(res.data.data)
        }
      } catch (error) {
        console.error('Failed to load gallery', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
  }, [])



  return (
    <PageTransition>
      {/* Page Header */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 overflow-hidden bg-gradient-to-br from-[#060e0a] to-[#08140f]">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute bottom-10 right-20 w-72 h-72 rounded-full blur-3xl bg-amber-500/10" />
        </div>
        <div className="section-container relative z-10">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto space-y-5 pt-4 sm:pt-6">
            <span className="badge badge-gold font-extrabold inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-full shadow-xs mx-auto">
              <Image size={12} className="text-amber-500" />
              <span>Campus Life</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-white leading-tight text-center tracking-tight">
              Photo <span className="text-gradient-gold inline">Gallery</span>
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed text-emerald-100/70 font-semibold">
              Explore the events, campus facilities, and vibrant student life at Star Educational Academy.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="section-padding bg-[#08140f] min-h-[50vh]">
        <div className="section-container">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center text-emerald-100/50 py-12">
              <Image size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold">No images in gallery yet.</p>
            </div>
          ) : (
            <ScrollReveal>
              <div 
                className="relative w-full max-w-full overflow-visible pb-8"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* Navigation Arrows */}
                <button
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' })
                    }
                  }}
                  className="carousel-arrow carousel-arrow-left hidden md:flex"
                  aria-label="Scroll left"
                >
                  <ChevronRight size={16} className="rotate-180" />
                </button>
                <button
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' })
                    }
                  }}
                  className="carousel-arrow carousel-arrow-right hidden md:flex"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Horizontal Scroll Container */}
                <div ref={carouselRef} className="scroll-carousel items-stretch">
                  {images.map((img) => (
                    <div key={img._id} className="w-[300px] sm:w-[350px] lg:w-[400px] shrink-0">
                      <TiltCard intensity={3} className="h-full">
                        <SpotlightCard 
                          className="card-glass p-4 h-full cursor-pointer group bg-[#0a1b14]/50 hover:bg-[#0a1b14]/80 transition-colors border border-[#10b981]/15 hover:border-amber-500/30"
                        >
                          <div 
                            className="w-full h-64 rounded-xl overflow-hidden mb-4 relative"
                            onClick={() => setSelectedImage(img)}
                          >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all z-10 flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 text-white font-black tracking-wider text-xs bg-[#060e0a]/80 px-4 py-2 rounded-lg border border-[#10b981]/25 backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-all">
                                View Full Size
                              </span>
                            </div>
                            <img 
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              src={getDirectImageUrl(img.imageUrl, '=w800')} 
                              alt={img.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">
                              {img.category || 'General'}
                            </span>
                            <h3 className="text-base font-extrabold text-white leading-tight line-clamp-2 capitalize">
                              {img.title}
                            </h3>
                          </div>
                        </SpotlightCard>
                      </TiltCard>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                loading="lazy"
                referrerPolicy="no-referrer"
                src={getDirectImageUrl(selectedImage.imageUrl, '=s1600')} 
                alt={selectedImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
              <div className="text-center mt-6">
                <span className="text-amber-500 font-bold text-xs tracking-widest uppercase mb-2 block">
                  {selectedImage.category}
                </span>
                <h3 className="text-2xl text-white font-extrabold capitalize">
                  {selectedImage.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
