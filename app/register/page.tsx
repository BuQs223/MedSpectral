"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon, ChevronRight, ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/utils/supabase"
import Header from "../components/Header"


export default function SignupPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Common fields
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "patient",
    phone: "",

    // Patient specific fields
    dateOfBirth: "",
    gender: "",
    city: "",
    country: "",
    address: "",
    bloodType: "",
    allergies: "",
    vaccinations: "",
    medicalConditions: "",

    // Doctor specific fields
    speciality: "",
    hospital: "",
    status: "active",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userType: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    if (step === 1) {
      // Validate first step
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }
  
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure your passwords match.",
          variant: "destructive",
        })
        return
      }
    }
    
    // For step 2, we don't need to validate blood type yet since the user 
    // will select it in step 3
    
    setStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setStep((prev) => prev - 1)
  }

  // Add validation function for the final step
  const validateFinalStep = () => {
    if (formData.userType === "patient") {
      // For patients, validate critical medical information
      if (!formData.bloodType) {
        toast({
          title: "Missing information",
          description: "Please select your blood type.",
          variant: "destructive",
        })
        return false
      }
      // You can add more validation for other fields as needed
    } else if (formData.userType === "doctor") {
      // For doctors, validate professional information
      if (!formData.speciality) {
        toast({
          title: "Missing information",
          description: "Please select your speciality.",
          variant: "destructive",
        })
        return false
      }
      if (!formData.hospital) {
        toast({
          title: "Missing information",
          description: "Please enter your hospital/clinic.",
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  // Update the handleSubmit function to validate before submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted"); // Debug log

    // Validate final step before submission
    if (!validateFinalStep()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log("Creating auth user..."); // Debug log
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.userType
          }
        }
      });

      if (authError) {
        console.error("Auth error:", authError); // Debug log
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      console.log("Auth user created:", authData.user.id); // Debug log

      // Create user profile
      const { error: profileError } = await supabase
        .from('user')
        .insert([
          {
            supabase_id: authData.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: formData.userType,
            gender: formData.gender,
            city: formData.city,
            country: formData.country,
            address: formData.address,
          }
        ]);

      if (profileError) {
        console.error("Profile error:", profileError); // Debug log
        throw profileError;
      }

      // Create type-specific profile
      if (formData.userType === 'patient') {
        const { error: patientError } = await supabase
          .from('patient')
          .insert([
            {
              user_id: authData.user.id,
              blood_type: formData.bloodType,
              allergies: formData.allergies,
              vaccinations: formData.vaccinations,
              medical_conditions: formData.medicalConditions,
              address: formData.address,
              phone: formData.phone,
            }
          ]);

        if (patientError) {
          console.error("Patient error:", patientError); // Debug log
          throw patientError;
        }
      } else {
        const { error: doctorError } = await supabase
          .from('doctor')
          .insert([
            {
              user_id: authData.user.id,
              speciality: formData.speciality,
              hospital: formData.hospital,
              status: formData.status,
            }
          ]);

        if (doctorError) {
          console.error("Doctor error:", doctorError); // Debug log
          throw doctorError;
        }
      }

      toast({
        title: "Account created successfully",
        description: "Welcome to MedSpectra!",
      });
      router.push('/login')
      // Sign in the user
      

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error creating account",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };  

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"]
  const specialities = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Obstetrics",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Urology",
  ]

  return (
    <div>
      <Header/>
    <div className="min-h-screen flex items-center justify-center py-2 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <motion.div
        className="absolute top-20 right-0 w-72 h-72 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-20 w-64 h-64 bg-teal-200/30 dark:bg-teal-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="w-full max-w-2xl z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
         
          <motion.h2
            className="mt-6 text-3xl font-bold text-slate-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Create your account
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-slate-600 dark:text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Join MedSpectra Connect to streamline your healthcare experience
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="border-blue-100 dark:border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Sign Up {step > 1 && `- Step ${step} of ${formData.userType === "patient" ? 3 : 2}`}
                </CardTitle>
                <div className="flex space-x-2">
                  {[1, 2, formData.userType === "patient" ? 3 : null].filter(Boolean).map((stepNumber) => (
                    <div
                      key={stepNumber as number}
                      className={`w-3 h-3 rounded-full ${step >= (stepNumber as number) ? "bg-blue-600" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              </div>
              <CardDescription>
                {step === 1 && "Enter your basic information to create an account"}
                {step === 2 && formData.userType === "patient" && "Tell us about yourself"}
                {step === 3 && formData.userType === "patient" && "Medical information"}
                {step === 2 && formData.userType === "doctor" && "Professional information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label>I am a</Label>
                        <RadioGroup
                          value={formData.userType}
                          onValueChange={handleUserTypeChange}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="patient" id="patient" />
                            <Label htmlFor="patient" className="cursor-pointer">
                              Patient
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="doctor" id="doctor" />
                            <Label htmlFor="doctor" className="cursor-pointer">
                              Medical Professional
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <UserIcon className="h-5 w-5 text-slate-400" />
                            </div>
                            <Input
                              id="firstName"
                              name="firstName"
                              placeholder="John"
                              value={formData.firstName}
                              onChange={handleChange}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MailIcon className="h-5 w-5 text-slate-400" />
                          </div>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <LockIcon className="h-5 w-5 text-slate-400" />
                          </div>
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-5 w-5 text-slate-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <LockIcon className="h-5 w-5 text-slate-400" />
                          </div>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="pl-10"
                            required
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOffIcon className="h-5 w-5 text-slate-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && formData.userType === "patient" && (
                    <motion.div
                      key="step2-patient"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => handleSelectChange("gender", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              {genderOptions.map((option) => (
                                <SelectItem key={option} value={option.toLowerCase()}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            placeholder="New York"
                            value={formData.city}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            name="country"
                            placeholder="United States"
                            value={formData.country}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          name="address"
                          placeholder="123 Main St, Apt 4B"
                          value={formData.address}
                          onChange={handleChange}
                          rows={2}
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && formData.userType === "patient" && (
                    <motion.div
                      key="step3-patient"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select
                          value={formData.bloodType}
                          onValueChange={(value) => handleSelectChange("bloodType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            {bloodTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="allergies">Allergies</Label>
                        <Textarea
                          id="allergies"
                          name="allergies"
                          placeholder="List any allergies you have (e.g., penicillin, peanuts)"
                          value={formData.allergies}
                          onChange={handleChange}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vaccinations">Vaccinations</Label>
                        <Textarea
                          id="vaccinations"
                          name="vaccinations"
                          placeholder="List your recent vaccinations"
                          value={formData.vaccinations}
                          onChange={handleChange}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="medicalConditions">Medical Conditions</Label>
                        <Textarea
                          id="medicalConditions"
                          name="medicalConditions"
                          placeholder="List any medical conditions you have"
                          value={formData.medicalConditions}
                          onChange={handleChange}
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="terms" />
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
                        >
                          I consent to sharing my medical information in accordance with HIPAA regulations
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && formData.userType === "doctor" && (
                    <motion.div
                      key="step2-doctor"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="speciality">Speciality</Label>
                        <Select
                          value={formData.speciality}
                          onValueChange={(value) => handleSelectChange("speciality", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your speciality" />
                          </SelectTrigger>
                          <SelectContent>
                            {specialities.map((speciality) => (
                              <SelectItem key={speciality} value={speciality.toLowerCase()}>
                                {speciality}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hospital">Hospital/Clinic</Label>
                        <Input
                          id="hospital"
                          name="hospital"
                          placeholder="Mayo Clinic"
                          value={formData.hospital}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on-leave">On Leave</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="credentials" />
                        <label
                          htmlFor="credentials"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
                        >
                          I confirm that my medical credentials are valid and up-to-date
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between pt-4">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep} className="flex items-center">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}

                  {(step < 3 && formData.userType === "patient") || (step < 2 && formData.userType === "doctor") ? (
                    <Button type="button" onClick={nextStep} className="ml-auto flex items-center">
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" className="ml-auto bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              
              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
    </div>
  )
}

