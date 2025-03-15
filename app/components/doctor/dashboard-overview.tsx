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
    upcomingAppointments: 12,
    unreadMessages: 7,
    patientGrowth: 8.5,
    appointmentGrowth: 12.3,
    completionRate: 94.7,
    upcomingAppointmentsList: [
      { id: 1, patient: "John Doe", time: "Today, 10:00 AM", type: "Check-up" },
      { id: 2, patient: "Emma Thompson", time: "Today, 2:30 PM", type: "Follow-up" },
      { id: 3, patient: "Michael Brown", time: "Tomorrow, 9:15 AM", type: "Consultation" },
      { id: 4, patient: "Sophia Garcia", time: "Tomorrow, 11:45 AM", type: "Check-up" },
      { id: 5, patient: "David Wilson", time: "Jun 25, 3:00 PM", type: "Follow-up" },
    ],
    recentActivity: [
      { id: 1, type: "patient_request", patient: "Lisa Martinez", status: "pending", time: "10 minutes ago" },
      { id: 2, type: "medical_record", patient: "John Doe", status: "updated", time: "25 minutes ago" },
      { id: 3, type: "appointment", patient: "Emma Thompson", status: "completed", time: "1 hour ago" },
      { id: 4, type: "message", patient: "Michael Brown", status: "received", time: "2 hours ago" },
      { id: 5, type: "patient_request", patient: "James Johnson", status: "accepted", time: "3 hours ago" },
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
      console.log("@docid" , doctorId)
      // Fetch connections for this doctor
      const { data: connections, error: connectionsError } = await supabase
        .from('connection')
        .select('*')
        .eq('doctor_id', doctorId)

      if (connectionsError) {
        console.error("Error fetching connections:", connectionsError)
        return
      }

      // Count valid connections (patients) and pending requests
      const validConnections = connections.filter(conn => conn.status === 'accepted')
      const pendingConnections = connections.filter(conn => conn.status === 'pending')

      // Update stats with real data
      setStats(prevStats => ({
        ...prevStats,
        totalPatients: validConnections.length,
        pendingRequests: pendingConnections.length
      }))
    } catch (error) {
      console.error("Error in fetchDoctorDashboardData:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">{stats.patientGrowth}%</span>
                  <span className="ml-1">from last month</span>
                </div>
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
              <Link href="/doctor?tab=requests">
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
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">{stats.appointmentGrowth}%</span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>From patients</span>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
              <Link href="/doctor/messages">
                View Messages
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
              <Link href="/doctor/appointments">
                View All Appointments
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-gray-200 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Practice Overview</CardTitle>
            <CardDescription>Key metrics and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Appointment Completion Rate</div>
                <div className="text-sm text-muted-foreground">{stats.completionRate}%</div>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Patient Satisfaction</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">4.8/5.0</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Excellent
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Response Time</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">2.3 hours</div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Good
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full border-gray-200" asChild>
                <Link href="/doctor/analytics">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
