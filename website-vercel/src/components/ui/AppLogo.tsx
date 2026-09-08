"use client"

import React from "react"
import Image from "next/image"

interface AppLogoProps {
  size?: number
  className?: string
}

export function AppLogo({ size = 22, className = "" }: AppLogoProps) {
  return (
    <Image
      src="/icon.png"
      alt="Token Tracker"
      width={size}
      height={size}
      className={`rounded-[4px] object-contain select-none ${className}`}
    />
  )
}
