"use client"

import React from "react"

interface AppLogoProps {
  size?: number
  className?: string
}

export function AppLogo({ size = 20, className = '' }: AppLogoProps) {
  return (
    <img
      src="/icon.png"
      alt="Token Tracker"
      width={size}
      height={size}
      className={`rounded-sm object-contain select-none ${className}`}
      onError={(e) => {
        const target = e.currentTarget
        target.onerror = null
        target.src = '/icon.svg'
      }}
    />
  )
}
