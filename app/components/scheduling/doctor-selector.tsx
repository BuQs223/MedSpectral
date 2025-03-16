"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client - you'll need to add your Supabase URL and anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

interface Doctor {
  id: string;
  user_id: string | null;
  specialization_id: string | null;
  hospital: string | null;
  status: string | null;
  rating: number | null;
  reviews: string | null;
  speciality: string | null;
  name: string | null;
  image?: string;
}

interface DoctorSelectorProps {
  onSelectDoctor: (doctorId: string) => void
  selectedDoctorId?: string
}

export function DoctorSelector({ onSelectDoctor, selectedDoctorId }: DoctorSelectorProps) {
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch doctors from Supabase
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('doctor')
          .select('*')
          .eq('status', 'approved') // Only fetch approved doctors
        
        if (error) {
          console.error("Error fetching doctors:", error)
          toast({
            title: "Error",
            description: "Failed to load doctors. Please try again.",
            variant: "destructive",
          })
          return
        }
        
        // Add a default image for doctors without one
        const doctorsWithImages = data.map(doctor => ({
          ...doctor,
          image: doctor.image || "/placeholder.svg?height=100&width=100" // Default placeholder image
        }))
        
        console.log(data)
        setDoctors(doctorsWithImages)
        setFilteredDoctors(doctorsWithImages)
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast({
          title: "Error",
          description: "Failed to load doctors. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [toast])

  // Filter doctors based on search term and specialty
  useEffect(() => {
    let filtered = [...doctors]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (doctor) =>
          (doctor.name && doctor.name.toLowerCase().includes(term)) ||
          (doctor.speciality && doctor.speciality.toLowerCase().includes(term)) ||
          (doctor.hospital && doctor.hospital.toLowerCase().includes(term))
      )
    }

    if (specialtyFilter) {
      filtered = filtered.filter((doctor) => doctor.speciality === specialtyFilter)
    }

    setFilteredDoctors(filtered)
  }, [doctors, searchTerm, specialtyFilter])

  // Get unique specialties for filtering
  const specialties = Array.from(
    new Set(
      doctors
        .map((doctor) => doctor.speciality)
        .filter((specialty): specialty is string => specialty !== null)
    )
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by doctor name, specialty, or hospital..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={specialtyFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSpecialtyFilter(null)}
          >
            All
          </Button>
          {specialties.map((specialty) => (
            <Button
              key={specialty}
              variant={specialtyFilter === specialty ? "default" : "outline"}
              size="sm"
              onClick={() => setSpecialtyFilter(specialty)}
            >
              {specialty}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-grow">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="space-y-4">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className={`transition-all ${
                selectedDoctorId === doctor.id
                  ? "border-primary ring-1 ring-primary"
                  : "hover:border-primary/50"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={doctor.image} alt={doctor.name || ""} />
                    <AvatarFallback>
                      {doctor.name
                        ? doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "DR"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 flex-grow">
                    <div>
                      <h3 className="font-medium text-lg">{doctor.name || "Unknown Doctor"}</h3>
                      <p className="text-muted-foreground">{doctor.speciality || "General"}</p>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {doctor.hospital || "Not specified"}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                      <span>
                        {doctor.rating || "N/A"} ({doctor.reviews || "0"} reviews)
                      </span>
                    </div>
                  </div>
                  <Button
                    className="mt-4 sm:mt-0"
                    onClick={() => onSelectDoctor(doctor.id)}
                    variant={selectedDoctorId === doctor.id ? "default" : "outline"}
                  >
                    {selectedDoctorId === doctor.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900">No doctors found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters to find available doctors
          </p>
        </div>
      )}
    </div>
  )
}
