"use client"

export default function Template({ children }: { children: React.ReactNode }) {
  // Keep routes visible on first paint. A route-level opacity animation can
  // fail closed when hydration is delayed, leaving an otherwise healthy page
  // completely blank.
  return (
    <div className="w-full flex-1 flex flex-col">{children}</div>
  )
}
