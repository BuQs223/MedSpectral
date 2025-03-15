"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, FileText, MoreHorizontal, User, ClipboardList, MessageSquare, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/utils/supabase"

// Define types for our data structures
interface User {
  supabase_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at?: string;
  gender?: string;
  // Add other user fields as needed
}

interface Patient {
  id: string;
  user_id: string;
  age?: number;
  blood_type?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  created_at?: string;
  // Add other patient fields as needed
}

interface Connection {
  id: string;
  doctor_id: string;
  patient_id: string;
  status: string;
  reason?: string;
  medical_conditions?: string;
  created_at?: string;
  last_visit?: string;
  // Add other connection fields as needed
}

interface PatientDetail {
  connectionId: string;
  patientId: string;
  userId: string;
  userData: User;
  patientData: Patient;
  connectionData: Connection;
  // Derived fields for UI
  name: string;
  email: string;
  age: number | null;
  gender: string;
  lastVisit: string | null;
  medicalConditions: string[];
  status: string;
  image: string;
}

export function PatientManagement() {
  const [patients, setPatients] = useState<PatientDetail[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
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
      const validConnections = connections.filter(conn => conn.status === 'accepted') as Connection[]

      // Get patient details for valid connections
      const patientDetails: PatientDetail[] = []

      for (const connection of validConnections) {
        // First get the patient record to get the user_id
        const { data: patientData, error: patientError } = await supabase
          .from('patient')
          .select('*')
          .eq('user_id', connection.patient_id)
          .single()
        
        if (patientError) {
          console.error("Error fetching patient data:", patientError)
          continue
        }
        
        if (patientData && patientData.user_id) {
          // Now get the user details using the user_id
          const { data: userData, error: userError } = await supabase
            .from('user')
            .select('*')
            .eq('supabase_id', patientData.user_id)
            .single()
          
          if (userError) {
            console.error("Error fetching user data:", userError)
            continue
          }
          
          if (userData) {
            // Parse medical conditions from string to array
            const medicalConditionsArray = connection.medical_conditions 
              ? connection.medical_conditions.split(',').map(item => item.trim())
              : []
            
            // Format the patient data for display
            patientDetails.push({
              connectionId: connection.id,
              patientId: connection.patient_id,
              userId: patientData.user_id,
              patientData: patientData as Patient,
              userData: userData as User,
              connectionData: connection,
              // Derived fields for UI
              name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Unknown',
              email: userData.email || 'No email',
              age: patientData.age || null,
              gender: userData.gender || 'Not specified',
              lastVisit: connection.last_visit || null,
              medicalConditions: medicalConditionsArray,
              status: connection.status === 'accepted' ? 'active' : 'inactive',
              image: userData.avatar_url || '/placeholder.svg?height=100&width=100'
            })
          }
        }
      }

      setPatients(patientDetails)
    } catch (error) {
      console.error("Error in fetchPatients:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100">
            Inactive
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>My Patients</CardTitle>
          <CardDescription>View and manage your patient information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients..."
                className="pl-8 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-gray-200">
            <div className="relative w-full overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <span>Loading patients...</span>
                </div>
              ) : (
                <table className="w-full caption-bottom text-sm">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200 text-left">
                      <th className="h-12 px-4 text-left font-medium text-gray-500">Name</th>
                      <th className="h-12 px-4 text-left font-medium text-gray-500 hidden md:table-cell">Age/Gender</th>
                      <th className="h-12 px-4 text-left font-medium text-gray-500 hidden lg:table-cell">Last Visit</th>
                      <th className="h-12 px-4 text-left font-medium text-gray-500 hidden lg:table-cell">
                        Medical Conditions
                      </th>
                      <th className="h-12 px-4 text-left font-medium text-gray-500">Status</th>
                      <th className="h-12 px-4 text-right font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.connectionId} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-gray-200">
                              <AvatarImage src={patient.image} alt={patient.name} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link
                                href={`/doctor/patients/${patient.userId}`}
                                className="font-medium hover:underline text-primary"
                              >
                                {patient.name}
                              </Link>
                              <div className="text-xs text-muted-foreground">{patient.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {patient.age !== null ? patient.age : 'N/A'} / {patient.gender}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          {patient.lastVisit 
                            ? new Date(patient.lastVisit).toLocaleDateString() 
                            : 'No visits yet'}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          {patient.medicalConditions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {patient.medicalConditions.map((condition) => (
                                <Badge
                                  key={condition}
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0"
                                >
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">None recorded</span>
                          )}
                        </td>
                        <td className="p-4">{getStatusBadge(patient.status)}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                              <Link href={`/doctor/patients/${patient.userId}`}>
                                <FileText className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">View</span>
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link href={`/doctor/patients/${patient.userId}`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>View Details</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>Schedule Appointment</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/doctor/patients/${patient.userId}?tab=diagnosis`}>
                                    <ClipboardList className="mr-2 h-4 w-4" />
                                    <span>Add Diagnosis</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  <span>Send Message</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!loading && filteredPatients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">No patients found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {patients.length === 0 
                      ? "You don't have any patients yet" 
                      : "Try adjusting your search or filter criteria"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
