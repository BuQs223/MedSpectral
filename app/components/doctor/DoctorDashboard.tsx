"use client"

import { useState, useEffect } from "react"
import { DoctorShell } from "./doctor-shell"
import { DashboardOverview } from "./dashboard-overview"
import { PatientManagement } from "./patient-management"
import { PatientRequests } from "./patient-requests"
import { MedicalRecords } from "./medical-records"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DoctorNav } from "./doctor-nav"
import { MobileNav } from "./doctor-mobile-nav"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export default function DoctorDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("overview")
  const [mounted, setMounted] = useState(false)

  // Get tab from URL or default to "overview"
  useEffect(() => {
    setMounted(true)
    const tab = searchParams.get("tab") || "overview"
    setActiveTab(tab)
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.push(`${pathname}?${params.toString()}`)
  }

  if (!mounted) return null

  return (
    <DoctorShell>
      <div className="flex items-center justify-between space-y-2 px-4 pt-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Doctor Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your patients, review medical records, and update patient information.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DoctorNav />
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} className="mt-6 px-4 lg:px-8" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="patients"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            My Patients
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Patient Requests
          </TabsTrigger>
          
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <DashboardOverview />
        </TabsContent>
        <TabsContent value="patients" className="mt-6">
          <PatientManagement />
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <PatientRequests />
        </TabsContent>
        <TabsContent value="records" className="mt-6">
          <MedicalRecords />
        </TabsContent>
      </Tabs>
    </DoctorShell>
  )
}

