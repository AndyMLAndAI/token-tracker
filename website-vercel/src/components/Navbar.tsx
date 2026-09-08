"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AppLogo } from "@/components/ui/AppLogo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Overview" },
    { href: "/download", label: "Download" },
    { href: "/about", label: "About" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#cccbc8] bg-[#f0eee6]/95 backdrop-blur-sm transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center space-x-3 group">
          <AppLogo size={24} />
          <span className="font-sans font-bold text-[15px] tracking-tight text-[#141413]">
            Token Tracker
          </span>
          <Badge variant="default" className="text-[10px] font-mono px-2 py-0.5">
            v1.8
          </Badge>
        </Link>

        {/* Center: Nav links in Geist Sans */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-sm text-[13px] sm:text-[14px] font-sans font-medium transition-colors ${
                  isActive
                    ? "text-[#141413] bg-[#e3dacc] font-semibold"
                    : "text-[#57564f] hover:text-[#141413] hover:bg-[#e3dacc]/50"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Quick Download Action */}
        <div className="flex items-center space-x-3">
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <Link href="/download" className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Get v1.8</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
