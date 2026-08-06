import { motion, useReducedMotion } from 'framer-motion'

const directionMap = {
  up: { y: 40, x: 0 },
  down: { y: -40, x: 0 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
  once = true,
}) {
  const shouldReduceMotion = useReducedMotion()
  const initialOffset = directionMap[direction] || directionMap.up

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97, ...initialOffset }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={shouldReduceMotion ? { duration: 0.3 } : {
        type: 'spring',
        stiffness: 80,
        damping: 16,
        mass: 0.8,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, className = '', staggerDelay = 0.08 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: shouldReduceMotion 
          ? { opacity: 0 } 
          : { opacity: 0, y: 25, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: shouldReduceMotion ? { duration: 0.3 } : {
            type: 'spring',
            stiffness: 80,
            damping: 16,
            mass: 0.8,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
