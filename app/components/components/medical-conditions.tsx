"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Pill,
  Activity,
  History,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/utils/supabase"

// Define types for our data
interface Medication {
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string | null
}

interface Reading {
  date: string
  value: string
  notes: string
}

interface LabResult {
  date: string
  name: string
  result: string
  notes: string
}

interface Note {
  date: string
  author: string
  content: string
}

interface Condition {
  id: number
  name: string
  status: string
  severity: string
  diagnosedDate: string
  description: string
  treatment: string
  nextCheckup: string
  diagnosedBy: string
  symptoms: string[]
  medications: Medication[]
  readings: Reading[]
  labResults: LabResult[]
  notes: Note[]
}

export function MedicalConditions() {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [expandedCondition, setExpandedCondition] = useState<number | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<Condition | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchDiagnoses = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('pacient_diagnosis')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data) {
        // Transform the data to match your frontend structure
        const formattedDiagnoses = data.map(diagnosis => ({
          id: diagnosis.id,
          name: diagnosis.name,
          status: diagnosis.status,
          severity: diagnosis.severity,
          diagnosedDate: new Date(diagnosis.created_at).toISOString().split("T")[0],
          description: diagnosis.description,
          treatment: diagnosis.treatment,
          nextCheckup: diagnosis.next_check_up,
          diagnosedBy: diagnosis.diagnosed_by,
          symptoms: diagnosis.symptoms ? JSON.parse(diagnosis.symptoms) : [],
          medications: diagnosis.medications ? JSON.parse(diagnosis.medications) : [],
          readings: diagnosis.readings ? JSON.parse(diagnosis.readings) : [],
          labResults: diagnosis.lab_results ? JSON.parse(diagnosis.lab_results) : [],
          notes: diagnosis.notes ?
            [{
              date: new Date(diagnosis.created_at).toISOString().split("T")[0],
              author: diagnosis.diagnosed_by,
              content: diagnosis.notes
            }] : []
        }));
        console.log(formattedDiagnoses)
        setConditions(formattedDiagnoses);
      }
    } catch (error) {
      console.error("Error fetching diagnoses:", error);
      // Show error message to user
    } finally {
      setIsLoading(false)
    }
  };

  // Use useEffect to fetch diagnoses when the component mounts
  useEffect(() => {
    fetchDiagnoses();
  }, []); // Empty dependency array to run only on mount

  const filteredConditions = conditions.filter((condition) => {
    if (activeTab === "all") return true
    return condition.status === activeTab
  })

  const toggleExpand = (id: number) => {
    setExpandedCondition(expandedCondition === id ? null : id)
  }

  const openConditionModal = (condition: Condition) => {
    setSelectedCondition(condition)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            <AlertCircle className="mr-1 h-3 w-3" /> Active
          </Badge>
        )
      case "recurring":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
            <Clock className="mr-1 h-3 w-3" /> Recurring
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            <CheckCircle className="mr-1 h-3 w-3" /> Resolved
          </Badge>
        )
      default:
        return null
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "mild":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
            Mild
          </Badge>
        )
      case "moderate":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
            Moderate
          </Badge>
        )
      case "severe":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            Severe
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="all"
        className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-100"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            All Conditions
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="resolved"
            className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
          >
            Resolved
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-lg font-medium text-gray-900">Loading medical conditions...</p>
          </div>
        ) : (
          <>
            {filteredConditions.map((condition) => (
              <Card key={condition.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col">
                        <CardTitle className="text-xl">{condition.name}</CardTitle>
                        <CardDescription>
                          Diagnosed on {new Date(condition.diagnosedDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge(condition.status)}
                      {getSeverityBadge(condition.severity)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Description</h4>
                      <p className="text-sm text-muted-foreground mt-1">{condition.description}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Treatment Plan</h4>
                      <p className="text-sm text-muted-foreground mt-1">{condition.treatment}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Next Checkup</h4>
                      <p className="text-sm text-muted-foreground mt-1">{condition.nextCheckup}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 border-gray-200"
                        onClick={() => openConditionModal(condition)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Full Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredConditions.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium text-gray-900">No {activeTab} conditions found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === "active"
                    ? "You don't have any active medical conditions at the moment."
                    : "No conditions match the current filter."}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detailed Condition Modal - View Only */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl">
                {selectedCondition?.name}
                <span className="ml-3 inline-flex">
                  {selectedCondition && getStatusBadge(selectedCondition.status)}
                </span>
              </DialogTitle>
            </div>
            <DialogDescription>
              Diagnosed on {selectedCondition && new Date(selectedCondition.diagnosedDate).toLocaleDateString()} by{" "}
              {selectedCondition?.diagnosedBy}
            </DialogDescription>
          </DialogHeader>

          {selectedCondition && (
            <div className="space-y-6">
              {/* Overview Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" /> Overview
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Severity</p>
                    <p className="text-sm mt-1 flex items-center">{getSeverityBadge(selectedCondition.severity)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p className="text-sm mt-1">{getStatusBadge(selectedCondition.status)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Description</p>
                  <p className="text-sm mt-1">{selectedCondition.description}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Treatment Plan</p>
                  <p className="text-sm mt-1">{selectedCondition.treatment}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Next Checkup</p>
                    <p className="text-sm mt-1">{selectedCondition.nextCheckup}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Diagnosed By</p>
                    <p className="text-sm mt-1">{selectedCondition.diagnosedBy}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Symptoms Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" /> Symptoms
                </h3>

                <div className="flex flex-wrap gap-2">
                  {selectedCondition.symptoms.length > 0 ? (
                    selectedCondition.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {symptom}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No symptoms recorded</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Medications Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-primary" /> Medications
                </h3>

                {selectedCondition.medications.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCondition.medications.map((medication, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between">
                          <p className="font-medium">
                            {medication.name} ({medication.dosage})
                          </p>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {medication.endDate ? "Completed" : "Active"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{medication.frequency}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Started: {new Date(medication.startDate).toLocaleDateString()}
                          {medication.endDate && ` • Ended: ${new Date(medication.endDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground">No medications recorded for this condition</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Readings/Measurements Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" /> Readings & Measurements
                </h3>

                {selectedCondition.readings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCondition.readings.map((reading, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{reading.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(reading.date).toLocaleDateString()}
                            </p>
                          </div>
                          {reading.notes && <p className="text-sm text-muted-foreground">{reading.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground">No readings recorded for this condition</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Lab Results Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" /> Lab Results
                </h3>

                {selectedCondition.labResults.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCondition.labResults.map((result, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{result.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(result.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className={
                                result.result === "Normal" || result.result === "Negative"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {result.result}
                            </Badge>
                            {result.notes && <p className="text-sm text-muted-foreground mt-1">{result.notes}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground">No lab results recorded for this condition</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <History className="h-5 w-5 mr-2 text-primary" /> Progress Notes
                </h3>

                {selectedCondition.notes.length > 0 ? (
                  <div className="space-y-4">
                    {selectedCondition.notes.map((note, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(note.date).toLocaleDateString()} by {note.author}
                        </p>
                        <p>{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground">No progress notes recorded for this condition</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
