"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format, addDays, isSameDay, startOfDay, addMinutes, isBefore } from "date-fns"
import { Clock, CalendarIcon, Loader2 } from "lucide-react"
import { TimeSlotPicker } from "./time-slot-picker"
import { AppointmentForm } from "./appointment-form"
import { AppointmentConfirmation } from "./appointment-confirmation"
import { useToast } from "@/hooks/use-toast"

interface CalendarViewProps {
  doctorId?: string
  doctorName?: string
  patientView?: boolean
  onAppointmentCreated?: () => void
}

export function CalendarView({
  doctorId = "1",
  doctorName = "Dr. Sarah Johnson",
  patientView = true,
  onAppointmentCreated,
}: CalendarViewProps) {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [appointmentData, setAppointmentData] = useState<any>(null)
  const [existingAppointments, setExistingAppointments] = useState<any[]>([])

  // Fetch existing appointments to check for conflicts
  useEffect(() => {
    const fetchExistingAppointments = async () => {
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll simulate some existing appointments
        const mockAppointments = [
          {
            doctorId: "1",
            date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
            time: "10:00 AM",
          },
          {
            doctorId: "1",
            date: format(addDays(new Date(), 2), "yyyy-MM-dd"),
            time: "2:30 PM",
          },
          {
            doctorId: "2",
            date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
            time: "11:00 AM",
          },
        ]
        setExistingAppointments(mockAppointments)
      } catch (error) {
        console.error("Error fetching existing appointments:", error)
      }
    }

    fetchExistingAppointments()
  }, [])

  // Fetch available dates for the doctor
  useEffect(() => {
    const fetchAvailableDates = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call to fetch the doctor's availability
        // For demo purposes, we'll simulate some available dates
        const today = startOfDay(new Date())
        const dates = [
          today,
          addDays(today, 1),
          addDays(today, 2),
          addDays(today, 4),
          addDays(today, 5),
          addDays(today, 7),
          addDays(today, 8),
          addDays(today, 9),
          addDays(today, 11),
          addDays(today, 12),
        ]
        setAvailableDates(dates)
      } catch (error) {
        console.error("Error fetching available dates:", error)
        toast({
          title: "Error",
          description: "Failed to load available dates. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (doctorId) {
      fetchAvailableDates()
    }
  }, [doctorId, toast])

  // Fetch time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!date || !doctorId) return

      setIsLoading(true)
      try {
        // In a real app, this would be an API call with the doctorId and date
        // For demo purposes, we'll generate some time slots
        const slots = []
        const startHour = 9 // 9 AM
        const endHour = 17 // 5 PM
        const slotDuration = 30 // 30 minutes

        let currentTime = new Date(date)
        currentTime.setHours(startHour, 0, 0, 0)

        const endTime = new Date(date)
        endTime.setHours(endHour, 0, 0, 0)

        // Generate time slots
        while (isBefore(currentTime, endTime)) {
          // Skip lunch break (12 PM - 1 PM)
          if (currentTime.getHours() !== 12) {
            // Check if the slot conflicts with existing appointments
            const timeString = format(currentTime, "h:mm a")
            const dateString = format(date, "yyyy-MM-dd")

            const isConflicting = existingAppointments.some(
              (appointment) =>
                appointment.doctorId === doctorId && appointment.date === dateString && appointment.time === timeString,
            )

            // Randomly mark some slots as unavailable (for demo purposes)
            // In a real app, this would be based on the doctor's actual availability
            const randomAvailability = Math.random() > 0.3
            const isAvailable = !isConflicting && randomAvailability

            slots.push({
              time: timeString,
              available: isAvailable,
            })
          }
          currentTime = addMinutes(currentTime, slotDuration)
        }

        setTimeSlots(slots)
        setSelectedTimeSlot(null) // Reset selected time slot when date changes
      } catch (error) {
        console.error("Error fetching time slots:", error)
        toast({
          title: "Error",
          description: "Failed to load time slots. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTimeSlots()
  }, [date, doctorId, existingAppointments, toast])

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
  }

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time)
  }

  const handleContinue = () => {
    if (!date || !selectedTimeSlot) {
      toast({
        title: "Selection Required",
        description: "Please select both a date and time slot.",
        variant: "destructive",
      })
      return
    }

    // Check real-time availability before proceeding
    checkRealTimeAvailability()
  }

  const checkRealTimeAvailability = async () => {
    if (!date || !selectedTimeSlot || !doctorId) return

    setIsCheckingAvailability(true)
    try {
      // In a real app, this would be an API call to check if the slot is still available
      // For demo purposes, we'll simulate the check with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const dateString = format(date, "yyyy-MM-dd")

      // Check if the slot has been booked by someone else while the user was deciding
      const isStillAvailable = !existingAppointments.some(
        (appointment) =>
          appointment.doctorId === doctorId && appointment.date === dateString && appointment.time === selectedTimeSlot,
      )

      if (isStillAvailable) {
        setShowAppointmentForm(true)
      } else {
        toast({
          title: "Time Slot No Longer Available",
          description: "This time slot has just been booked by another patient. Please select a different time.",
          variant: "destructive",
        })

        // Refresh time slots to show updated availability
        const updatedSlots = timeSlots.map((slot) =>
          slot.time === selectedTimeSlot ? { ...slot, available: false } : slot,
        )
        setTimeSlots(updatedSlots)
        setSelectedTimeSlot(null)
      }
    } catch (error) {
      console.error("Error checking real-time availability:", error)
      toast({
        title: "Error",
        description: "Failed to verify slot availability. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const handleAppointmentSubmit = async (formData: any) => {
    try {
      // Prepare appointment data for confirmation
      const appointmentDetails = {
        doctorId,
        doctorName,
        date: date!,
        timeSlot: selectedTimeSlot!,
        ...formData,
      }

      setAppointmentData(appointmentDetails)
      setShowAppointmentForm(false)
      setShowConfirmation(true)
    } catch (error) {
      console.error("Error preparing appointment:", error)
      toast({
        title: "Error",
        description: "Failed to process appointment details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleConfirmAppointment = () => {
    // In a real app, this would be handled by the AppointmentConfirmation component
    // which would make the API call to create the appointment

    // Add the new appointment to the existing appointments list
    const newAppointment = {
      doctorId: appointmentData.doctorId,
      date: format(appointmentData.date, "yyyy-MM-dd"),
      time: appointmentData.timeSlot,
    }
    setExistingAppointments([...existingAppointments, newAppointment])

    // Reset the form
    setShowConfirmation(false)
    setDate(new Date())
    setSelectedTimeSlot(null)
    setAppointmentData(null)

    // Notify parent component
    if (onAppointmentCreated) {
      onAppointmentCreated()
    }
  }

  const handleBack = () => {
    setShowAppointmentForm(false)
    setShowConfirmation(false)
  }

  const handleEditAppointment = () => {
    setShowConfirmation(false)
    setShowAppointmentForm(true)
  }

  const handleCancelAppointment = () => {
    setShowConfirmation(false)
    setAppointmentData(null)
  }

  if (showConfirmation && appointmentData) {
    return (
      <AppointmentConfirmation
        appointmentData={appointmentData}
        onConfirm={handleConfirmAppointment}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
      />
    )
  }

  return (
    <div className="space-y-6">
      {showAppointmentForm ? (
        <AppointmentForm
          doctorId={doctorId}
          date={date!}
          timeSlot={selectedTimeSlot!}
          onSubmit={handleAppointmentSubmit}
          onBack={handleBack}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" /> Select Date
              </CardTitle>
              <CardDescription>Choose an available date for your appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  // Disable dates that are not in availableDates
                  return (
                    isBefore(date, startOfDay(new Date())) || // Disable past dates
                    !availableDates.some((availableDate) => isSameDay(availableDate, date))
                  )
                }}
                modifiers={{
                  available: availableDates,
                }}
                modifiersClassNames={{
                  available: "border-primary text-primary font-medium",
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" /> Select Time
              </CardTitle>
              <CardDescription>
                {date ? `Available time slots for ${format(date, "MMMM d, yyyy")}` : "Please select a date first"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-[300px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : date ? (
                <TimeSlotPicker
                  timeSlots={timeSlots}
                  selectedTimeSlot={selectedTimeSlot}
                  onSelectTimeSlot={handleTimeSlotSelect}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Please select a date to view available time slots</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={!date || !selectedTimeSlot || isCheckingAvailability}
                onClick={handleContinue}
              >
                {isCheckingAvailability ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking availability...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

