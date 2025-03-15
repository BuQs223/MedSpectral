"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search } from "lucide-react"
import { useAuth } from "@/utils/auth"
import { supabase } from "@/utils/supabase"
import { stat } from "fs"
import { fetchDoctors } from "@/app/utils/doctors"

// Mock data for doctors
const doctorsData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=100&width=100",
    availability: "Available Today",
    status: "none" as "none" | "pending" | "accepted" | "denied",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    rating: 4.9,
    reviews: 89,
    image: "/placeholder.svg?height=100&width=100",
    availability: "Next Available: Tomorrow",
    status: "pending" as "none" | "pending" | "accepted" | "denied",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatologist",
    rating: 4.7,
    reviews: 156,
    image: "/placeholder.svg?height=100&width=100",
    availability: "Available Today",
    status: "accepted" as "none" | "pending" | "accepted" | "denied",
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Orthopedic Surgeon",
    rating: 4.6,
    reviews: 112,
    image: "/placeholder.svg?height=100&width=100",
    availability: "Next Available: Friday",
    status: "denied" as "none" | "pending" | "accepted" | "denied",
  },
  {
    id: 5,
    name: "Dr. Olivia Thompson",
    specialty: "Pediatrician",
    rating: 4.9,
    reviews: 203,
    image: "/placeholder.svg?height=100&width=100",
    availability: "Available Today",
    status: "none" as "none" | "pending" | "accepted" | "denied",
  },
  {
    id: 6,
    name: "Dr. Robert Kim",
    specialty: "Psychiatrist",
    rating: 4.8,
    reviews: 78,
    image: "/placeholder.svg?height=100&width=100",
    availability: "Next Available: Monday",
    status: "none" as "none" | "pending" | "accepted" | "denied",
  },
]
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
  name?: string;
}
export function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [specialty, setSpecialty] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  
  const { user } = useAuth()
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
  const handleConnect = async (id: string) => {

    let { data: patient, error } = await supabase
    .from('patient')
    .select("*")
    .eq('user_id', user?.id);
  
  console.log("Patient Data:", patient); // Debugging step
  
  // Ensure that the patient exists and extract the id
  const patientId = patient && patient.length > 0 ? patient[0].id : null;
  
  const userData = { 
    doctor_id: id,
    patient_id: patientId, // Assign the extracted patient ID
    status: "pending",
  };
  
  console.log("User Data:", userData); // Debugging step
    
    const { error: profileError } = await supabase
      .from('connection')
      .insert([userData])
      .select();
    console.log(profileError)

  }

  const filteredDoctors = doctors;

  const getStatusBadge = (status: string = 'pending') => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Accepted
          </Badge>
        )
      case "denied":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Denied
          </Badge>
        )
      default:
        return null
    }
  }

  const getConnectButton = (doctor: (typeof doctors)[0]) => {
    switch (doctor.status) {
      case "pending":
        return <Button disabled>Request Sent</Button>
      case "accepted":
        return <Button variant="outline">Message</Button>
      case "denied":
        return (
          <Button variant="outline" onClick={() => handleConnect(doctor.id)}>
            Try Again
          </Button>
        )
      default:
        return <Button onClick={() => handleConnect(doctor.id)}>Connect</Button>
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search doctors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="specialty" className="whitespace-nowrap">
            Filter by:
          </Label>
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger id="specialty" className="w-full md:w-[180px]">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="cardiologist">Cardiologist</SelectItem>
              <SelectItem value="neurologist">Neurologist</SelectItem>
              <SelectItem value="dermatologist">Dermatologist</SelectItem>
              <SelectItem value="orthopedic surgeon">Orthopedic Surgeon</SelectItem>
              <SelectItem value="pediatrician">Pediatrician</SelectItem>
              <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12 border border-gray-200">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {doctor.user?.first_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "DR"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{doctor.user?.first_name}</CardTitle>
                    <CardDescription>{doctor.specialization?.name}</CardDescription>
                  </div>
                </div>
                {getStatusBadge("pending")}
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center space-x-1 text-sm">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium">{5}</span>
                <span className="text-muted-foreground">({40} reviews)</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{"Disponibil"}</p>
            </CardContent>
            <CardFooter>{getConnectButton(doctor)}</CardFooter>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">No doctors found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}

