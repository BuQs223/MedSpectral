import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentList } from "@/app/components/scheduling/appointment-list"
import { DoctorAvailabilityManager } from "@/app/components/scheduling/doctor-availability-manager"

export default function DoctorSchedulingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Appointment Management</h1>

      <Tabs defaultValue="appointments" className="w-full">
        

        <TabsContent value="appointments" className="mt-0">
          <AppointmentList isDoctor={true} />
        </TabsContent>

        <TabsContent value="availability" className="mt-0">
          <DoctorAvailabilityManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

