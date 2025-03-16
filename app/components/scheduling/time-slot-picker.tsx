"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimeSlotPickerProps {
  timeSlots: { time: string; available: boolean }[]
  selectedTimeSlot: string | null
  onSelectTimeSlot: (time: string) => void
}

export function TimeSlotPicker({ timeSlots, selectedTimeSlot, onSelectTimeSlot }: TimeSlotPickerProps) {
  // Group time slots by morning and afternoon
  const morningSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0])
    const isPM = slot.time.includes("PM")
    return (!isPM || hour === 12) && hour < 12
  })

  const afternoonSlots = timeSlots.filter((slot) => {
    const hour = Number.parseInt(slot.time.split(":")[0])
    const isPM = slot.time.includes("PM")
    return (isPM && hour !== 12) || hour >= 12
  })

  if (timeSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No time slots available for this date</p>
        <p className="text-sm text-muted-foreground mt-1">Please select another date</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {morningSlots.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Morning</h3>
          <div className="grid grid-cols-3 gap-2">
            {morningSlots.map((slot) => (
              <Button
                key={slot.time}
                variant="outline"
                size="sm"
                className={cn(
                  "h-10",
                  slot.available ? "hover:border-primary hover:text-primary" : "opacity-50 cursor-not-allowed",
                  selectedTimeSlot === slot.time && "border-primary bg-primary/10 text-primary",
                )}
                disabled={!slot.available}
                onClick={() => slot.available && onSelectTimeSlot(slot.time)}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      )}

      {afternoonSlots.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Afternoon</h3>
          <div className="grid grid-cols-3 gap-2">
            {afternoonSlots.map((slot) => (
              <Button
                key={slot.time}
                variant="outline"
                size="sm"
                className={cn(
                  "h-10",
                  slot.available ? "hover:border-primary hover:text-primary" : "opacity-50 cursor-not-allowed",
                  selectedTimeSlot === slot.time && "border-primary bg-primary/10 text-primary",
                )}
                disabled={!slot.available}
                onClick={() => slot.available && onSelectTimeSlot(slot.time)}
              >
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

