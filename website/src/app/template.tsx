"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { appleEase } from "@/components/motion/animations"

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: appleEase,
      }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  )
}
