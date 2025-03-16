"use client"

import { useState, useEffect } from "react"
import { format, parseISO, addHours, isBefore } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Calendar, Clock, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  doctorName: string
  date: string
  time: string
  type: string
}

interface AppointmentReminderProps {
  patientId: string
  onDismiss?: (appointmentId: string) => void
}

export function AppointmentReminder({ patientId, onDismiss }: AppointmentReminderProps) {
  const { toast } = useToast()
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dismissedAppointments, setDismissedAppointments] = useState<string[]>([])

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll use mock data
        const mockAppointments: Appointment[] = [
          {
            id: "1",
            doctorName: "Dr. Sarah Johnson",
            date: format(addHours(new Date(), 24), "yyyy-MM-dd"), // Tomorrow
            time: "10:00 AM",
            type: "Check-up",
          },
          {
            id: "2",
            doctorName: "Dr. Michael Chen",
            date: format(addHours(new Date(), 48), "yyyy-MM-dd"), // Day after tomorrow
            time: "2:30 PM",
            type: "Consultation",
          },
        ]

        // Filter to only show appointments within the next 48 hours
        const now = new Date()
        const filteredAppointments = mockAppointments.filter((appointment) => {
          const appointmentDate = new Date(`${appointment.date} ${appointment.time}`)
          return isBefore(now, appointmentDate) && !dismissedAppointments.includes(appointment.id)
        })

        setUpcomingAppointments(filteredAppointments)
      } catch (error) {
        console.error("Error fetching upcoming appointments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpcomingAppointments()

    // Set up interval to refresh appointments every minute
    const intervalId = setInterval(fetchUpcomingAppointments, 60000)

    return () => clearInterval(intervalId)
  }, [patientId, dismissedAppointments])

  const handleDismiss = (appointmentId: string) => {
    setDismissedAppointments((prev) => [...prev, appointmentId])

    if (onDismiss) {
      onDismiss(appointmentId)
    }
  }

  const handleSetReminder = (appointment: Appointment) => {
    // In a real app, this would set up a notification
    // For demo purposes, we'll just show a toast
    toast({
      title: "Reminder Set",
      description: `We'll remind you 1 hour before your appointment with ${appointment.doctorName} on ${format(parseISO(appointment.date), "MMMM d")} at ${appointment.time}.`,
    })
  }

  if (isLoading || upcomingAppointments.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {upcomingAppointments.map((appointment) => (
        <Card key={appointment.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Upcoming Appointment</CardTitle>
                <CardDescription>
                  {format(parseISO(appointment.date), "EEEE, MMMM d")} at {appointment.time}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDismiss(appointment.id)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{appointment.doctorName}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{appointment.type}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={() => handleSetReminder(appointment)}>
              <Bell className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

