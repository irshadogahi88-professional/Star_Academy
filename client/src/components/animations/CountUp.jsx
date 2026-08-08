import { useEffect, useRef, useState } from 'react'

export default function CountUp({ end, duration = 2, suffix = '', prefix = '', decimals = 0 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isIntersecting && end > 0 && !hasAnimated.current) {
      hasAnimated.current = true
      let animationFrameId
      const startTime = performance.now()
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / (duration * 1000), 1)
        const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
        const value = eased * end
        setCount(decimals > 0 ? parseFloat(value.toFixed(decimals)) : Math.round(value))
        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate)
        }
      }
      animationFrameId = requestAnimationFrame(animate)
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
      }
    } else if (!isIntersecting) {
      hasAnimated.current = false
      setCount(0)
    } else if (isIntersecting && end === 0) {
      setCount(0)
    }
  }, [isIntersecting, end, duration, decimals])

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}
