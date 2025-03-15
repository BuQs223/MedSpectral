"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, CheckCircle, XCircle, Clock, Eye, UserCheck, UserX, Mail, Star, UserCog } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/utils/supabase"
import { useAuth } from "@/utils/auth"
import { fetchDoctors, fetchDoctorsWithFilters } from "@/app/utils/doctors"

// Define the doctor type
interface Doctor {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  specialty?: string;
  rating?: number;
  reviews?: number;
  avatar_url?: string;
  status?: string;
  created_at?: string;
  about?: string;
  education?: string;
  experience?: string;
  certifications?: string[];
  supabase_id: string;
  metadata?: any;
  user?: user;
  specialization?: specialization;
}
interface user{
  first_name?: string;
  last_name?: string;
  email?: string;
}
interface specialization{
  specialization?: string;
}
// Mock data for doctors (fallback if fetch fails)

export function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const { user } = useAuth()

  // Fetch doctors on component mount
  useEffect(() => {
    async function loadDoctors() {
      setIsLoading(true);
      try {
        const { doctors, users, specialization, error } = await fetchDoctors(); // Ensure `specializations` is correctly fetched
        if (error) {
          console.error("Error fetching doctors:", error);
          // Handle fallback here if needed
        } else if (doctors) {
          const doctorsWithDetails = doctors.map(doctor => {
            const user = users?.find(u => u.supabase_id === doctor.user_id);
            const doctorSpecialization = specialization?.find(s => s.id === doctor.specialization_id);
  
            return {
              ...doctor,
              user: user || null,
              specialization: doctorSpecialization || null, // Attach specialization data
            };
          });
  
          setDoctors(doctorsWithDetails);
        }
      } catch (error) {
        console.error("Error in loadDoctors:", error);
      } finally {
        setIsLoading(false);
      }
    }
  
    loadDoctors();
  }, []);
  

  // Apply filters when search or filter values change
  // Apply filters when search or filter values change
