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
import { supabase } from "@/utils/supabase"

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  doctor_id: string
  doctor_name: string
  appointment_date: string
  start_time: string
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  type: string
  reason: string
  notes?: string
}

interface AppointmentListProps {
  isDoctor?: boolean
  userId?: string
}

export function AppointmentList({ isDoctor  }: AppointmentListProps) {
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
  
  // Fetch appointments from Supabase
 // Fetch appointments from Supabase
useEffect(() => {
  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id
      
      if (!userId) {
        throw new Error("User not authenticated")
      }
      
      if (isDoctor) {
        // For doctors, get their appointments with patient information
        let { data: doctorData } = await supabase
          .from('doctor')
          .select('id')
          .eq("user_id", userId)

        const doctorId = doctorData && doctorData.length > 0 ? doctorData[0].id : null;
        
        if (!doctorId) {
          throw new Error("Doctor profile not found")
        }
        
        // Get all appointments for this doctor
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointment")
          .select('*')
          .eq("doctor_id", doctorId)
        
        if (appointmentsError) throw appointmentsError
        
        if (!appointmentsData || appointmentsData.length === 0) {
          setAppointments([])
          setIsLoading(false)
          return
        }
        
        // Extract all patient IDs from appointments
        const patientIds = appointmentsData.map(appointment => appointment.patient_id)
        
        // Fetch patient information in a single query
        const { data: patientsData, error: patientsError } = await supabase
          .from('user')
          .select('supabase_id, first_name, last_name')
          .in('supabase_id', patientIds)
        
        if (patientsError) throw patientsError
        
        // Create a map of patient IDs to names
        interface PatientMap {
          [key: string]: string;
        }
        
        const patientMap: PatientMap = {}
        
        if (patientsData) {
          patientsData.forEach(patient => {
            patientMap[patient.supabase_id] = `${patient.first_name} ${patient.last_name}`
          })
        }
        
        // Transform the data to match our Appointment interface
        const formattedAppointments = appointmentsData.map(appointment => ({
          id: appointment.id,
          patient_id: appointment.patient_id,
          patient_name: patientMap[appointment.patient_id] || "Unknown Patient",
          doctor_id: appointment.doctor_id,
          doctor_name: "Self", // Since this is the doctor's view
          appointment_date: appointment.appointment_date,
          start_time: appointment.start_time,
          status: appointment.status,
          type: appointment.type || appointment.appointment_type, // Handle different field names
          reason: appointment.reason,
          notes: appointment.notes
        }))
        
        setAppointments(formattedAppointments)
      } else {
        // For patients, get their appointments with doctor information
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from("appointment")
          .select('*')
          .eq("patient_id", userId)
        
        if (appointmentsError) throw appointmentsError
        
        if (!appointmentsData || appointmentsData.length === 0) {
          setAppointments([])
          setIsLoading(false)
          return
        }
        
        // Extract all doctor IDs from appointments
        const doctorIds = appointmentsData.map(appointment => appointment.doctor_id)
        
        // Fetch doctor information in a single query
        const { data: doctorsData, error: doctorsError } = await supabase
          .from('doctor')
          .select('id, user_id')
          .in('id', doctorIds)
        
        if (doctorsError) throw doctorsError
        
        // Get user information for doctors
        const doctorUserIds = doctorsData?.map(doctor => doctor.user_id) || []
        
        const { data: doctorUsersData, error: doctorUsersError } = await supabase
          .from('user')
          .select('supabase_id, first_name, last_name')
          .in('supabase_id', doctorUserIds)
        
        if (doctorUsersError) throw doctorUsersError
        
        // Create maps for quick lookups
        interface DoctorMap {
          [key: string]: string;
        }
        
        const doctorUserMap: DoctorMap = {}
        const doctorIdToUserIdMap: DoctorMap = {}
        
        if (doctorsData) {
          doctorsData.forEach(doctor => {
            doctorIdToUserIdMap[doctor.id] = doctor.user_id
          })
        }
        
        if (doctorUsersData) {
          doctorUsersData.forEach(doctorUser => {
            doctorUserMap[doctorUser.supabase_id] = `Dr. ${doctorUser.first_name} ${doctorUser.last_name}`
          })
        }
        
        // Transform the data to match our Appointment interface
        const formattedAppointments = appointmentsData.map(appointment => {
          const doctorUserId = doctorIdToUserIdMap[appointment.doctor_id]
          
          return {
            id: appointment.id,
            patient_id: appointment.patient_id,
            patient_name: "Self", // Since this is the patient's view
            doctor_id: appointment.doctor_id,
            doctor_name: doctorUserMap[doctorUserId] || "Unknown Doctor",
            appointment_date: appointment.appointment_date,
            start_time: appointment.start_time,
            status: appointment.status,
            type: appointment.type || appointment.appointment_type, // Handle different field names
            reason: appointment.reason,
            notes: appointment.notes
          }
        })
        
        setAppointments(formattedAppointments)
      }
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
}, [isDoctor, toast, supabase])

  // Filter appointments based on tab and search term
  useEffect(() => {
    let filtered = [...appointments]

    // Filter by tab
    if (activeTab === "upcoming") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.status === "scheduled" ,
      )
    } else if (activeTab === "past") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.status === "completed" ||
          appointment.status === "no-show" ,
      )
    } else if (activeTab === "cancelled") {
      filtered = filtered.filter((appointment) => appointment.status === "cancelled")
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (appointment) =>
          appointment.patient_name.toLowerCase().includes(term) ||
          appointment.doctor_name.toLowerCase().includes(term) ||
          appointment.reason.toLowerCase().includes(term) ||
          appointment.type.toLowerCase().includes(term),
      )
    }

    // Sort by date (newest first for past, oldest first for upcoming)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.appointment_date} ${a.start_time}`).getTime()
      const dateB = new Date(`${b.appointment_date} ${b.start_time}`).getTime()
      return activeTab === "past" ? dateB - dateA : dateA - dateB
    })

    setFilteredAppointments(filtered)
  }, [appointments, activeTab, searchTerm])

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return

    try {
      const { error } = await supabase
        .from("appointment")
        .update({
          status: "cancelled",
          notes: cancelReason,
        })
        .eq("id", selectedAppointment.id)

      if (error) {
        throw error
      }

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
      const { error } = await supabase
        .from("appointment")
        .update({
          appointment_date: rescheduleDate,
          start_time: rescheduleTime,
          notes: rescheduleReason
            ? `Rescheduled: ${rescheduleReason}${
                selectedAppointment.notes ? `\n\nPrevious notes: ${selectedAppointment.notes}` : ""
              }`
            : selectedAppointment.notes,
        })
        .eq("id", selectedAppointment.id)

      if (error) {
        throw error
      }

      // Update local state
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? {
                ...appointment,
                date: rescheduleDate,
                time: rescheduleTime,
                notes: rescheduleReason
                  ? `Rescheduled: ${rescheduleReason}${
                      appointment.notes ? `\n\nPrevious notes: ${appointment.notes}` : ""
                    }`
                  : appointment.notes,
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
      const { error } = await supabase
        .from("appointment")
        .update({
          status: "completed",
          notes: appointmentNotes,
        })
        .eq("id", selectedAppointment.id)

      if (error) {
        throw error
      }

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
                          <h3 className="font-medium">
                            {isDoctor ? appointment.patient_name : appointment.doctor_name}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="secondary">{appointment.type}</Badge>
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>
                            {appointment.appointment_date}
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
                `${selectedAppointment.start_time}`}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                <p className="text-sm font-medium text-gray-500">{isDoctor ? "Patient" : "Doctor"}</p>
                  <p>{isDoctor ?selectedAppointment.patient_name : selectedAppointment.doctor_name}</p>
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
                      {isDoctor ? selectedAppointment.patient_name : selectedAppointment.doctor_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {selectedAppointment.start_time}
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
                      {isDoctor ? selectedAppointment.patient_name : selectedAppointment.doctor_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    {selectedAppointment.start_time}
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
                      <p className="font-medium">{selectedAppointment.patient_name}</p>
                      <p className="text-sm text-muted-foreground">
                      {selectedAppointment.start_time}
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
