"use client"

import { useState, useEffect } from "react"
import { format, parseISO, isAfter, isBefore, isToday } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Search, X, CheckCircle, AlertCircle, CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  type: string
  reason: string
  notes?: string
}

interface AppointmentListProps {
  isDoctor?: boolean
  userId?: string
}

export function AppointmentList({ isDoctor = false, userId = "1" }: AppointmentListProps) {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [appointmentNotes, setAppointmentNotes] = useState("")

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll generate some appointments
        const mockAppointments: Appointment[] = [
          {
            id: "1",
            patientId: "1",
            patientName: "John Doe",
            doctorId: "1",
            doctorName: "Dr. Sarah Johnson",
            date: "2023-07-15",
            time: "10:00 AM",
            status: "completed",
            type: "Check-up",
            reason: "Annual physical examination",
            notes: "Patient is in good health. Blood pressure normal. Recommended regular exercise.",
          },
          {
            id: "2",
            patientId: "1",
            patientName: "John Doe",
            doctorId: "2",
            doctorName: "Dr. Michael Chen",
            date: format(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // 3 days from now
            time: "2:30 PM",
            status: "scheduled",
            type: "Consultation",
            reason: "Persistent headaches",
          },
          {
            id: "3",
            patientId: "2",
            patientName: "Emma Thompson",
            doctorId: "1",
            doctorName: "Dr. Sarah Johnson",
            date: format(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"), // Tomorrow
            time: "9:15 AM",
            status: "scheduled",
            type: "Follow-up",
            reason: "Review test results",
          },
          {
            id: "4",
            patientId: "1",
            patientName: "John Doe",
            doctorId: "3",
            doctorName: "Dr. Emily Rodriguez",
            date: "2023-06-20",
            time: "11:00 AM",
            status: "cancelled",
            type: "Specialist Referral",
            reason: "Skin rash evaluation",
            notes: "Cancelled by patient due to scheduling conflict.",
          },
          {
            id: "5",
            patientId: "3",
            patientName: "Michael Brown",
            doctorId: "1",
            doctorName: "Dr. Sarah Johnson",
            date: format(new Date(), "yyyy-MM-dd"), // Today
            time: "4:00 PM",
            status: "scheduled",
            type: "Urgent Care",
            reason: "Severe back pain",
          },
        ]

        // Filter appointments based on user role
        const userAppointments = isDoctor
          ? mockAppointments.filter((appointment) => appointment.doctorId === userId)
          : mockAppointments.filter((appointment) => appointment.patientId === userId)

        setAppointments(userAppointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [isDoctor, userId, toast])

  // Filter appointments based on tab and search term
  useEffect(() => {
    let filtered = [...appointments]

    // Filter by tab
    if (activeTab === "upcoming") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.status === "scheduled" &&
          (isAfter(parseISO(appointment.date), new Date()) || isToday(parseISO(appointment.date))),
      )
    } else if (activeTab === "past") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.status === "completed" ||
          appointment.status === "no-show" ||
          (appointment.status === "scheduled" &&
            isBefore(parseISO(appointment.date), new Date()) &&
            !isToday(parseISO(appointment.date))),
      )
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter((appointment) => appointment.status === "cancelled")
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (appointment) =>
          appointment.patientName.toLowerCase().includes(term) ||
          appointment.doctorName.toLowerCase().includes(term) ||
          appointment.reason.toLowerCase().includes(term) ||
          appointment.type.toLowerCase().includes(term),
      )
    }

    // Sort by date (newest first for past, oldest first for upcoming)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`).getTime()
      const dateB = new Date(`${b.date} ${b.time}`).getTime()
      return activeTab === "past" ? dateB - dateA : dateA - dateB
    })

    setFilteredAppointments(filtered)
  }, [appointments, activeTab, searchTerm])

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return

    try {
      // In a real app, this would be an API call
      console.log("Cancelling appointment:", {
        appointmentId: selectedAppointment.id,
        reason: cancelReason,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? { ...appointment, status: "cancelled", notes: cancelReason }
            : appointment,
        ),
      )

      setIsCancelDialogOpen(false)
      setSelectedAppointment(null)
      setCancelReason("")

      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been successfully cancelled.",
      })
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) return

    try {
      // In a real app, this would be an API call
      console.log("Rescheduling appointment:", {
        appointmentId: selectedAppointment.id,
        newDate: rescheduleDate,
        newTime: rescheduleTime,
        reason: rescheduleReason,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? {
                ...appointment,
                date: rescheduleDate,
                time: rescheduleTime,
                notes: rescheduleReason ? `Rescheduled: ${rescheduleReason}` : appointment.notes,
              }
            : appointment,
        ),
      )

      setIsRescheduleDialogOpen(false)
      setSelectedAppointment(null)
      setRescheduleDate("")
      setRescheduleTime("")
      setRescheduleReason("")

      toast({
        title: "Appointment Rescheduled",
        description: "The appointment has been successfully rescheduled.",
      })
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      toast({
        title: "Error",
        description: "Failed to reschedule appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCompleteAppointment = async () => {
    if (!selectedAppointment) return

    try {
      // In a real app, this would be an API call
      console.log("Completing appointment:", {
        appointmentId: selectedAppointment.id,
        notes: appointmentNotes,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? {
                ...appointment,
                status: "completed",
                notes: appointmentNotes,
              }
            : appointment,
        ),
      )

      setIsCompleteDialogOpen(false)
      setSelectedAppointment(null)
      setAppointmentNotes("")

      toast({
        title: "Appointment Completed",
        description: "The appointment has been marked as completed.",
      })
    } catch (error) {
      console.error("Error completing appointment:", error)
      toast({
        title: "Error",
        description: "Failed to complete appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="mr-1 h-3 w-3" /> Scheduled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="mr-1 h-3 w-3" /> Cancelled
          </Badge>
        )
      case "no-show":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <AlertCircle className="mr-1 h-3 w-3" /> No Show
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{isDoctor ? "Patient Appointments" : "My Appointments"}</CardTitle>
              <CardDescription>
                {isDoctor
                  ? "Manage your scheduled appointments with patients"
                  : "View and manage your upcoming and past appointments"}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search appointments..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 sm:mb-0">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <CalendarIcon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{isDoctor ? appointment.patientName : appointment.doctorName}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="secondary">{appointment.type}</Badge>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                              {format(parseISO(appointment.date), "MMM d, yyyy")} at {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setIsDetailsOpen(true)
                          }}
                        >
                          Details
                        </Button>

                        {appointment.status === "scheduled" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setIsRescheduleDialogOpen(true)
                              }}
                            >
                              Reschedule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setIsCancelDialogOpen(true)
                              }}
                            >
                              Cancel
                            </Button>
                            {isDoctor && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setIsCompleteDialogOpen(true)
                                }}
                              >
                                Complete
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">No appointments found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === "upcoming"
                      ? "You don't have any upcoming appointments."
                      : activeTab === "past"
                        ? "You don't have any past appointments."
                        : "You don't have any cancelled appointments."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment &&
                `${format(parseISO(selectedAppointment.date), "MMMM d, yyyy")} at ${selectedAppointment.time}`}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient</p>
                  <p>{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Doctor</p>
                  <p>{selectedAppointment.doctorName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p>{selectedAppointment.type}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Reason</p>
                <p>{selectedAppointment.reason}</p>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAppointment && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {isDoctor ? selectedAppointment.patientName : selectedAppointment.doctorName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(selectedAppointment.date), "MMMM d, yyyy")} at {selectedAppointment.time}
                    </p>
                  </div>
                  <Badge variant="secondary">{selectedAppointment.type}</Badge>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="cancel-reason" className="text-sm font-medium">
                Reason for cancellation
              </label>
              <Textarea
                id="cancel-reason"
                placeholder="Please provide a reason for cancelling this appointment"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment} disabled={!cancelReason.trim()}>
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Appointment Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Select a new date and time for your appointment</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAppointment && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {isDoctor ? selectedAppointment.patientName : selectedAppointment.doctorName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Currently: {format(parseISO(selectedAppointment.date), "MMMM d, yyyy")} at{" "}
                      {selectedAppointment.time}
                    </p>
                  </div>
                  <Badge variant="secondary">{selectedAppointment.type}</Badge>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="reschedule-date" className="text-sm font-medium">
                  New Date
                </label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="reschedule-time" className="text-sm font-medium">
                  New Time
                </label>
                <Select onValueChange={setRescheduleTime}>
                  <SelectTrigger id="reschedule-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                    <SelectItem value="9:30 AM">9:30 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    <SelectItem value="10:30 AM">10:30 AM</SelectItem>
                    <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                    <SelectItem value="11:30 AM">11:30 AM</SelectItem>
                    <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                    <SelectItem value="1:30 PM">1:30 PM</SelectItem>
                    <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                    <SelectItem value="2:30 PM">2:30 PM</SelectItem>
                    <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                    <SelectItem value="3:30 PM">3:30 PM</SelectItem>
                    <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                    <SelectItem value="4:30 PM">4:30 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reschedule-reason" className="text-sm font-medium">
                Reason for rescheduling (optional)
              </label>
              <Textarea
                id="reschedule-reason"
                placeholder="Please provide a reason for rescheduling this appointment"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRescheduleAppointment} disabled={!rescheduleDate || !rescheduleTime}>
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Appointment Dialog */}
      {isDoctor && (
        <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Appointment</DialogTitle>
              <DialogDescription>Mark this appointment as completed and add any notes</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedAppointment && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{selectedAppointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(selectedAppointment.date), "MMMM d, yyyy")} at {selectedAppointment.time}
                      </p>
                    </div>
                    <Badge variant="secondary">{selectedAppointment.type}</Badge>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="appointment-notes" className="text-sm font-medium">
                  Appointment Notes
                </label>
                <Textarea
                  id="appointment-notes"
                  placeholder="Enter notes about the appointment, diagnosis, or follow-up instructions"
                  className="min-h-[150px]"
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCompleteAppointment} disabled={!appointmentNotes.trim()}>
                Mark as Completed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

