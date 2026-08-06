import { motion } from 'framer-motion'
import { PhoneCall } from 'lucide-react'

export default function WhatsAppFAB() {
  return (
    <motion.a
      href="https://wa.me/923083309704?text=Hello! I'm interested in Star Educational Academy's programs."
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-all duration-300 hover:shadow-emerald-500/20"
      style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Chat on WhatsApp"
    >
      <PhoneCall size={24} className="text-[#060e0a]" />
      
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full animate-pulse-glow" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-[#0a1b14] text-emerald-300 border border-[#10b981]/20 text-xs font-bold rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Chat with us!
      </span>
    </motion.a>
  )
}
