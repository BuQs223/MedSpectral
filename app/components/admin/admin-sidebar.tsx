"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Activity,
  BarChart3,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean
  onToggle?: () => void
}

export function AdminSidebar({ className, collapsed = false, onToggle, ...props }: AdminSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "overview"

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin?tab=overview",
      active: pathname === "/admin" && currentTab === "overview",
      notification: 0,
    },
    {
      label: "Doctor Management",
      icon: UserCog,
      href: "/admin?tab=doctors",
      active: pathname === "/admin" && currentTab === "doctors",
      notification: 5, // Pending doctor approvals
    },
    {
      label: "Patient Management",
      icon: Users,
      href: "/admin?tab=patients",
      active: pathname === "/admin" && currentTab === "patients",
      notification: 0,
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/admin/reports",
      active: pathname === "/admin/reports",
      notification: 0,
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      active: pathname === "/admin/analytics",
      notification: 0,
    },
    {
      label: "System Activity",
      icon: Activity,
      href: "/admin/activity",
      active: pathname === "/admin/activity",
      notification: 3,
    },
    {
      label: "System Settings",
      icon: Settings,
      href: "/admin/settings",
      active: pathname === "/admin/settings",
      notification: 0,
    },
  ]

  return (
    <div className={cn("relative flex flex-col", className)} {...props}>
      <div className="flex h-14 items-center px-4 border-b border-gray-200 justify-between">
        <Link href="/admin" className={cn("flex items-center", collapsed ? "justify-center" : "")}>
          {!collapsed ? (
            <>
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white mr-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
            </>
          ) : (
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
          )}
        </Link>
        <Button variant="ghost" size="icon" onClick={onToggle} className="hidden lg:flex">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <div className={cn("flex-1 overflow-hidden", collapsed ? "px-2" : "px-3")}>
        <div className="space-y-1 py-4">
          {!collapsed && (
            <div className="px-2 mb-2">
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-gray-500 uppercase">Administration</h2>
            </div>
          )}
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="space-y-1 px-1">
              <TooltipProvider delayDuration={0}>
                {routes.map((route) => (
                  <Tooltip key={route.href} delayDuration={collapsed ? 100 : 1000000}>
                    <TooltipTrigger asChild>
                      <Link
                        href={route.href}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          route.active
                            ? "bg-primary/10 text-primary"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                          collapsed ? "justify-center" : "",
                        )}
                      >
                        <div className="relative">
                          <route.icon className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
                          {route.notification > 0 && (
                            <Badge
                              className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-primary text-white"
                              variant="default"
                            >
                              {route.notification}
                            </Badge>
                          )}
                        </div>
                        {!collapsed && route.label}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && <TooltipContent side="right">{route.label}</TooltipContent>}
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className={cn("border-t border-gray-200 p-2", collapsed ? "px-2" : "px-3")}>
        <TooltipProvider delayDuration={0}>
          <Tooltip delayDuration={collapsed ? 100 : 1000000}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  collapsed ? "justify-center px-0" : "",
                )}
                asChild
              >
                <Link href="/login">
                  <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
                  {!collapsed && "Log out"}
                </Link>
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Log out</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

