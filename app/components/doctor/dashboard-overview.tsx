"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, ClipboardList, MessageSquare, UserPlus, ArrowUpRight, ArrowRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase"

export function DashboardOverview() {
  // State for dashboard data
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingRequests: 0,
    upcomingAppointments: 0,
    unreadMessages: 7,
    patientGrowth: 8.5,
    appointmentGrowth: 12.3,
    completionRate: 94.7,
    upcomingAppointmentsList: [
      { id: 1, patient: "", time: "", type: "" },
      
    ],
    recentActivity: [
      { id: 1, type: "patient_request", patient: "Lisa Martinez", status: "pending", time: "10 minutes ago" },
      
    ],
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctorDashboardData()
  }, [])

  const fetchDoctorDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error("No authenticated user found")
        return
      }
  
      // Get doctor ID
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctor')
        .select('id')
        .eq('user_id', user.id)
        .single()
  
      if (doctorError || !doctorData) {
        console.error("Error fetching doctor data:", doctorError)
        return
      }
  
      const doctorId = doctorData.id
      console.log("@docid", doctorId)
      
      // Fetch connections for this doctor
      const { data: connections, error: connectionsError } = await supabase
        .from('connection')
        .select('*')
        .eq('doctor_id', doctorId)
  
      if (connectionsError) {
        console.error("Error fetching connections:", connectionsError)
        return
      }
      
      // Fetch upcoming appointments
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointment')
        .select('*')
        .eq('doctor_id', doctorId)
      
      if (appointmentsError) {
        console.error("Error fetching appointments:", appointmentsError)
        return
      }
      
      // Count valid connections (patients) and pending requests
      const validConnections = connections.filter(conn => conn.status === 'accepted')
      const pendingConnections = connections.filter(conn => conn.status === 'pending')
      const validAppointments = appointments.filter(appt => appt.status === 'scheduled')
  
      // Create an array of all user_ids from appointments
      const userIds = appointments.map(appointment => appointment.user_id)
      
      // Fetch user information for all patients in one query
      const { data: patients, error: patientsError } = await supabase
        .from('user')
        .select('supabase_id, first_name, last_name')
        .in('supabase_id', userIds)
      console.log(patients)
      if (patientsError) {
        console.error("Error fetching patient information:", patientsError)
        return
      }
      
      // Create a map of user_id to patient name for quick lookup
      // Define the type for the patient map
      interface PatientInfo {
        [key: string]: string;
      }
      
      const patientMap: PatientInfo = {}
      
      if (patients) {
        patients.forEach(patient => {
          patientMap[patient.supabase_id] = `${patient.first_name} ${patient.last_name}`
        })
      }
      console.log(patientMap)
      // Format the upcoming appointments list
      const formattedAppointments = appointments.map(appointment => {
        const appointmentDate = new Date(appointment.appointment_date)
        
        // Format the date/time
        let timeString
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        if (appointmentDate.toDateString() === today.toDateString()) {
          timeString = `Today, ${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
          timeString = `Tomorrow, ${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        } else {
          timeString = `${appointmentDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        }
        console.log(appointment.user_id)
        // Get patient name from the map, or use a fallback if not found
        const patientName = patientMap[appointment.user_id] || "Unknown Patient"
        
        return {
          id: appointment.id,
          patient: patientName,
          time: timeString,
          type: appointment.appointment_type || "Consultation" // Fallback if type is missing
        }
      })
  
      // Update stats with real data
      setStats(prevStats => ({
        ...prevStats,
        totalPatients: validConnections.length,
        pendingRequests: pendingConnections.length,
        upcomingAppointments: validAppointments.length,
        upcomingAppointmentsList: formattedAppointments
      }))
    } catch (error) {
      console.error("Error in fetchDoctorDashboardData:", error)
    } finally {
      setLoading(false)
    }
  }
  
  
  

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Requests</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span>Pending approval</span>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="p-2">
            <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
              <Link prefetch={true} href="/doctor?tab=requests">
                Review Requests
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            
          </CardContent>
        </Card>

        
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card className="border-gray-200 shadow-sm lg:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your schedule for the next few days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingAppointmentsList.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {appointment.patient
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-medium">{appointment.patient}</div>
                      <div className="text-xs text-muted-foreground">{appointment.time}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {appointment.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
              <Link prefetch={true} href="/doctor/scheduling">
                View All Appointments
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        
      </div>
    </div>
  )
}
