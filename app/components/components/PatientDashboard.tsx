"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "./dashboard-shell"
import { DoctorsList } from "./doctors-list"
import { MedicalConditions } from "./medical-conditions"
import { FileUpload } from "./file-upload"
import { DoctorConnectionForm } from "./doctor-connection-form"
import { ConnectionStatus } from "./connection-status"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserNav } from "./user-nav"
import { MobileNav } from "./mobile-nav"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

// Sample data for doctor connections
const doctorConnectionsData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    image: "/placeholder.svg?height=100&width=100",
    status: "accepted" as const,
    requestDate: "2023-05-15",
    responseDate: "2023-05-17",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    image: "/placeholder.svg?height=100&width=100",
    status: "pending" as const,
    requestDate: "2023-06-21",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatologist",
    image: "/placeholder.svg?height=100&width=100",
    status: "accepted" as const,
    requestDate: "2023-04-10",
    responseDate: "2023-04-12",
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Orthopedic Surgeon",
    image: "/placeholder.svg?height=100&width=100",
    status: "denied" as const,
    requestDate: "2023-05-18",
    responseDate: "2023-05-20",
    message:
      "I'm currently not accepting new patients. Please try again in 3 months or connect with another orthopedic specialist.",
  },
]

export default function PatientDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("doctors")
  const [mounted, setMounted] = useState(false)
  const [doctorConnections, setDoctorConnections] = useState(doctorConnectionsData)

  // Get tab from URL or default to "doctors"
  useEffect(() => {
    setMounted(true)
    const tab = searchParams.get("tab") || "connect"
    setActiveTab(tab)
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle doctor connection form submission
  const handleConnectionSubmit = (data: any) => {
    console.log("Connection request submitted:", data)

    // Add the new connection to the connections list
    if (data.selectedDoctor) {
      const doctorId = Number.parseInt(data.selectedDoctor)

      // Check if this doctor is already in the connections
      const existingConnection = doctorConnections.find((conn) => conn.id === doctorId)

      if (!existingConnection) {
        // Find the doctor details from the form data
        const selectedDoctorDetails = {
          id: doctorId,
          name: data.doctorName || `Dr. ${doctorId}`, // Fallback if name not provided
          specialty: data.doctorSpecialty || "Specialist",
          image: "/placeholder.svg?height=100&width=100",
          status: "pending" as const,
          requestDate: new Date().toISOString().split("T")[0],
        }

        setDoctorConnections([...doctorConnections, selectedDoctorDetails])
      } else {
        // Update existing connection if it was previously denied
        if (existingConnection.status === "denied") {
          
        }
      }
    }
  }

  if (!mounted) return null

  return (
    <DashboardShell>
      <div className="flex items-center justify-between space-y-2 px-4 pt-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Patient Dashboard</h2>
          <p className="text-muted-foreground">Manage your health, connect with doctors, and upload medical files.</p>
        </div>
        <div className="flex items-center space-x-2">
          <UserNav />
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} className="mt-6 px-4 lg:px-8" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1">
        <TabsTrigger
            value="connect"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Connect with Doctor
          </TabsTrigger>
        <TabsTrigger
            value="status"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Doctors
          </TabsTrigger>
          
          
          
          <TabsTrigger
            value="conditions"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Medical Conditions
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Medical Files
          </TabsTrigger>
        </TabsList>
        <TabsContent value="doctors" className="mt-6">
          <DoctorsList  />
        </TabsContent>
        <TabsContent value="connect" className="mt-6">
          <DoctorConnectionForm onSubmit={handleConnectionSubmit} />
        </TabsContent>
        <TabsContent value="status" className="mt-6">
          <ConnectionStatus  />
        </TabsContent>
        <TabsContent value="conditions" className="mt-6">
          <MedicalConditions />
        </TabsContent>
        <TabsContent value="files" className="mt-6">
          <FileUpload />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

