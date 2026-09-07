"use client"

import React from "react"
import { motion, useReducedMotion, HTMLMotionProps } from "framer-motion"
import { appleEase } from "./animations"

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number
  yOffset?: number
  duration?: number
  viewportOnce?: boolean
  className?: string
  children: React.ReactNode
}

export function FadeIn({
  delay = 0,
  yOffset = 18,
  duration = 0.5,
  viewportOnce = true,
  className = "",
  children,
  ...props
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: viewportOnce, margin: "-40px" }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: appleEase,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerProps extends HTMLMotionProps<"div"> {
  staggerDelay?: number
  delayChildren?: number
  className?: string
  children: React.ReactNode
}

export function Stagger({
  staggerDelay = 0.07,
  delayChildren = 0,
  className = "",
  children,
  ...props
}: StaggerProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
            delayChildren: shouldReduceMotion ? 0 : delayChildren,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  className = "",
  children,
  yOffset = 16,
  duration = 0.45,
  ...props
}: HTMLMotionProps<"div"> & { yOffset?: number; duration?: number }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : yOffset },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0 : duration,
            ease: appleEase,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
