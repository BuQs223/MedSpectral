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
import { User, Settings, LifeBuoy, LogOut, Bell, Stethoscope } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DoctorNav() {
  return (
    <div className="flex items-center gap-2">
      

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border border-gray-200">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Doctor" />
              <AvatarFallback className="bg-primary/10 text-primary">DR</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium leading-none">Dr. Sarah Johnson</p>
                <Badge
                  variant="outline"
                  className="ml-1 bg-primary/10 text-primary border-primary/20 text-[10px] py-0 h-4"
                >
                  Doctor
                </Badge>
              </div>
              <p className="text-xs leading-none text-muted-foreground">sarah.johnson@medspectra.com</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Stethoscope className="mr-2 h-4 w-4" />
              <span>My Practice</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
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

