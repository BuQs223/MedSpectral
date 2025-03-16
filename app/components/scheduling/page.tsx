import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarView } from "@/app/components/scheduling/calendar-view"
import { AppointmentList } from "@/app/components/scheduling/appointment-list"
import { DoctorAvailabilityManager } from "@/app/components/scheduling/doctor-availability-manager"

export default function SchedulingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Appointment Scheduling</h1>

      <Tabs defaultValue="book" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="book">Book Appointment</TabsTrigger>
          <TabsTrigger value="manage">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="mt-0">
          <CalendarView />
        </TabsContent>

        <TabsContent value="manage" className="mt-0">
          <AppointmentList />
        </TabsContent>

        <TabsContent value="availability" className="mt-0">
          <DoctorAvailabilityManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

