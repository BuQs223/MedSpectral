"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DoctorSidebar } from "./doctor-sidebar"
import { cn } from "@/lib/utils"

interface DoctorShellProps {
  children: React.ReactNode
}

export function DoctorShell({ children }: DoctorShellProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Check if sidebar state is saved in localStorage
    const savedState = localStorage.getItem("doctorSidebarCollapsed")
    if (savedState) {
      setSidebarCollapsed(savedState === "true")
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("doctorSidebarCollapsed", String(newState))
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1">
        <DoctorSidebar
          className={cn(
            "fixed z-30 h-screen transition-all duration-300 ease-in-out border-r border-gray-200 bg-white",
            sidebarCollapsed ? "w-[70px]" : "w-[250px]",
          )}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out bg-gray-50",
            sidebarCollapsed ? "ml-[70px]" : "ml-[250px]",
          )}
        >
          <div className="min-h-screen pb-12">{children}</div>
        </main>
      </div>
    </div>
  )
}

