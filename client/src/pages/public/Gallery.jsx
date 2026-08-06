import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaImage, FaTimes, FaChevronRight } from 'react-icons/fa'
import axios from 'axios'
import ScrollReveal from '../../components/animations/ScrollReveal'
import SpotlightCard from '../../components/ui/SpotlightCard'

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
        const res = await axios.get('/api/gallery')
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

  // Auto convert Google Drive links to direct view links for display
  const getDirectImageUrl = (url) => {
    if (!url) return ''
    
    let id = '';
    if (url.includes('drive.google.com/file/d/')) {
      id = url.split('/d/')[1].split('/')[0];
    } else if (url.includes('drive.google.com/open?id=')) {
      id = url.split('id=')[1].split('&')[0];
    } else if (url.includes('drive.google.com/uc?id=')) {
      id = url.split('id=')[1].split('&')[0];
    }

    if (id) {
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
    
    return url
  }

  return (
    <>
      {/* Page Header */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#082d1b] to-[#0E4429]">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute bottom-10 right-20 w-72 h-72 rounded-full blur-3xl bg-gold" />
        </div>
        <div className="section-container relative z-10">
          <div className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto space-y-5 pt-4 sm:pt-6">
            <span className="badge badge-gold font-extrabold inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-full shadow-xs mx-auto">
              <FaImage size={12} className="text-[#D4A64A]" />
              <span>Campus Life</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-white leading-tight text-center tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Photo <span className="text-gradient-gold inline">Gallery</span>
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed text-white/90 font-medium">
              Explore the events, campus facilities, and vibrant student life at Star Educational Academy.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="section-padding bg-cream min-h-[50vh]">
        <div className="section-container">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-10 h-10 border-4 border-emerald-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center text-charcoal-light py-12">
              <FaImage size={48} className="mx-auto mb-4 opacity-20" />
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
                  className="carousel-arrow carousel-arrow-left hidden md:flex !bg-emerald-dark !text-gold !border-gold/30 hover:!bg-gold hover:!text-emerald-dark"
                  aria-label="Scroll left"
                >
                  <FaChevronRight size={16} className="rotate-180" />
                </button>
                <button
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' })
                    }
                  }}
                  className="carousel-arrow carousel-arrow-right hidden md:flex !bg-emerald-dark !text-gold !border-gold/30 hover:!bg-gold hover:!text-emerald-dark"
                  aria-label="Scroll right"
                >
                  <FaChevronRight size={16} />
                </button>

                {/* Horizontal Scroll Container */}
                <div ref={carouselRef} className="scroll-carousel items-stretch">
                  {images.map((img) => (
                    <div key={img._id} className="w-[300px] sm:w-[350px] lg:w-[400px] shrink-0">
                      <SpotlightCard 
                        className="card p-4 h-full cursor-pointer group bg-white hover:bg-cream-alt transition-colors border-2 border-transparent hover:border-gold/30"
                      >
                        <div 
                          className="w-full h-64 rounded-xl overflow-hidden mb-4 relative"
                          onClick={() => setSelectedImage(img)}
                        >
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all z-10 flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white font-black tracking-wider text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-all">
                              View Full Size
                            </span>
                          </div>
                          <img 
                            loading="lazy"
                            src={getDirectImageUrl(img.imageUrl)} 
                            alt={img.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-primary mb-1 block">
                            {img.category || 'General'}
                          </span>
                          <h3 className="text-lg font-extrabold text-emerald-dark leading-tight line-clamp-2">
                            {img.title}
                          </h3>
                        </div>
                      </SpotlightCard>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
              onClick={() => setSelectedImage(null)}
            >
              <FaTimes size={32} />
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
                src={getDirectImageUrl(selectedImage.imageUrl)} 
                alt={selectedImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="text-center mt-6">
                <span className="text-gold font-bold text-sm tracking-widest uppercase mb-2 block">
                  {selectedImage.category}
                </span>
                <h3 className="text-2xl text-white font-extrabold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {selectedImage.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
