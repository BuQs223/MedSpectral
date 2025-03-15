"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import AdminDashboard from "../components/admin/AdminDashboard"
import { useAuth } from "@/utils/auth"
import { supabase } from "@/utils/supabase"
import DoctorDashboard from "../components/doctor/DoctorDashboard"
import PatientDashboard from "../components/components/PatientDashboard"

// Define the shape of your user data
interface UserData {
  id: string;
  email?: string;
  name?: string;
  role: string; // The field we're checking
  // Add other fields from your user table as needed
}

export default function Dashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoadingRole, setIsLoadingRole] = useState(true)
  console.log(user)
  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    // Fetch user role data when authenticated user is available
    const fetchUserData = async () => {
      if (user) {
        try {
          
          const { data, error } = await supabase
            .from('user')
            .select("*")
            .eq("supabase_id", user.id)
            .single()

          if (error) {
            console.error("Error fetching user data:", error)
            return
          }

          if (data) {
            console.log("User data from DB:", data)
            setUserData(data as UserData) // Type assertion here
          }
        } catch (error) {
          console.error("Error in fetchUserData:", error)
        } finally {
          setIsLoadingRole(false)
        }
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user, isLoading, router])

  // Show loading state while checking auth or fetching role
  if (isLoading || (user && isLoadingRole)) {
    return <div>Loading...</div>
  }

  // If we have a user, render the appropriate dashboard based on role
  if (user && userData) {
    console.log("Dashboard user:", user)
    console.log("User data:", userData)
    
    // Render the appropriate dashboard based on the user's role
    if (userData.role === "doctor") {
      return <DoctorDashboard />
    } else {
      // Default to PatientDashboard for regular users
      return <PatientDashboard />
    }
  }

  // This return is only shown briefly before the redirect happens
  return null
}