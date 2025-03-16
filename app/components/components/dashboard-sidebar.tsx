"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Home,
  Users,
  FileText,
  Upload,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DashboardSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean
  onToggle?: () => void
}

export function DashboardSidebar({ className, collapsed = false, onToggle, ...props }: DashboardSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "doctors"

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard" && !currentTab,
      notification: 0,
    },

    {
      label: "Connect with Doctor",
      icon: UserPlus,
      href: "/dashboard?tab=connect",
      active: pathname === "/dashboard" && currentTab === "connect",
      notification: 0,
    },
    {
      label: "Doctor",
      icon: CheckCircle2,
      href: "/dashboard?tab=status",
      active: pathname === "/dashboard" && currentTab === "status",
      notification: 0,
    },
    {
      label: "Medical Conditions",
      icon: FileText,
      href: "/dashboard?tab=conditions",
      active: pathname === "/dashboard" && currentTab === "conditions",
      notification: 0,
    },
    {
      label: "Medical Files",
      icon: Upload,
      href: "/dashboard?tab=files",
      active: pathname === "/dashboard" && currentTab === "files",
      notification: 0,
    },
    {
      label: "Appointments",
      icon: Calendar,
      href: "/dashboard/scheduling",
      active: pathname === "/dashboard/scheduling",
      notification: 0,
    },
  
   
    
  ]

  return (
    <div className={cn("relative flex flex-col", className)} {...props}>
      <div className="flex h-14 items-center px-4 border-b border-gray-200 justify-between">
        <Link prefetch={true} href="/" className={cn("flex items-center", collapsed ? "justify-center" : "")}>
        <h1 className="text-xl font-bold text-primary">MedSpectra</h1>
        </Link>
        <Button variant="ghost" size="icon" onClick={onToggle} className="hidden lg:flex">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <div className={cn("flex-1 overflow-hidden", collapsed ? "px-2" : "px-3")}>
        <div className="space-y-1 py-4">
          {!collapsed && (
            <div className="px-2 mb-2">
              <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-gray-500 uppercase">Main Menu</h2>
            </div>
          )}
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <div className="space-y-1 px-1">
              <TooltipProvider delayDuration={0}>
                {routes.map((route) => (
                  <Tooltip key={route.href} delayDuration={collapsed ? 100 : 1000000}>
                    <TooltipTrigger asChild>
                      <Link
                      prefetch={true}
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
                <Link prefetch={true} href="/login">
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

