"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, Clock, User, FileText, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface AppointmentConfirmationProps {
  appointmentData: {
    doctorId: string
    doctorName: string
    date: Date
    timeSlot: string
    reason: string
    appointmentType: string
    description?: string
    isFirstVisit: boolean
    hasInsurance: boolean
    insuranceProvider?: string
    insuranceNumber?: string
  }
  onConfirm: () => void
  onEdit: () => void
  onCancel: () => void
}

export function AppointmentConfirmation({
  appointmentData,
  onConfirm,
  onEdit,
  onCancel,
}: AppointmentConfirmationProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      // In a real app, this would be an API call to confirm the appointment
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Appointment Confirmed",
        description: `Your appointment with ${appointmentData.doctorName} has been scheduled for ${format(appointmentData.date, "MMMM d, yyyy")} at ${appointmentData.timeSlot}.`,
      })

      onConfirm()
    } catch (error) {
      console.error("Error confirming appointment:", error)
      toast({
        title: "Error",
        description: "Failed to confirm appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          Appointment Summary
        </CardTitle>
        <CardDescription>Please review your appointment details before confirming</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{format(appointmentData.date, "MMMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{appointmentData.timeSlot}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Doctor</p>
              <p className="text-muted-foreground">{appointmentData.doctorName}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-medium flex items-center">
              <FileText className="h-5 w-5 text-primary mr-2" /> Appointment Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appointment Type</p>
                <p>{appointmentData.appointmentType}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">First Visit</p>
                <p>{appointmentData.isFirstVisit ? "Yes" : "No"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Reason for Visit</p>
              <p>{appointmentData.reason}</p>
            </div>

            {appointmentData.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Additional Details</p>
                <p className="text-sm">{appointmentData.description}</p>
              </div>
            )}
          </div>

          {appointmentData.hasInsurance && (
            <>
              <Separator />

              <div className="space-y-3">
                <h3 className="font-medium">Insurance Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Provider</p>
                    <p>{appointmentData.insuranceProvider}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Policy Number</p>
                    <p>{appointmentData.insuranceNumber}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Important Information</p>
            <p className="text-sm text-amber-700">
              Please arrive 15 minutes before your scheduled appointment time. Bring your ID, insurance card (if
              applicable), and a list of current medications.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onCancel} className="sm:flex-1">
          Cancel
        </Button>
        <Button variant="outline" onClick={onEdit} className="sm:flex-1">
          Edit Details
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={cn("sm:flex-1", isSubmitting && "opacity-80")}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
              Confirming...
            </>
          ) : (
            "Confirm Appointment"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

