"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppLogo } from "@/components/ui/AppLogo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ArrowRight } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/download", label: "Download" },
    { href: "/about", label: "About" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1f1f1f] bg-black/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <AppLogo size={20} />
          <span className="font-sans font-semibold text-[13px] tracking-tight text-white group-hover:text-white/90 transition-colors">
            Token Tracker
          </span>
          <Badge variant="muted" className="text-[10px] font-mono px-1.5 py-0.5">
            v1.7
          </Badge>
        </Link>

        {/* Center: Nav links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#181818] text-white border border-[#282828]"
                    : "text-[#888888] hover:text-white hover:bg-[#111111]"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Primary Action */}
        <div className="flex items-center space-x-3">
          <Button asChild size="sm" className="hidden sm:inline-flex bg-white text-black font-semibold hover:bg-white/90">
            <Link href="/download" className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Download v1.7</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
