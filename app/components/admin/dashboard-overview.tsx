"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  UserCog,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export function DashboardOverview() {
  // Mock data for the dashboard
  const stats = {
    totalPatients: 1248,
    totalDoctors: 87,
    pendingDoctors: 5,
    activeAppointments: 156,
    patientGrowth: 12.5,
    doctorGrowth: 8.3,
    systemHealth: 98.7,
    recentActivity: [
      { id: 1, type: "doctor_approval", user: "Dr. Michael Chen", status: "pending", time: "10 minutes ago" },
      { id: 2, type: "patient_registration", user: "Emma Thompson", status: "completed", time: "25 minutes ago" },
      { id: 3, type: "doctor_approval", user: "Dr. Sarah Williams", status: "approved", time: "1 hour ago" },
      { id: 4, type: "doctor_approval", user: "Dr. Robert Garcia", status: "rejected", time: "2 hours ago" },
      { id: 5, type: "patient_registration", user: "James Wilson", status: "completed", time: "3 hours ago" },
    ],
  }

  const getActivityIcon = (type: string, status: string) => {
    if (type === "doctor_approval") {
      if (status === "pending") return <Clock className="h-4 w-4 text-amber-500" />
      if (status === "approved") return <CheckCircle2 className="h-4 w-4 text-green-500" />
      if (status === "rejected") return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (type === "patient_registration") {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    return <Activity className="h-4 w-4 text-blue-500" />
  }

  const getActivityText = (type: string, user: string, status: string) => {
    if (type === "doctor_approval") {
      if (status === "pending") return `${user} is waiting for approval`
      if (status === "approved") return `${user} was approved`
      if (status === "rejected") return `${user} was rejected`
    }
    if (type === "patient_registration") {
      return `${user} registered as a patient`
    }
    return `Activity by ${user}`
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
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">{stats.patientGrowth}%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDoctors}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">{stats.doctorGrowth}%</span>
              <span className="ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDoctors}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span>Doctors waiting for approval</span>
            </div>
          </CardContent>
          <CardFooter className="p-2">
            <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
              <Link href="/admin?tab=doctors">
                Review Applications
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAppointments}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500 font-medium">3.2%</span>
              <span className="ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="border-gray-200 shadow-sm lg:col-span-4">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Key metrics and system health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">System Health</div>
                <div className="text-sm text-muted-foreground">{stats.systemHealth}%</div>
              </div>
              <Progress value={stats.systemHealth} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Doctor/Patient Ratio</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    1:{Math.round(stats.totalPatients / stats.totalDoctors)}
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Good
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Approval Rate</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">94.3%</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Excellent
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Patient Satisfaction</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">4.7/5.0</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Excellent
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">System Uptime</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">99.98%</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Excellent
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full border-gray-200" asChild>
                <Link href="/admin/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="mt-0.5">{getActivityIcon(activity.type, activity.status)}</div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {getActivityText(activity.type, activity.user, activity.status)}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
              <Link href="/admin/activity">
                View All Activity
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

