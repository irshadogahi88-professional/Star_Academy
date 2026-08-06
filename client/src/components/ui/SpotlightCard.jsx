import React, { useRef, useState, useEffect } from 'react'

export default function SpotlightCard({ children, className = '' }) {
  const divRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const listener = (e) => setReducedMotion(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  const handleMouseMove = (e) => {
    if (!divRef.current || reducedMotion) return
    
    const div = divRef.current
    const rect = div.getBoundingClientRect()
    
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => {
    if (!reducedMotion) setOpacity(1)
  }

  const handleMouseLeave = () => {
    setOpacity(0)
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card relative overflow-hidden rounded-3xl ${className}`}
      style={{
        '--x': `${position.x}px`,
        '--y': `${position.y}px`,
      }}
    >
      {/* Background Spotlight Glow */}
      {!reducedMotion && (
        <div 
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out z-0" 
          style={{ 
            opacity: opacity * 0.4,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(16, 185, 129, 0.08), rgba(245, 158, 11, 0.03) 40%, transparent 80%)`
          }} 
        />
      )}

      {/* 1px Spotlight Border Glow (Masked) */}
      {!reducedMotion && (
        <div 
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out z-10 rounded-[inherit]"
          style={{ 
            opacity,
            padding: '1px',
            background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, rgba(16, 185, 129, 0.35), rgba(245, 158, 11, 0.2) 50%, transparent 100%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }} 
        />
      )}

      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </div>
  )
}
