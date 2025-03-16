"use client"

import { useState, useEffect } from "react"
import { format, addDays, parseISO } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Clock, Save, Plus, Trash2, Copy, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TimeSlot {
  start: string
  end: string
}

interface DaySchedule {
  enabled: boolean
  timeSlots: TimeSlot[]
}

interface WeeklySchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

interface DateOverride {
  date: string
  available: boolean
  timeSlots: TimeSlot[]
}

export function DoctorAvailabilityManager() {
  const { toast } = useToast()
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
    tuesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
    wednesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
    thursday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
    friday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
    saturday: { enabled: false, timeSlots: [] },
    sunday: { enabled: false, timeSlots: [] },
  })

  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [currentDateOverride, setCurrentDateOverride] = useState<DateOverride | null>(null)
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false)
  const [templateStartDate, setTemplateStartDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [templateEndDate, setTemplateEndDate] = useState<Date | undefined>(addDays(new Date(), 14))
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Initialize date override when a date is selected
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd")
      const existingOverride = dateOverrides.find((override) => override.date === dateString)

      if (existingOverride) {
        setCurrentDateOverride(existingOverride)
      } else {
        // Get the day of week
        const dayOfWeek = format(selectedDate, "EEEE").toLowerCase() as keyof WeeklySchedule

        // Use the weekly schedule as a template
        setCurrentDateOverride({
          date: dateString,
          available: weeklySchedule[dayOfWeek].enabled,
          timeSlots: [...weeklySchedule[dayOfWeek].timeSlots],
        })
      }
    }
  }, [selectedDate, dateOverrides, weeklySchedule])

  const handleDayToggle = (day: keyof WeeklySchedule, enabled: boolean) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
      },
    }))
  }

  const handleAddTimeSlot = (day: keyof WeeklySchedule) => {
    setWeeklySchedule((prev) => {
      const updatedDay = { ...prev[day] }
      updatedDay.timeSlots = [...updatedDay.timeSlots, { start: "09:00", end: "17:00" }]
      return {
        ...prev,
        [day]: updatedDay,
      }
    })
  }

  const handleRemoveTimeSlot = (day: keyof WeeklySchedule, index: number) => {
    setWeeklySchedule((prev) => {
      const updatedDay = { ...prev[day] }
      updatedDay.timeSlots = updatedDay.timeSlots.filter((_, i) => i !== index)
      return {
        ...prev,
        [day]: updatedDay,
      }
    })
  }

  const handleTimeSlotChange = (day: keyof WeeklySchedule, index: number, field: "start" | "end", value: string) => {
    setWeeklySchedule((prev) => {
      const updatedDay = { ...prev[day] }
      updatedDay.timeSlots = updatedDay.timeSlots.map((slot, i) => {
        if (i === index) {
          return { ...slot, [field]: value }
        }
        return slot
      })
      return {
        ...prev,
        [day]: updatedDay,
      }
    })
  }

  const handleEditDate = () => {
    if (!selectedDate || !currentDateOverride) return
    setIsEditingDate(true)
  }

  const handleDateOverrideToggle = (available: boolean) => {
    if (!currentDateOverride) return
    setCurrentDateOverride({
      ...currentDateOverride,
      available,
    })
  }

  const handleAddDateTimeSlot = () => {
    if (!currentDateOverride) return
    setCurrentDateOverride({
      ...currentDateOverride,
      timeSlots: [...currentDateOverride.timeSlots, { start: "09:00", end: "17:00" }],
    })
  }

  const handleRemoveDateTimeSlot = (index: number) => {
    if (!currentDateOverride) return
    setCurrentDateOverride({
      ...currentDateOverride,
      timeSlots: currentDateOverride.timeSlots.filter((_, i) => i !== index),
    })
  }

  const handleDateTimeSlotChange = (index: number, field: "start" | "end", value: string) => {
    if (!currentDateOverride) return
    setCurrentDateOverride({
      ...currentDateOverride,
      timeSlots: currentDateOverride.timeSlots.map((slot, i) => {
        if (i === index) {
          return { ...slot, [field]: value }
        }
        return slot
      }),
    })
  }

  const handleSaveDateOverride = () => {
    if (!currentDateOverride) return

    // Update or add the date override
    setDateOverrides((prev) => {
      const existingIndex = prev.findIndex((override) => override.date === currentDateOverride.date)

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = currentDateOverride
        return updated
      } else {
        return [...prev, currentDateOverride]
      }
    })

    setIsEditingDate(false)

    toast({
      title: "Date Updated",
      description: `Availability for ${format(parseISO(currentDateOverride.date), "MMMM d, yyyy")} has been updated.`,
    })
  }

  const handleApplyTemplate = () => {
    setIsApplyingTemplate(true)
  }

  const handleConfirmApplyTemplate = () => {
    if (!templateStartDate || !templateEndDate) return

    let currentDate = templateStartDate
    const newOverrides: DateOverride[] = []

    // Generate date overrides for each day in the range
    while (currentDate <= templateEndDate) {
      const dateString = format(currentDate, "yyyy-MM-dd")
      const dayOfWeek = format(currentDate, "EEEE").toLowerCase() as keyof WeeklySchedule

      newOverrides.push({
        date: dateString,
        available: weeklySchedule[dayOfWeek].enabled,
        timeSlots: [...weeklySchedule[dayOfWeek].timeSlots],
      })

      currentDate = addDays(currentDate, 1)
    }

    // Merge with existing overrides, new ones take precedence
    setDateOverrides((prev) => {
      const updated = [...prev]

      newOverrides.forEach((newOverride) => {
        const existingIndex = updated.findIndex((override) => override.date === newOverride.date)

        if (existingIndex >= 0) {
          updated[existingIndex] = newOverride
        } else {
          updated.push(newOverride)
        }
      })

      return updated
    })

    setIsApplyingTemplate(false)

    toast({
      title: "Template Applied",
      description: `Your weekly schedule has been applied to dates from ${format(templateStartDate, "MMMM d")} to ${format(templateEndDate, "MMMM d")}.`,
    })
  }

  const handleSaveAvailability = async () => {
    setIsSaving(true)
    try {
      // In a real app, this would be an API call to save the availability
      console.log("Saving weekly schedule:", weeklySchedule)
      console.log("Saving date overrides:", dateOverrides)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      toast({
        title: "Availability Saved",
        description: "Your availability settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving availability:", error)
      toast({
        title: "Error",
        description: "Failed to save availability settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getDayLabel = (day: keyof WeeklySchedule): string => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  const isDateOverridden = (date: Date): boolean => {
    const dateString = format(date, "yyyy-MM-dd")
    return dateOverrides.some((override) => override.date === dateString)
  }

  const isDateAvailable = (date: Date): boolean => {
    const dateString = format(date, "yyyy-MM-dd")
    const override = dateOverrides.find((o) => o.date === dateString)

    if (override) {
      return override.available
    }

    const dayOfWeek = format(date, "EEEE").toLowerCase() as keyof WeeklySchedule
    return weeklySchedule[dayOfWeek].enabled
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="dates">Specific Dates</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Set Your Regular Weekly Hours</CardTitle>
              <CardDescription>
                Define your standard working hours for each day of the week. This will be your default schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(Object.keys(weeklySchedule) as Array<keyof WeeklySchedule>).map((day) => (
                <div key={day} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={weeklySchedule[day].enabled}
                        onCheckedChange={(checked) => handleDayToggle(day, checked)}
                        id={`${day}-toggle`}
                      />
                      <Label htmlFor={`${day}-toggle`} className="font-medium">
                        {getDayLabel(day)}
                      </Label>
                    </div>

                    {weeklySchedule[day].enabled && (
                      <Button variant="outline" size="sm" onClick={() => handleAddTimeSlot(day)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Time Slot
                      </Button>
                    )}
                  </div>

                  {weeklySchedule[day].enabled && (
                    <div className="space-y-3 pl-8">
                      {weeklySchedule[day].timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="grid grid-cols-2 gap-2 flex-grow">
                            <div className="space-y-1">
                              <Label htmlFor={`${day}-start-${index}`}>Start Time</Label>
                              <Input
                                id={`${day}-start-${index}`}
                                type="time"
                                value={slot.start}
                                onChange={(e) => handleTimeSlotChange(day, index, "start", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`${day}-end-${index}`}>End Time</Label>
                              <Input
                                id={`${day}-end-${index}`}
                                type="time"
                                value={slot.end}
                                onChange={(e) => handleTimeSlotChange(day, index, "end", e.target.value)}
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mt-6"
                            onClick={() => handleRemoveTimeSlot(day, index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <span className="sr-only">Remove time slot</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleApplyTemplate}>
                <Copy className="h-4 w-4 mr-2" /> Apply to Date Range
              </Button>
              <Button onClick={handleSaveAvailability} disabled={isSaving || saveSuccess}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="dates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Specific Dates</CardTitle>
                <CardDescription>
                  Customize your availability for specific dates that differ from your regular schedule.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    overridden: (date) => isDateOverridden(date),
                    available: (date) => isDateAvailable(date),
                    unavailable: (date) => isDateOverridden(date) && !isDateAvailable(date),
                  }}
                  modifiersClassNames={{
                    overridden: "border-2 border-primary",
                    available: "bg-green-50 text-green-700",
                    unavailable: "bg-red-50 text-red-700",
                  }}
                />
                <div className="mt-4 flex flex-col space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-50 border border-green-700 mr-2"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-50 border border-red-700 mr-2"></div>
                    <span className="text-sm">Unavailable</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-primary mr-2"></div>
                    <span className="text-sm">Custom Schedule</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleEditDate} disabled={!selectedDate}>
                  {isDateOverridden(selectedDate!) ? "Edit Selected Date" : "Customize Selected Date"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Date Details</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Viewing details for ${format(selectedDate, "MMMM d, yyyy")}`
                    : "Select a date to view details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate && currentDateOverride ? (
                  isEditingDate ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={currentDateOverride.available}
                          onCheckedChange={handleDateOverrideToggle}
                          id="date-available-toggle"
                        />
                        <Label htmlFor="date-available-toggle" className="font-medium">
                          Available on this date
                        </Label>
                      </div>

                      {currentDateOverride.available && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium">Time Slots</h3>
                            <Button variant="outline" size="sm" onClick={handleAddDateTimeSlot}>
                              <Plus className="h-4 w-4 mr-1" /> Add Time Slot
                            </Button>
                          </div>

                          {currentDateOverride.timeSlots.map((slot, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="grid grid-cols-2 gap-2 flex-grow">
                                <div className="space-y-1">
                                  <Label htmlFor={`date-start-${index}`}>Start Time</Label>
                                  <Input
                                    id={`date-start-${index}`}
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => handleDateTimeSlotChange(index, "start", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor={`date-end-${index}`}>End Time</Label>
                                  <Input
                                    id={`date-end-${index}`}
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => handleDateTimeSlotChange(index, "end", e.target.value)}
                                  />
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="mt-6"
                                onClick={() => handleRemoveDateTimeSlot(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Remove time slot</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full",
                            currentDateOverride.available
                              ? "bg-green-50 border border-green-700"
                              : "bg-red-50 border border-red-700",
                          )}
                        ></div>
                        <span>
                          {currentDateOverride.available ? "Available on this date" : "Not available on this date"}
                        </span>
                      </div>

                      {currentDateOverride.available && currentDateOverride.timeSlots.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Available Time Slots:</h3>
                          <ul className="space-y-1">
                            {currentDateOverride.timeSlots.map((slot, index) => (
                              <li key={index} className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span>
                                  {slot.start} - {slot.end}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select a date to view or customize availability</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {selectedDate && currentDateOverride && isEditingDate ? (
                  <div className="flex w-full gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setIsEditingDate(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleSaveDateOverride}>
                      Save Changes
                    </Button>
                  </div>
                ) : null}
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Date Overrides</CardTitle>
              <CardDescription>View all dates with custom availability settings</CardDescription>
            </CardHeader>
            <CardContent>
              {dateOverrides.length > 0 ? (
                <div className="space-y-4">
                  {dateOverrides.map((override) => (
                    <div
                      key={override.date}
                      className={cn(
                        "flex justify-between items-center p-3 rounded-md border",
                        override.available ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
                      )}
                    >
                      <div className="flex items-center">
                        <CalendarIcon
                          className={cn("h-5 w-5 mr-3", override.available ? "text-green-600" : "text-red-600")}
                        />
                        <div>
                          <p className="font-medium">{format(parseISO(override.date), "MMMM d, yyyy")}</p>
                          <p className="text-sm text-muted-foreground">
                            {override.available ? `${override.timeSlots.length} time slot(s)` : "Not available"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDate(parseISO(override.date))
                          setIsEditingDate(true)
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No custom date settings yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleSaveAvailability}
                disabled={isSaving || saveSuccess}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Apply Template Dialog */}
      <Dialog open={isApplyingTemplate} onOpenChange={setIsApplyingTemplate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Weekly Schedule</DialogTitle>
            <DialogDescription>Apply your weekly schedule template to a range of dates</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-start-date">Start Date</Label>
              <Input
                id="template-start-date"
                type="date"
                value={templateStartDate ? format(templateStartDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setTemplateStartDate(e.target.value ? parseISO(e.target.value) : undefined)}
                min={format(new Date(), "yyyy-MM-dd")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-end-date">End Date</Label>
              <Input
                id="template-end-date"
                type="date"
                value={templateEndDate ? format(templateEndDate, "yyyy-MM-dd") : ""}
                onChange={(e) => setTemplateEndDate(e.target.value ? parseISO(e.target.value) : undefined)}
                min={templateStartDate ? format(templateStartDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyingTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmApplyTemplate} disabled={!templateStartDate || !templateEndDate}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

