"use client"

import { useState } from "react"
import { format } from "date-fns"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import { toast } from "@/components/ui/use-toast" // Assuming you have a toast component
import { supabase } from "@/utils/supabase"

// Define the form schema
const appointmentFormSchema = z.object({
  reason: z.string().min(5, { message: "Reason must be at least 5 characters" }),
  appointmentType: z.string({ required_error: "Please select an appointment type" }),
  description: z.string().optional(),
  isFirstVisit: z.boolean().default(false),
  hasInsurance: z.boolean().default(false),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
})

// Make insurance fields required if hasInsurance is true
const formSchema = appointmentFormSchema.refine(
  (data) => {
    if (data.hasInsurance) {
      return !!data.insuranceProvider && !!data.insuranceNumber
    }
    return true
  },
  {
    message: "Insurance provider and number are required when you have insurance",
    path: ["insuranceProvider"],
  },
)

interface AppointmentFormProps {
  doctorId: string
  date: Date
  timeSlot: string
  onSubmit: (data: z.infer<typeof formSchema>) => void
  onBack: () => void
}

export function AppointmentForm({ doctorId, date, timeSlot, onSubmit, onBack }: AppointmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      appointmentType: "",
      description: "",
      isFirstVisit: false,
      hasInsurance: false,
      insuranceProvider: "",
      insuranceNumber: "",
    },
  })

  const hasInsurance = form.watch("hasInsurance")

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      // Get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData.user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to schedule an appointment",
          variant: "destructive",
        })
        return
      }

      // Format the date and time for the database
      const appointmentDateTime = new Date(date)
      const [hours, minutes] = timeSlot.split(':')
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      // Create the appointment record in Supabase
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointment')
        .insert({
          patient_id: userData.user.id,
          user_id: userData.user.id,
          doctor_id: doctorId,
          appointment_date: appointmentDateTime.toISOString(),
          reason: data.reason,
          type: data.appointmentType,
          notes: data.description || null,
          is_first_visit: data.isFirstVisit,
          has_insurance: data.hasInsurance,
          insurance_provider: data.hasInsurance ? data.insuranceProvider : null,
          insurance_number: data.hasInsurance ? data.insuranceNumber : null,
          status: 'scheduled', // Default status
          created_at: new Date().toISOString(),
        })
        .select()

      if (appointmentError) {
        console.error("Error creating appointment:", appointmentError)
        toast({
          title: "Error",
          description: "Failed to schedule appointment. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Call the original onSubmit function with the form data
      await onSubmit(data)
      
      toast({
        title: "Success",
        description: "Your appointment has been scheduled successfully!",
      })
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Complete the form to schedule your appointment</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">{format(date, "MMMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground">{timeSlot}</p>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="appointmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Follow up">Follow-up</SelectItem>
                      <SelectItem value="Check up">Regular Check-up</SelectItem>
                      <SelectItem value="Urgent">Urgent Care</SelectItem>
                      <SelectItem value="Specialist">Specialist Referral</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Visit</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief reason for your appointment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide any additional information about your symptoms or concerns"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This information helps the doctor prepare for your appointment</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFirstVisit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>First Visit</FormLabel>
                    <FormDescription>Is this your first appointment with this doctor?</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasInsurance"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Health Insurance</FormLabel>
                    <FormDescription>
                      Do you have health insurance you'd like to use for this appointment?
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {hasInsurance && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Blue Cross Blue Shield" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Policy Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your policy number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <CardFooter className="px-0 pt-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button variant="outline" type="button" onClick={onBack} className="sm:flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="sm:flex-1">
                  {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
