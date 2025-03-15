"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserPlus, Star, CheckCircle, Loader2 } from "lucide-react"
import { supabase } from "@/utils/supabase"
import { useAuth } from "@/utils/auth"

// Define the Doctor type based on the database schema
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
  image?: string; // This might come from a user profile or be a placeholder
}

// Common medical conditions for the checklist
const commonMedicalConditions = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Arthritis",
  "Lower Back Pain",
  "Migraine",
  "Anxiety",
  "Depression",
  "Allergies",
  "Heart Disease",
]

interface DoctorConnectionFormProps {
  onSubmit?: (data: any) => void
}

export function DoctorConnectionForm({ onSubmit }: DoctorConnectionFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: "James Johnson",
    email: "james.johnson@example.com",
    gender: "Male",
    age: 45,
    image: "/placeholder.svg?height=100&width=100",
    requestDate: new Date().toISOString().split("T")[0],
    reason: "Need consultation for lower back pain",
    medicalConditions: ["Lower Back Pain"],
    status: "pending",
    selectedDoctor: "",
  })

  // UI state
  const [selectedConditions, setSelectedConditions] = useState<string[]>(["Lower Back Pain"])
  const [otherCondition, setOtherCondition] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch doctors from Supabase
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('doctor')
          .select('*')
          .eq('status', 'approved') // Only fetch approved doctors
        
        if (error) {
          console.error("Error fetching doctors:", error)
          return
        }
        
        // Add a default image for doctors without one
        const doctorsWithImages = data.map(doctor => ({
          ...doctor,
          image: "/placeholder.svg?height=100&width=100" // Default placeholder image
        }))
        
        setDoctors(doctorsWithImages)
      } catch (error) {
        console.error("Error fetching doctors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle checkbox changes for medical conditions
  const handleConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions([...selectedConditions, condition])
    } else {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition))
    }
  }

  // Add other condition
  const handleAddOtherCondition = () => {
    if (otherCondition.trim() && !selectedConditions.includes(otherCondition.trim())) {
      setSelectedConditions([...selectedConditions, otherCondition.trim()])
      setOtherCondition("")
    }
  }

  // Update formData when selectedConditions changes
  useEffect(() => {
    setFormData({
      ...formData,
      medicalConditions: selectedConditions,
    })
  }, [selectedConditions])

  // Handle doctor selection
  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId)
    setSelectedDoctor(doctor || null)
    setFormData({
      ...formData,
      selectedDoctor: doctorId,
    })
  }

  const handleConnect = async () => {
    if (!user?.id || !selectedDoctor) {
      console.error("Missing user ID or selected doctor")
      return
    }

    try {
      // Get patient data
      const { data: patient, error: patientError } = await supabase
        .from('patient')
        .select("*")
        .eq('user_id', user.id)
        .single()
      
      if (patientError) {
        console.error("Error fetching patient data:", patientError)
        return
      }
      
      // Create connection record
      const connectionData = { 
        doctor_id: selectedDoctor.id,
        patient_id: patient.user_id, // Use the patient's ID, not user_id
        status: "pending",
        reason: formData.reason,
        medical_conditions: formData.medicalConditions.join(","),
        created_at: formData.requestDate,
        age: formData.age,
      }
      
      const { error: connectionError } = await supabase
        .from('connection')
        .insert([connectionData])
      
      if (connectionError) {
        console.error("Error creating connection:", connectionError)
        return
      }
      
      // Show success dialog
      setSuccessDialogOpen(true)
    } catch (error) {
      console.error("Error in connection process:", error)
    }
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.selectedDoctor) {
      alert("Please select a doctor")
      return
    }

    if (!formData.reason) {
      alert("Please provide a reason for consultation")
      return
    }

    if (selectedConditions.length === 0) {
      alert("Please select at least one medical condition")
      return
    }

    // Submit form data
    console.log("Form submitted:", formData)
    if (onSubmit) {
      onSubmit(formData)
    }

    // Create connection in database
    handleConnect()
  }
  
  // Function to display doctor availability
  const getDoctorAvailability = (doctor: Doctor) => {
    // This is a placeholder - in a real app, you might fetch this from a schedule table
    const availabilities = ["Available Today", "Next Available: Tomorrow", "Next Available: Friday", "Next Available: Monday"]
    // Use doctor.id to generate a consistent but pseudo-random index
    const index = parseInt(doctor.id.substring(0, 8), 16) % availabilities.length
    return availabilities[index]
  }
  
  // Function to format reviews count
  const formatReviewsCount = (reviews: string | null) => {
    if (!reviews) return "0"
    // If reviews is a number stored as string, parse it
    // If it's a JSON string of review objects, you could count them
    try {
      const reviewsData = JSON.parse(reviews)
      return Array.isArray(reviewsData) ? reviewsData.length.toString() : "0"
    } catch {
      return reviews // If it's already a count as string
    }
  }
  
  return (
    <>
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Connect with a Doctor
          </CardTitle>
          <CardDescription>Request a consultation with one of our specialists</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Doctor Selection Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Select a Doctor</h3>
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading doctors...</span>
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No doctors available at the moment. Please check back later.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedDoctor?.id === doctor.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                        onClick={() => handleDoctorSelect(doctor.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border border-gray-200">
                            <AvatarImage src={doctor.image} alt={doctor.name || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {doctor.name
                                ? doctor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                : "DR"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{doctor.name || "Unknown Doctor"}</div>
                            <div className="text-sm text-muted-foreground">{doctor.speciality || "General Practitioner"}</div>
                            <div className="flex items-center mt-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs ml-1">
                                {doctor.rating || "N/A"} ({formatReviewsCount(doctor.reviews)} reviews)
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{getDoctorAvailability(doctor)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consultation Reason Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Reason for Consultation</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Describe your health concern</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      placeholder="Please describe your symptoms and health concerns..."
                      className="min-h-[100px]"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Medical Conditions</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {commonMedicalConditions.map((condition) => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={`condition-${condition}`}
                            checked={selectedConditions.includes(condition)}
                            onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
                          />
                          <label
                            htmlFor={`condition-${condition}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {condition}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-end gap-2 mt-2">
                      <div className="flex-1">
                        <Label htmlFor="otherCondition">Other condition</Label>
                        <Input
                          id="otherCondition"
                          value={otherCondition}
                          onChange={(e) => setOtherCondition(e.target.value)}
                          placeholder="Enter other condition"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddOtherCondition}
                        disabled={!otherCondition.trim()}
                      >
                        Add
                      </Button>
                    </div>

                    {selectedConditions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedConditions.map((condition) => (
                          <Badge
                            key={condition}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1"
                          >
                            {condition}
                            <button
                              type="button"
                              className="ml-1 rounded-full h-4 w-4 inline-flex items-center justify-center text-blue-700 hover:bg-blue-200"
                              onClick={() => handleConditionChange(condition, false)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <CardFooter className="flex justify-end pt-6 px-0">
              <Button type="submit" disabled={loading || doctors.length === 0}>
                <UserPlus className="mr-2 h-4 w-4" />
                Request Connection
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Connection Request Sent
            </DialogTitle>
            <DialogDescription>Your request has been sent successfully</DialogDescription>
          </DialogHeader>

          {selectedDoctor && (
            <div className="flex items-center gap-4 py-4">
              <Avatar className="h-12 w-12 border border-gray-200">
                <AvatarImage src={selectedDoctor.image} alt={selectedDoctor.name || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedDoctor.name
                    ? selectedDoctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "DR"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{selectedDoctor.name || "Doctor"}</h3>
                <p className="text-sm text-muted-foreground">{selectedDoctor.speciality || "Specialist"}</p>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              We've sent your connection request to the doctor. You'll receive a notification once they accept your
              request.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setSuccessDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
