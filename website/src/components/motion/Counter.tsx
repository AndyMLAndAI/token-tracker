"use client"

import React, { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion, animate } from "framer-motion"
import { appleEase } from "./animations"

interface CounterProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

export function Counter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.0,
  className = "",
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-20px" })
  const shouldReduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(shouldReduceMotion ? value : 0)

  useEffect(() => {
    if (!isInView) return

    if (shouldReduceMotion) {
      setDisplay(value)
      return
    }

    const controls = animate(0, value, {
      duration,
      ease: appleEase,
      onUpdate: (latest) => {
        setDisplay(latest)
      },
    })

    return () => controls.stop()
  }, [isInView, value, duration, shouldReduceMotion])

  const formattedNumber =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("en-US")

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  )
}
