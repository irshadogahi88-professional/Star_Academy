import React, { useState, useEffect } from 'react'
import Tilt from 'react-parallax-tilt'

export default function TiltCard({ children, className = '', intensity = 5 }) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media.matches)
    const listener = (e) => setReducedMotion(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  return (
    <Tilt
      tiltMaxAngleX={reducedMotion ? 0 : intensity}
      tiltMaxAngleY={reducedMotion ? 0 : intensity}
      perspective={1000}
      scale={reducedMotion ? 1 : 1.02}
      transitionSpeed={2000}
      gyroscope={!reducedMotion}
      glareEnable={!reducedMotion}
      glareMaxOpacity={0.12}
      glareColor="#ffffff"
      glarePosition="all"
      glareBorderRadius="1.5rem"
      className={className}
    >
      {children}
    </Tilt>
  )
}