useEffect(() => {
  async function applyFilters() {
    if (!searchTerm && statusFilter === "all" && specialtyFilter === "all") {
      // If no filters, just load all doctors
      const { doctors, users } = await fetchDoctors();
      
      if (doctors && users) {
        // Combine the data
        const doctorsWithUsers = doctors.map(doctor => {
          const user = users.find(u => u.supabase_id === doctor.user_id);
          return {
            ...doctor,
            user: user || null
          };
        });
        
        setDoctors(doctorsWithUsers);
      }
      return;
    }
    
    setIsLoading(true);
    try {
      const options: any = {};
      
      if (searchTerm) {
        options.name = searchTerm;
      }
      
      if (statusFilter !== "all") {
        options.status = statusFilter;
      }
      
      if (specialtyFilter !== "all") {
        options.specialty = specialtyFilter;
      }
      
      const { data, error } = await fetchDoctorsWithFilters(options);
      
      if (error) {
        console.error("Error applying filters:", error);
      } else if (data) {
        setDoctors(data);
      }
    } catch (error) {
      console.error("Error in applyFilters:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  // Debounce the filter application to avoid too many requests
  const timeoutId = setTimeout(() => {
    applyFilters();
  }, 300);
  
  return () => clearTimeout(timeoutId);
}, [searchTerm, statusFilter, specialtyFilter]);
  const handleApproveDoctor = async (id: string) => {
    try {

        const {  } = await supabase
        .from('doctor')
        .update({  status: 'approved' })
        .eq('id', id)
        .select()

      // Close the dialog
      setApprovalDialogOpen(false);
    } catch (error) {
      console.error("Error in handleApproveDoctor:", error);
    }
  }

  const handleRejectDoctor = async (id: string) => {
    try {
      // Update the doctor's status in Supabase
      const { data, error } = await supabase
        .from('user')
        .update({ 
          status: 'rejected',
          metadata: { 
            ...selectedDoctor?.metadata,
            rejection_reason: rejectionReason,
            rejected_at: new Date().toISOString()
          }
        })
        .eq('id', id)
        .select();
      
      if (error) {
        console.error("Error rejecting doctor:", error);
        return;
      }
      
      // Update the local state
      setDoctors(doctors.map(doctor => 
        doctor.id === id ? { 
          ...doctor, 
          status: 'rejected',
          metadata: {
            ...doctor.metadata,
            rejection_reason: rejectionReason,
            rejected_at: new Date().toISOString()
          }
        } : doctor
      ));
      
      // Close the dialog and reset the rejection reason
      setRejectionDialogOpen(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error in handleRejectDoctor:", error);
    }
  }

  const filteredDoctors = doctors;
  console.log("FILTERED DOCS@@@@@@@@@@",filteredDoctors)
  const getStatusBadge = (status: string = 'pending') => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        )
    }
  }

  const pendingCount = doctors.filter((doctor) => doctor.status === "pending").length
  const approvedCount = doctors.filter((doctor) => doctor.status === "approved").length
  const rejectedCount = doctors.filter((doctor) => doctor.status === "rejected").length

  // Helper function to get doctor's full name
  const getDoctorName = (doctor: Doctor) => {
    return `${doctor.user?.first_name || ''} ${doctor.user?.last_name || ''}`.trim() || 'Unknown Doctor';
  } 

  // Helper function to get doctor's initials for avatar
  const getDoctorInitials = (doctor: Doctor) => {
    const firstName = doctor.user?.first_name || '';
    const lastName = doctor.user?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Doctor Management</CardTitle>
          <CardDescription>Review and manage doctor applications and accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setStatusFilter(value)}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList className="grid w-full md:w-auto grid-cols-4 bg-gray-100 p-1">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  All Doctors
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Approved
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search doctors..."
                    className="pl-8 border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] border-gray-200">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="cardiologist">Cardiologist</SelectItem>
                    <SelectItem value="neurologist">Neurologist</SelectItem>
                    <SelectItem value="dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="orthopedic">Orthopedic Surgeon</SelectItem>
                    <SelectItem value="pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                    <SelectItem value="gynecologist">Gynecologist</SelectItem>
                    <SelectItem value="endocrinologist">Endocrinologist</SelectItem>
                    <SelectItem value="ophthalmologist">Ophthalmologist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border border-gray-200">
              <div className="relative w-full overflow-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <table className="w-full caption-bottom text-sm">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200 text-left">
                        <th className="h-12 px-4 text-left font-medium text-gray-500">Name</th>
                        <th className="h-12 px-4 text-left font-medium text-gray-500 hidden md:table-cell">Specialty</th>
                        <th className="h-12 px-4 text-left font-medium text-gray-500 hidden lg:table-cell">
                          Registration Date
                        </th>
                        <th className="h-12 px-4 text-left font-medium text-gray-500">Status</th>
                        <th className="h-12 px-4 text-right font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.map((doctor) => (
                        <tr key={doctor.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-gray-200">
                                <AvatarImage src={doctor.avatar_url || ''} alt={getDoctorName(doctor)} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getDoctorInitials(doctor)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{getDoctorName(doctor)}</div>
                                <div className="text-xs text-muted-foreground">{doctor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">{doctor.specialization?.specialization || 'Not specified'}</td>
                          <td className="p-4 hidden lg:table-cell">
                            {doctor.created_at ? new Date(doctor.created_at).toLocaleDateString() : 'Unknown'}
                          </td>
                          <td className="p-4">{getStatusBadge(doctor.status)}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedDoctor(doctor)
                                  setViewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>

                              {doctor.status === "pending" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => {
                                      setSelectedDoctor(doctor)
                                      setApprovalDialogOpen(true)
                                    }}
                                  >
                                    <UserCheck className="h-4 w-4" />
                                    <span className="sr-only">Approve</span>
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedDoctor(doctor)
                                      setRejectionDialogOpen(true)
                                    }}
                                  >
                                    <UserX className="h-4 w-4" />
                                    <span className="sr-only">Reject</span>
                                  </Button>
                                </>
                              )}

                              <Button variant="ghost" size="icon">
                                <Mail className="h-4 w-4" />
                                <span className="sr-only">Email</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {!isLoading && filteredDoctors.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <UserCog className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">No doctors found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* View Doctor Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Doctor Details</DialogTitle>
            <DialogDescription>Detailed information about the doctor</DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 flex flex-col items-center">
                <Avatar className="h-32 w-32 border border-gray-200">
                  <AvatarImage src={selectedDoctor.avatar_url || ''} alt={getDoctorName(selectedDoctor)} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getDoctorInitials(selectedDoctor)}
                  </AvatarFallback>
                </Avatar>

                <div className="mt-4 text-center">
                  <h3 className="text-xl font-bold">{getDoctorName(selectedDoctor)}</h3>
                  <p className="text-muted-foreground">{selectedDoctor.specialty || 'Not specified'}</p>
                </div>

                {selectedDoctor.rating && (
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="ml-1 font-medium">{selectedDoctor.rating}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({selectedDoctor.reviews || 0} reviews)
                    </span>
                  </div>
                )}

                <div className="mt-4 w-full">{getStatusBadge(selectedDoctor.status)}</div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">About</h4>
                  <p className="mt-1">{selectedDoctor.about || 'No information provided'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="mt-1">{selectedDoctor.email || 'Not provided'}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Registration Date</h4>
                    <p className="mt-1">
                      {selectedDoctor.created_at 
                        ? new Date(selectedDoctor.created_at).toLocaleDateString() 
                        : 'Unknown'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Education</h4>
                    <p className="mt-1">{selectedDoctor.education || 'Not provided'}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Experience</h4>
                    <p className="mt-1">{selectedDoctor.experience || 'Not provided'}</p>
                  </div>
                </div>

                {selectedDoctor.certifications && selectedDoctor.certifications.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Certifications</h4>
                    <ul className="mt-1 list-disc list-inside">
                      {selectedDoctor.certifications.map((cert, index) => (
                        <li key={index} className="text-sm">
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedDoctor.status === 'rejected' && selectedDoctor.metadata?.rejection_reason && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Rejection Reason</h4>
                    <p className="mt-1 text-red-600">{selectedDoctor.metadata.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>

            {selectedDoctor && selectedDoctor.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => {
                    setViewDialogOpen(false)
                    setRejectionDialogOpen(true)
                  }}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setViewDialogOpen(false)
                    setApprovalDialogOpen(true)
                  }}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this doctor? They will be able to access the system and connect with
              patients.
            </DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="flex items-center gap-4 py-4">
              <Avatar className="h-12 w-12 border border-gray-200">
                <AvatarImage src={selectedDoctor.avatar_url || ''} alt={getDoctorName(selectedDoctor)} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getDoctorInitials(selectedDoctor)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{getDoctorName(selectedDoctor)}</h3>
                <p className="text-sm text-muted-foreground">{selectedDoctor.specialty || 'Not specified'}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedDoctor && handleApproveDoctor(selectedDoctor.id)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Doctor</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this doctor application.</DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="flex items-center gap-4 py-4">
              <Avatar className="h-12 w-12 border border-gray-200">
                <AvatarImage src={selectedDoctor.avatar_url || ''} alt={getDoctorName(selectedDoctor)} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getDoctorInitials(selectedDoctor)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{getDoctorName(selectedDoctor)}</h3>
                <p className="text-sm text-muted-foreground">{selectedDoctor.specialty || 'Not specified'}</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <textarea
                id="rejection-reason"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedDoctor && handleRejectDoctor(selectedDoctor.id)}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

