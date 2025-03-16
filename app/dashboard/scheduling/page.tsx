"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentList } from "@/app/components/scheduling/appointment-list"
import { useState } from "react"
import { DoctorSelector } from "@/app/components/scheduling/doctor-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalendarView } from "@/app/components/scheduling/calendar-view"

export default function PatientSchedulingPage() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>()
  const [selectedDoctorName, setSelectedDoctorName] = useState<string | undefined>()
  const [appointmentCreated, setAppointmentCreated] = useState(false)

  // Mock doctor data for demonstration
  const doctorNames: Record<string, string> = {
    "1": "Dr. Sarah Johnson",
    "2": "Dr. Michael Chen",
    "3": "Dr. Emily Rodriguez",
    "4": "Dr. James Wilson",
    "5": "Dr. Lisa Patel",
    "6": "Dr. Robert Kim",
  }

  const handleSelectDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId)
    setSelectedDoctorName(doctorNames[doctorId])
    setAppointmentCreated(false)
  }

  const handleAppointmentCreated = () => {
    setAppointmentCreated(true)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Schedule an Appointment</h1>

      <Tabs defaultValue="book" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="book">Book Appointment</TabsTrigger>
          <TabsTrigger value="manage">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="mt-0">
          {appointmentCreated ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-green-600">Appointment Scheduled Successfully!</CardTitle>
                <CardDescription className="text-center">
                  Your appointment has been confirmed and added to your schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6">You can view and manage your appointments in the "My Appointments" tab.</p>
                <button
                  onClick={() => setAppointmentCreated(false)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Schedule Another Appointment
                </button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">1. Select a Doctor</h2>
                <DoctorSelector onSelectDoctor={handleSelectDoctor} selectedDoctorId={selectedDoctorId} />
              </div>

              {selectedDoctorId && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold mb-4">2. Choose Date & Time for {selectedDoctorName}</h2>
                    <CalendarView
                      doctorId={selectedDoctorId}
                      doctorName={selectedDoctorName}
                      onAppointmentCreated={handleAppointmentCreated}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manage" className="mt-0">
          <AppointmentList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

