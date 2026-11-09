import React, { useEffect, useRef } from 'react'
import { useMotionValue, useSpring } from 'motion/react'

interface AnimatedNumberProps {
  value: number
  formatter?: (val: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  formatter = (v) => Math.round(v).toLocaleString(),
  className = '',
}: AnimatedNumberProps) {
  const motionVal = useMotionValue(value)
  const springVal = useSpring(motionVal, { stiffness: 280, damping: 28, mass: 0.6 })
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    motionVal.set(value)
  }, [value, motionVal])

  useEffect(() => {
    const unsubscribe = springVal.on('change', (latest) => {
      if (spanRef.current) {
        spanRef.current.textContent = formatter(latest)
      }
    })
    return () => unsubscribe()
  }, [springVal, formatter])

  return (
    <span ref={spanRef} className={`tabular-nums font-mono ${className}`}>
      {formatter(value)}
    </span>
  )
}
