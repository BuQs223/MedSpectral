"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Mail, Calendar, FileText, MoreHorizontal, User, UserCog } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for patients
const patientsData = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    gender: "Male",
    age: 42,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
    registrationDate: "2023-01-10",
    lastVisit: "2023-06-15",
    medicalConditions: ["Hypertension", "Type 2 Diabetes"],
    assignedDoctor: "Dr. Sarah Johnson",
    address: "123 Main St, Anytown, CA 12345",
    phone: "(555) 123-4567",
    insurance: "Blue Cross Blue Shield",
  },
  {
    id: 2,
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    gender: "Female",
    age: 35,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
    registrationDate: "2023-02-22",
    lastVisit: "2023-06-20",
    medicalConditions: ["Asthma"],
    assignedDoctor: "Dr. Michael Chen",
    address: "456 Oak Ave, Somewhere, NY 67890",
    phone: "(555) 234-5678",
    insurance: "Aetna",
  },
  {
    id: 3,
    name: "David Wilson",
    email: "david.wilson@example.com",
    gender: "Male",
    age: 58,
    image: "/placeholder.svg?height=100&width=100",
    status: "inactive",
    registrationDate: "2022-11-05",
    lastVisit: "2023-03-12",
    medicalConditions: ["Arthritis", "High Cholesterol"],
    assignedDoctor: "Dr. Emily Rodriguez",
    address: "789 Pine St, Elsewhere, TX 54321",
    phone: "(555) 345-6789",
    insurance: "Medicare",
  },
  {
    id: 4,
    name: "Sophia Garcia",
    email: "sophia.garcia@example.com",
    gender: "Female",
    age: 29,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
    registrationDate: "2023-03-18",
    lastVisit: "2023-06-18",
    medicalConditions: ["Migraine"],
    assignedDoctor: "Dr. James Wilson",
    address: "101 Elm St, Nowhere, FL 13579",
    phone: "(555) 456-7890",
    insurance: "UnitedHealthcare",
  },
  {
    id: 5,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    gender: "Male",
    age: 45,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
    registrationDate: "2023-01-30",
    lastVisit: "2023-06-10",
    medicalConditions: ["Lower Back Pain"],
    assignedDoctor: "Dr. Olivia Thompson",
    address: "202 Maple Ave, Anyplace, WA 24680",
    phone: "(555) 567-8901",
    insurance: "Cigna",
  },
  {
    id: 6,
    name: "Olivia Martinez",
    email: "olivia.martinez@example.com",
    gender: "Female",
    age: 62,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
    registrationDate: "2022-10-15",
    lastVisit: "2023-05-28",
    medicalConditions: ["Osteoporosis", "Hypertension"],
    assignedDoctor: "Dr. Robert Kim",
    address: "303 Birch Rd, Somewhere Else, IL 97531",
    phone: "(555) 678-9012",
    insurance: "Humana",
  },
  {
    id: 7,
    name: "James Johnson",
    email: "james.johnson@example.com",
    gender: "Male",
    age: 38,
    image: "/placeholder.svg?height=100&width=100",
    status: "inactive",
    registrationDate: "2022-12-20",
    lastVisit: "2023-02-05",
    medicalConditions: ["Anxiety Disorder"],
    assignedDoctor: "Dr. Lisa Martinez",
    address: "404 Cedar Ln, Anytown, CA 12345",
    phone: "(555) 789-0123",
    insurance: "Kaiser Permanente",
  },
  {
    id: 8,
    name: "Emily Davis",
    email: "emily.davis@example.com",
    gender: "Female",
    age: 51,
    image: "/placeholder.svg?height=100&width=100",
    status: "active",
    registrationDate: "2023-02-08",
    lastVisit: "2023-06-22",
    medicalConditions: ["Hypothyroidism", "Seasonal Allergies"],
    assignedDoctor: "Dr. David Patel",
    address: "505 Walnut St, Elsewhere, TX 54321",
    phone: "(555) 890-1234",
    insurance: "Anthem",
  },
]

export function PatientManagement() {
  const [patients, setPatients] = useState(patientsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPatient, setSelectedPatient] = useState<(typeof patientsData)[0] | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <CardTitle>Patient Management</CardTitle>
          <CardDescription>View and manage patient information</CardDescription>
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
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-left">
                    <th className="h-12 px-4 text-left font-medium text-gray-500">Name</th>
                    <th className="h-12 px-4 text-left font-medium text-gray-500 hidden md:table-cell">Age/Gender</th>
                    <th className="h-12 px-4 text-left font-medium text-gray-500 hidden lg:table-cell">Last Visit</th>
                    <th className="h-12 px-4 text-left font-medium text-gray-500">Status</th>
                    <th className="h-12 px-4 text-right font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50">
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
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-xs text-muted-foreground">{patient.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        {patient.age} / {patient.gender}
                      </td>
                      <td className="p-4 hidden lg:table-cell">{new Date(patient.lastVisit).toLocaleDateString()}</td>
                      <td className="p-4">{getStatusBadge(patient.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>

                          <Button variant="ghost" size="icon">
                            <Mail className="h-4 w-4" />
                            <span className="sr-only">Email</span>
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
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>View Appointments</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                <span>Medical Records</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserCog className="mr-2 h-4 w-4" />
                                <span>Assign Doctor</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Edit Profile</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPatients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">No patients found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Patient Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Detailed information about the patient</DialogDescription>
          </DialogHeader>

          {selectedPatient && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 flex flex-col items-center">
                <Avatar className="h-32 w-32 border border-gray-200">
                  <AvatarImage src={selectedPatient.image} alt={selectedPatient.name} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {selectedPatient.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-4 text-center">
                  <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedPatient.age} years, {selectedPatient.gender}
                  </p>
                </div>

                <div className="mt-4 w-full">{getStatusBadge(selectedPatient.status)}</div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="mt-1">{selectedPatient.email}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p className="mt-1">{selectedPatient.phone}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                    <p className="mt-1">{selectedPatient.address}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Insurance</h4>
                    <p className="mt-1">{selectedPatient.insurance}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Registration Date</h4>
                    <p className="mt-1">{new Date(selectedPatient.registrationDate).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Visit</h4>
                    <p className="mt-1">{new Date(selectedPatient.lastVisit).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Assigned Doctor</h4>
                  <p className="mt-1">{selectedPatient.assignedDoctor}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Medical Conditions</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPatient.medicalConditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              View Medical Records
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

