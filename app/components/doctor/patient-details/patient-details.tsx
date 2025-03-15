"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, MessageSquare, Printer, Bell } from "lucide-react"
import { PatientOverview } from "./patient-overview"
import { PatientMedicalHistory } from "./patient-medical-history"
import { PatientFiles } from "./patient-files"
import { PatientReports } from "./patient-reports"
import { PatientDiagnosis } from "./patient-diagnosis"

interface PatientDetailsProps {
  patient: any // Using any for brevity, but should define a proper type
}

export function PatientDetails({ patient }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/doctor?tab=patients">
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back to patients</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{patient.name}</h1>
              <p className="text-sm text-muted-foreground">
                {patient.age} years • {patient.gender}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:inline-flex">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Message</span>
            </Button>
            <Button>
              <Bell className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Notify</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-lg shadow-sm p-1 mb-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
              >
                Medical History
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
              >
                Files
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
              >
                Reports
              </TabsTrigger>
              <TabsTrigger
                value="diagnosis"
                className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
              >
                Diagnosis
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0 border-none p-0">
            <PatientOverview patient={patient} />
          </TabsContent>

          <TabsContent value="history" className="mt-0 border-none p-0">
            <PatientMedicalHistory patient={patient} />
          </TabsContent>

          <TabsContent value="files" className="mt-0 border-none p-0">
            <PatientFiles patient={patient} />
          </TabsContent>

          <TabsContent value="reports" className="mt-0 border-none p-0">
            <PatientReports patient={patient} />
          </TabsContent>

          <TabsContent value="diagnosis" className="mt-0 border-none p-0">
            <PatientDiagnosis patient={patient} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

