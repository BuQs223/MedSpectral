import DoctorDashboard from "@/app/components/doctor/DoctorDashboard"
import { Suspense } from "react"

export default function DoctorPage() {
  return <Suspense fallback={<div>Loading...</div>}>
    <DoctorDashboard />
  </Suspense>
}

