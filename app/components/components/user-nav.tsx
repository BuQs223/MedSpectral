"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LifeBuoy, LogOut, Bell, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserNavProps {
  isAdmin?: boolean
}

export function UserNav({ isAdmin = false }: UserNavProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="relative border-gray-200">
        <Bell className="h-5 w-5" />
        <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] bg-primary text-white">
          {isAdmin ? 8 : 3}
        </Badge>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border border-gray-200">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback className={isAdmin ? "bg-primary text-white" : "bg-primary/10 text-primary"}>
                {isAdmin ? "AD" : "JD"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium leading-none">{isAdmin ? "Admin User" : "John Doe"}</p>
                {isAdmin && (
                  <Badge
                    variant="outline"
                    className="ml-1 bg-primary/10 text-primary border-primary/20 text-[10px] py-0 h-4"
                  >
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs leading-none text-muted-foreground">
                {isAdmin ? "admin@medspectra.com" : "john.doe@example.com"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem>
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin Settings</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

