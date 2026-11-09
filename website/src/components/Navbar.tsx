"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { AppLogo } from "@/components/ui/AppLogo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/download", label: "Download" },
    { href: "/about", label: "About" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center"
          >
            <AppLogo size={20} />
          </motion.div>
          <span className="font-sans font-medium text-[13px] tracking-tight text-black transition-colors duration-200">
            Token Tracker
          </span>
          <Badge variant="outline" className="rounded-full border-black/15 bg-white px-2 py-0.5 text-[10px] font-mono text-[#666]">
            v1.8
          </Badge>
        </Link>

        {/* Center: Nav links */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                  isActive ? "text-black" : "text-[#666] hover:text-black"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId={shouldReduceMotion ? undefined : "navbar-pill"}
                    className="absolute inset-0 bg-[#f1f1f1] border border-black/10 rounded-full -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 35,
                    }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Primary Action */}
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="hidden sm:inline-flex"
          >
            <Button asChild size="sm" className="rounded-full bg-black text-white font-medium hover:bg-[#222]">
              <Link href="/download" className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Download v1.8</span>
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
