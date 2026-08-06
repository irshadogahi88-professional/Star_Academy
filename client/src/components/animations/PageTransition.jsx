import { motion, useReducedMotion } from 'framer-motion'

export default function PageTransition({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  const variants = {
    initial: shouldReduceMotion 
      ? { opacity: 0 } 
      : { opacity: 0, y: 15, scale: 0.985 },
    animate: shouldReduceMotion 
      ? { opacity: 1 } 
      : { opacity: 1, y: 0, scale: 1 },
    exit: shouldReduceMotion 
      ? { opacity: 0 } 
      : { opacity: 0, y: -15, scale: 0.985 }
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
