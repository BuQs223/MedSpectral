import type React from "react"
// Separate layout for doctor dashboard to prevent the main header from showing
export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-white">{children}</div>
}

