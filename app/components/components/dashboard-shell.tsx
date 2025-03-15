"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "./dashboard-sidebar"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <DashboardSidebar className="hidden lg:block" />
        <main className="flex-1 overflow-y-auto bg-secondary/10">
          <div className="container pb-12">{children}</div>
        </main>
      </div>
    </div>
  )
}

