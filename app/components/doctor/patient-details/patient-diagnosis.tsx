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
  Plus,
  FileText,
  Pill,
  Activity,
  History,
  Edit,
  Save,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/utils/supabase"
interface PatientDiagnosisProps {
  patient: any
}
const conditionsData = [
  {
    id: 1,
    name: "Hypertension",
    status: "active",
    severity: "moderate",
    diagnosedDate: "2023-05-15",
    description:
      "High blood pressure condition requiring regular monitoring and medication. Current readings show systolic pressure averaging 145 mmHg and diastolic pressure averaging 90 mmHg.",
    treatment:
      "Daily medication (Lisinopril 10mg), reduced sodium diet, regular exercise, and stress management techniques.",
    nextCheckup: "2023-08-15",
    diagnosedBy: "Dr. Sarah Johnson",
    symptoms: ["Occasional headaches", "Fatigue", "Shortness of breath"],
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", startDate: "2022-03-10", endDate: null },
      {
        name: "Hydrochlorothiazide",
        dosage: "12.5mg",
        frequency: "Once daily",
        startDate: "2022-03-10",
        endDate: "2022-09-15",
      },
    ],
    readings: [
      { date: "2023-06-01", value: "142/88", notes: "Morning reading" },
      { date: "2023-05-15", value: "145/90", notes: "After doctor visit" },
      { date: "2023-05-01", value: "150/92", notes: "Before medication adjustment" },
    ],
    labResults: [
      { date: "2023-05-15", name: "Kidney Function Panel", result: "Normal", notes: "All values within range" },
      {
        date: "2023-01-10",
        name: "Electrolyte Panel",
        result: "Normal",
        notes: "Sodium slightly elevated but within range",
      },
    ],
    notes: [
      {
        date: "2023-05-15",
        author: "Dr. Sarah Johnson",
        content: "Patient responding well to current medication regimen. Continue monitoring.",
      },
      {
        date: "2023-01-10",
        author: "Dr. Sarah Johnson",
        content: "Initial diagnosis. Starting on Lisinopril 10mg daily.",
      },
    ],
  },
  {
    id: 2,
    name: "Type 2 Diabetes",
    status: "active",
    severity: "moderate",
    diagnosedDate: "2022-11-03",
    description:
      "Insulin resistance resulting in elevated blood glucose levels. Recent HbA1c test shows a level of 7.2%, which is above the target range but showing improvement from previous readings.",
    treatment:
      "Metformin 1000mg twice daily, dietary modifications focusing on low glycemic index foods, regular blood glucose monitoring, and 30 minutes of daily exercise.",
    nextCheckup: "2023-07-22",
    diagnosedBy: "Dr. Michael Chen",
    symptoms: ["Increased thirst", "Frequent urination", "Fatigue", "Blurred vision"],
    medications: [
      { name: "Metformin", dosage: "1000mg", frequency: "Twice daily", startDate: "2022-11-03", endDate: null },
    ],
    readings: [
      { date: "2023-06-10", value: "HbA1c: 7.2%", notes: "Improved from previous" },
      { date: "2023-03-15", value: "HbA1c: 7.8%", notes: "Needs improvement" },
      { date: "2022-11-03", value: "HbA1c: 8.5%", notes: "Initial diagnosis" },
    ],
    labResults: [
      {
        date: "2023-06-10",
        name: "Comprehensive Metabolic Panel",
        result: "Abnormal",
        notes: "Glucose elevated at 145 mg/dL",
      },
      { date: "2023-06-10", name: "HbA1c", result: "Abnormal", notes: "7.2% (Target <6.5%)" },
      { date: "2022-11-03", name: "Glucose Tolerance Test", result: "Abnormal", notes: "Confirmed diabetes diagnosis" },
    ],
    notes: [
      {
        date: "2023-06-10",
        author: "Dr. Michael Chen",
        content: "Patient showing improvement with medication and lifestyle changes. Continue current regimen.",
      },
      {
        date: "2022-11-03",
        author: "Dr. Michael Chen",
        content: "Diagnosed with Type 2 Diabetes. Starting on Metformin and lifestyle modifications.",
      },
    ],
  },
  {
    id: 3,
    name: "Seasonal Allergies",
    status: "recurring",
    severity: "mild",
    diagnosedDate: "2020-03-10",
    description:
      "Allergic rhinitis triggered by pollen, typically occurring in spring and early summer. Symptoms include sneezing, nasal congestion, and itchy eyes.",
    treatment:
      "Over-the-counter antihistamines as needed, nasal corticosteroid spray during high pollen seasons, and avoiding outdoor activities during peak pollen times.",
    nextCheckup: "As needed during allergy season",
    diagnosedBy: "Dr. Emily Rodriguez",
    symptoms: ["Sneezing", "Nasal congestion", "Itchy eyes", "Runny nose"],
    medications: [
      { name: "Cetirizine", dosage: "10mg", frequency: "Once daily as needed", startDate: "2020-03-10", endDate: null },
      {
        name: "Fluticasone Nasal Spray",
        dosage: "50mcg",
        frequency: "1 spray per nostril daily",
        startDate: "2021-04-15",
        endDate: null,
      },
    ],
    readings: [],
    labResults: [
      {
        date: "2020-03-10",
        name: "Allergy Panel",
        result: "Positive",
        notes: "Positive for tree and grass pollen allergies",
      },
    ],
    notes: [
      {
        date: "2022-05-20",
        author: "Dr. Emily Rodriguez",
        content: "Patient reports good control with current medication regimen during allergy season.",
      },
      {
        date: "2021-04-15",
        author: "Dr. Emily Rodriguez",
        content: "Added nasal corticosteroid spray to regimen for better symptom control.",
      },
      {
        date: "2020-03-10",
        author: "Dr. Emily Rodriguez",
        content: "Initial diagnosis of seasonal allergies. Recommended OTC antihistamines.",
      },
    ],
  },
  {
    id: 4,
    name: "Lower Back Pain",
    status: "resolved",
    severity: "moderate",
    diagnosedDate: "2022-01-20",
    description:
      "Lumbar strain resulting from improper lifting technique. MRI showed no disc herniation or structural abnormalities. Pain was primarily localized to the L4-L5 region.",
    treatment:
      "Physical therapy (completed 12 sessions), core strengthening exercises, proper ergonomics education, and temporary use of NSAIDs for pain management.",
    nextCheckup: "No follow-up required unless symptoms return",
    diagnosedBy: "Dr. James Wilson",
    symptoms: ["Lower back pain", "Stiffness", "Limited range of motion", "Pain with certain movements"],
    medications: [
      {
        name: "Ibuprofen",
        dosage: "600mg",
        frequency: "As needed for pain",
        startDate: "2022-01-20",
        endDate: "2022-03-15",
      },
    ],
    readings: [],
    labResults: [
      {
        date: "2022-01-25",
        name: "Lumbar MRI",
        result: "Normal",
        notes: "No disc herniation or structural abnormalities",
      },
    ],
    notes: [
      {
        date: "2022-04-10",
        author: "Dr. James Wilson",
        content: "Patient reports complete resolution of symptoms after physical therapy and home exercises.",
      },
      {
        date: "2022-01-20",
        author: "Dr. James Wilson",
        content: "Diagnosed with lumbar strain. Referred to physical therapy and prescribed NSAIDs for pain.",
      },
    ],
  },
]
interface Diagnosis {
  id: string; // or string, depending on your database
  name: string;
  status: string;
  severity: string;
  description: string;
  treatment: string;
  nextCheckup: string | null;
  diagnosedBy: string;
  symptoms: string[] | null;
  medications: any[] | null; // Adjust type as necessary
  readings: any[] | null; // Adjust type as necessary
  labResults: any[] | null; // Adjust type as necessary
  notes: any[] | null; // Adjust type as necessary
}

export function PatientDiagnosis({ patient }: PatientDiagnosisProps) {
  const [conditions, setConditions] = useState(conditionsData)
  const [activeTab, setActiveTab] = useState("all")
  const [expandedCondition, setExpandedCondition] = useState<number | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedCondition, setEditedCondition] = useState<any | null>(null)
  const [newNote, setNewNote] = useState("")
  const [newReading, setNewReading] = useState({ date: "", value: "", notes: "" })
  const [newMedication, setNewMedication] = useState({ name: "", dosage: "", frequency: "", startDate: "", endDate: "" })
  const [newLabResult, setNewLabResult] = useState({ date: "", name: "", result: "", notes: "" });
  const [isNewDiagnosisModalOpen, setIsNewDiagnosisModalOpen] = useState(false)
  const [newDiagnosis, setNewDiagnosis] = useState({
    name: "",
    status: "active",
    severity: "moderate",
    diagnosedDate: new Date().toISOString().split("T")[0],
    description: "",
    treatment: "",
    nextCheckup: "",
    diagnosedBy: "Dr. Sarah Johnson",
    symptoms: [] as string[], // Explicitly tell TypeScript this is a string array
    medications: [] as any[], // Do the same for other arrays
    readings: [] as any[],
    labResults: [] as any[],
    notes: [] as any[]
  })
  const handleSaveNewDiagnosis = async () => {
    if (!newDiagnosis.name || !newDiagnosis.description) {
      // Show some validation error to the user
      return;
    }

    try {
      // Format the data to match your SQL schema
      const { data, error } = await supabase
        .from('pacient_diagnosis')
        .insert([
          {
            name: newDiagnosis.name,
            status: newDiagnosis.status,
            severity: newDiagnosis.severity,
            description: newDiagnosis.description,
            treatment: newDiagnosis.treatment,
            next_check_up: newDiagnosis.nextCheckup || null,
            diagnosed_by: newDiagnosis.diagnosedBy,
            symptoms: newDiagnosis.symptoms.length > 0 ? JSON.stringify(newDiagnosis.symptoms) : null,
            medications: newDiagnosis.medications.length > 0 ? JSON.stringify(newDiagnosis.medications) : null,
            readings: newDiagnosis.readings.length > 0 ? JSON.stringify(newDiagnosis.readings) : null,
            lab_results: newDiagnosis.labResults.length > 0 ? JSON.stringify(newDiagnosis.labResults) : null,
            notes: newDiagnosis.notes.length > 0 ?
              `Initial diagnosis of ${newDiagnosis.name}.` : null,
            user_id: patient.id
          }
        ])
        .select();

      if (error) throw error;

      // If successful, add the new diagnosis to the local state
      if (data && data.length > 0) {
        // Format the returned data to match your frontend structure
        const formattedDiagnosis = {
          id: data[0].id,
          name: data[0].name,
          status: data[0].status,
          severity: data[0].severity,
          diagnosedDate: new Date(data[0].created_at).toISOString().split("T")[0],
          description: data[0].description,
          treatment: data[0].treatment,
          nextCheckup: data[0].next_check_up,
          diagnosedBy: data[0].diagnosed_by,
          symptoms: data[0].symptoms ? JSON.parse(data[0].symptoms) : [],
          medications: data[0].medications ? JSON.parse(data[0].medications) : [],
          readings: data[0].readings ? JSON.parse(data[0].readings) : [],
          labResults: data[0].lab_results ? JSON.parse(data[0].lab_results) : [],
          notes: data[0].notes ?
            [{
              date: new Date(data[0].created_at).toISOString().split("T")[0],
              author: data[0].diagnosed_by,
              content: data[0].notes
            }] : []
        };

        setConditions([...conditions, formattedDiagnosis]);
      }

      // Reset the form and close the modal
      setNewDiagnosis({
        name: "",
        status: "active",
        severity: "moderate",
        diagnosedDate: new Date().toISOString().split("T")[0],
        description: "",
        treatment: "",
        nextCheckup: "",
        diagnosedBy: "Dr. Sarah Johnson",
        symptoms: [],
        medications: [],
        readings: [],
        labResults: [],
        notes: []
      });
      setIsNewDiagnosisModalOpen(false);

    } catch (error) {
      console.error("Error saving diagnosis:", error);
      // Show error message to user
    }
  };
  const [newSymptom, setNewSymptom] = useState("")
  console.log("@@@@@@", newDiagnosis)
  const filteredConditions = conditions.filter((condition) => {
    if (activeTab === "all") return true
    return condition.status === activeTab
  })
  const handleUpdateDiagnosis = async (diagnosisId:number) => {
    if (!editedCondition) return;
    
    try {
      // Format the data to match your SQL schema
      const updateData = {
        name: editedCondition.name,
        status: editedCondition.status,
        severity: editedCondition.severity,
        description: editedCondition.description,
        treatment: editedCondition.treatment,
        next_check_up: editedCondition.nextCheckup || null,
        diagnosed_by: editedCondition.diagnosedBy,
        symptoms: editedCondition.symptoms?.length > 0 
          ? JSON.stringify(editedCondition.symptoms) 
          : null,
        medications: editedCondition.medications?.length > 0 
          ? JSON.stringify(editedCondition.medications) 
          : null,
        readings: editedCondition.readings?.length > 0 
          ? JSON.stringify(editedCondition.readings) 
          : null,
        lab_results: editedCondition.labResults?.length > 0 
          ? JSON.stringify(editedCondition.labResults) 
          : null,
        notes: editedCondition.notes?.length > 0 
          ? JSON.stringify(editedCondition.notes) 
          : null
      };
      
      // Remove any undefined fields to avoid overwriting with null
     
      
      // Update the record in Supabase
      const { data, error } = await supabase
        .from('pacient_diagnosis')
        .update(updateData)
        .eq('id', diagnosisId)
        .select();
      
      if (error) throw error;
      
      // If successful, update the local state
      if (data && data.length > 0) {
        // Format the returned data to match your frontend structure
        const updatedDiagnosis = {
          id: data[0].id,
          name: data[0].name,
          status: data[0].status,
          severity: data[0].severity,
          diagnosedDate: new Date(data[0].created_at).toISOString().split("T")[0],
          description: data[0].description,
          treatment: data[0].treatment,
          nextCheckup: data[0].next_check_up,
          diagnosedBy: data[0].diagnosed_by,
          symptoms: data[0].symptoms ? JSON.parse(data[0].symptoms) : [],
          medications: data[0].medications ? JSON.parse(data[0].medications) : [],
          readings: data[0].readings ? JSON.parse(data[0].readings) : [],
          labResults: data[0].lab_results ? JSON.parse(data[0].lab_results) : [],
          notes: data[0].notes ? JSON.parse(data[0].notes) : []
        };
        
        // Update the conditions array with the updated diagnosis
        const updatedConditions = conditions.map(condition => 
          condition.id === diagnosisId ? updatedDiagnosis : condition
        );
        
        setConditions(updatedConditions);
        
        // If this was the selected condition, update that too
        if (selectedCondition && selectedCondition.id === diagnosisId) {
          setSelectedCondition(updatedDiagnosis);
        }
      }
      
      // Exit editing mode
      setIsEditing(false);
      setEditedCondition(null);
      
    } catch (error) {
      console.error("Error updating diagnosis:", error);
      // Show error message to user
    }
  };
  
  // Add this function to your component
  const fetchDiagnoses = async () => {
    try {
      const { data, error } = await supabase
        .from('pacient_diagnosis')
        .select('*')
        .eq('user_id', patient.id);

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
    }
  };

  // Use useEffect to fetch diagnoses when the component mounts
  useEffect(() => {
    fetchDiagnoses();
  }, [patient.id]); // Re-fetch when patient ID changes
  const openConditionModal = (condition: any) => {
    setSelectedCondition(condition)
    setEditedCondition(JSON.parse(JSON.stringify(condition))) // Deep copy for editing
    setIsModalOpen(true)
  }

  const handleSaveChanges = () => {
    if (!editedCondition) return

    // Update the condition in the conditions array
    setConditions(conditions.map((c) => (c.id === editedCondition.id ? editedCondition : c)))
    setSelectedCondition(editedCondition)
    setIsEditing(false)
  }

  const handleAddNote = () => {
    if (!newNote.trim() || !editedCondition) return

    const newNoteObj = {
      date: new Date().toISOString().split("T")[0],
      author: "Dr. Sarah Johnson", // In a real app, this would be the logged-in doctor
      content: newNote,
    }

    const updatedNotes = [...editedCondition.notes, newNoteObj]
    setEditedCondition({ ...editedCondition, notes: updatedNotes })
    setNewNote("")
  }

  const handleAddReading = () => {
    if (!newReading.date || !newReading.value || !editedCondition) return

    const updatedReadings = [...editedCondition.readings, newReading]
    setEditedCondition({ ...editedCondition, readings: updatedReadings })
    setNewReading({ date: "", value: "", notes: "" })
  }

  const handleAddMedication = () => {
    if (
      !newMedication.name ||
      !newMedication.dosage ||
      !newMedication.frequency ||
      !newMedication.startDate ||
      !editedCondition
    )
      return

    const newMedicationObj = {
      ...newMedication,
      endDate: null,
    }

    const updatedMedications = [...editedCondition.medications, newMedicationObj]
    setEditedCondition({ ...editedCondition, medications: updatedMedications })
    setNewMedication({ name: "", dosage: "", frequency: "", startDate: "", endDate: "" })
  }

  // Function to add a new symptom to the new diagnosis
  const handleAddSymptomToDiagnosis = () => {
    if (!newSymptom.trim()) return
    setNewDiagnosis({
      ...newDiagnosis,
      symptoms: [...newDiagnosis.symptoms, newSymptom]
    })
    setNewSymptom("")
  }

  // Function to remove a symptom from the new diagnosis
  const handleRemoveSymptomFromDiagnosis = (index: number) => {
    const updatedSymptoms = [...newDiagnosis.symptoms]
    updatedSymptoms.splice(index, 1)
    setNewDiagnosis({
      ...newDiagnosis,
      symptoms: updatedSymptoms
    })
  }

  // Function to save the new diagnosis


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
      <div className="flex justify-between items-center">
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

        {/* Add New Diagnosis Button */}
        <Button
          className="ml-4 whitespace-nowrap"
          onClick={() => setIsNewDiagnosisModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Diagnosis
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
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

        {filteredConditions.length === 0 && (
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
      </div>

      {/* Detailed Condition Modal */}
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
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleUpdateDiagnosis(selectedCondition.id)}>
                    <Save className="h-4 w-4 mr-1" /> Save Changes
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
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
                    <Label>Severity</Label>
                    {isEditing ? (
                      <Select
                        value={editedCondition.severity}
                        onValueChange={(value) => setEditedCondition({ ...editedCondition, severity: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm mt-1 flex items-center">{getSeverityBadge(selectedCondition.severity)}</p>
                    )}
                  </div>

                  <div>
                    <Label>Status</Label>
                    {isEditing ? (
                      <Select
                        value={editedCondition.status}
                        onValueChange={(value) => setEditedCondition({ ...editedCondition, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="recurring">Recurring</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm mt-1">{getStatusBadge(selectedCondition.status)}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedCondition.description}
                      onChange={(e) => setEditedCondition({ ...editedCondition, description: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{selectedCondition.description}</p>
                  )}
                </div>

                <div>
                  <Label>Treatment Plan</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedCondition.treatment}
                      onChange={(e) => setEditedCondition({ ...editedCondition, treatment: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm mt-1">{selectedCondition.treatment}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Next Checkup</Label>
                    {isEditing ? (
                      <Input
                        value={editedCondition.nextCheckup}
                        onChange={(e) => setEditedCondition({ ...editedCondition, nextCheckup: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedCondition.nextCheckup}</p>
                    )}
                  </div>

                  <div>
                    <Label>Diagnosed By</Label>
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

                {isEditing ? (
                  <div className="space-y-2">
                    {editedCondition.symptoms.map((symptom: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={symptom}
                          onChange={(e) => {
                            const updatedSymptoms = [...editedCondition.symptoms]
                            updatedSymptoms[index] = e.target.value
                            setEditedCondition({ ...editedCondition, symptoms: updatedSymptoms })
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updatedSymptoms = editedCondition.symptoms.filter((_: any, i: number) => i !== index)
                            setEditedCondition({ ...editedCondition, symptoms: updatedSymptoms })
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input placeholder="Add new symptom" id="new-symptom" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newSymptom = (document.getElementById("new-symptom") as HTMLInputElement).value
                          if (newSymptom.trim()) {
                            setEditedCondition({
                              ...editedCondition,
                              symptoms: [...editedCondition.symptoms, newSymptom],
                            })
                              ; (document.getElementById("new-symptom") as HTMLInputElement).value = ""
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedCondition.symptoms.map((symptom: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Medications Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-primary" /> Medications
                </h3>

                <div className="space-y-4">
                  {(isEditing ? editedCondition.medications : selectedCondition.medications).map(
                    (medication: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Medication Name</Label>
                              <Input
                                value={medication.name}
                                onChange={(e) => {
                                  const updatedMedications = [...editedCondition.medications]
                                  updatedMedications[index] = { ...medication, name: e.target.value }
                                  setEditedCondition({ ...editedCondition, medications: updatedMedications })
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Dosage</Label>
                              <Input
                                value={medication.dosage}
                                onChange={(e) => {
                                  const updatedMedications = [...editedCondition.medications]
                                  updatedMedications[index] = { ...medication, dosage: e.target.value }
                                  setEditedCondition({ ...editedCondition, medications: updatedMedications })
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Frequency</Label>
                              <Input
                                value={medication.frequency}
                                onChange={(e) => {
                                  const updatedMedications = [...editedCondition.medications]
                                  updatedMedications[index] = { ...medication, frequency: e.target.value }
                                  setEditedCondition({ ...editedCondition, medications: updatedMedications })
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={medication.startDate}
                                onChange={(e) => {
                                  const updatedMedications = [...editedCondition.medications]
                                  updatedMedications[index] = { ...medication, startDate: e.target.value }
                                  setEditedCondition({ ...editedCondition, medications: updatedMedications })
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>End Date (if applicable)</Label>
                              <Input
                                type="date"
                                value={medication.endDate || ""}
                                onChange={(e) => {
                                  const updatedMedications = [...editedCondition.medications]
                                  updatedMedications[index] = { ...medication, endDate: e.target.value || null }
                                  setEditedCondition({ ...editedCondition, medications: updatedMedications })
                                }}
                                className="mt-1"
                              />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  const updatedMedications = editedCondition.medications.filter(
                                    (_: any, i: number) => i !== index,
                                  )
                                  setEditedCondition({ ...editedCondition, medications: updatedMedications })
                                }}
                              >
                                <X className="h-4 w-4 mr-1" /> Remove
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    ),
                  )}

                  {isEditing && (
                    <div className="p-4 border border-dashed rounded-md">
                      <h4 className="text-sm font-medium mb-3">Add New Medication</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label>Medication Name</Label>
                          <Input
                            value={newMedication.name}
                            onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Dosage</Label>
                          <Input
                            value={newMedication.dosage}
                            onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Frequency</Label>
                          <Input
                            value={newMedication.frequency}
                            onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={newMedication.startDate}
                            onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-2">
                          <Button
                            onClick={handleAddMedication}
                            disabled={
                              !newMedication.name ||
                              !newMedication.dosage ||
                              !newMedication.frequency ||
                              !newMedication.startDate
                            }
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Medication
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Readings/Measurements Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" /> Readings & Measurements
                </h3>

                {selectedCondition.readings.length > 0 ? (
                  <div className="space-y-3">
                    {(isEditing ? editedCondition.readings : selectedCondition.readings).map(
                      (reading: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md">
                          {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <Label>Date</Label>
                                <Input
                                  type="date"
                                  value={reading.date}
                                  onChange={(e) => {
                                    const updatedReadings = [...editedCondition.readings]
                                    updatedReadings[index] = { ...reading, date: e.target.value }
                                    setEditedCondition({ ...editedCondition, readings: updatedReadings })
                                  }}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Value</Label>
                                <Input
                                  value={reading.value}
                                  onChange={(e) => {
                                    const updatedReadings = [...editedCondition.readings]
                                    updatedReadings[index] = { ...reading, value: e.target.value }
                                    setEditedCondition({ ...editedCondition, readings: updatedReadings })
                                  }}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Notes</Label>
                                <Input
                                  value={reading.notes}
                                  onChange={(e) => {
                                    const updatedReadings = [...editedCondition.readings]
                                    updatedReadings[index] = { ...reading, notes: e.target.value }
                                    setEditedCondition({ ...editedCondition, readings: updatedReadings })
                                  }}
                                  className="mt-1"
                                />
                              </div>
                              <div className="md:col-span-3 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    const updatedReadings = editedCondition.readings.filter(
                                      (_: any, i: number) => i !== index,
                                    )
                                    setEditedCondition({ ...editedCondition, readings: updatedReadings })
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" /> Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{reading.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(reading.date).toLocaleDateString()}
                                </p>
                              </div>
                              {reading.notes && <p className="text-sm text-muted-foreground">{reading.notes}</p>}
                            </div>
                          )}
                        </div>
                      ),
                    )}

                    {isEditing && (
                      <div className="p-4 border border-dashed rounded-md">
                        <h4 className="text-sm font-medium mb-3">Add New Reading</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={newReading.date}
                              onChange={(e) => setNewReading({ ...newReading, date: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Value</Label>
                            <Input
                              value={newReading.value}
                              onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                              className="mt-1"
                              placeholder="e.g., 140/90, HbA1c: 7.2%"
                            />
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Input
                              value={newReading.notes}
                              onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                              className="mt-1"
                              placeholder="Optional notes"
                            />
                          </div>
                          <div className="md:col-span-3 flex justify-end mt-2">
                            <Button onClick={handleAddReading} disabled={!newReading.date || !newReading.value}>
                              <Plus className="h-4 w-4 mr-1" /> Add Reading
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground">No readings recorded for this condition</p>
                    {isEditing && (
                      <div className="p-4 border border-dashed rounded-md mt-4">
                        <h4 className="text-sm font-medium mb-3">Add New Reading</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={newReading.date}
                              onChange={(e) => setNewReading({ ...newReading, date: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Value</Label>
                            <Input
                              value={newReading.value}
                              onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                              className="mt-1"
                              placeholder="e.g., 140/90, HbA1c: 7.2%"
                            />
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Input
                              value={newReading.notes}
                              onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                              className="mt-1"
                              placeholder="Optional notes"
                            />
                          </div>
                          <div className="md:col-span-3 flex justify-end mt-2">
                            <Button onClick={handleAddReading} disabled={!newReading.date || !newReading.value}>
                              <Plus className="h-4 w-4 mr-1" /> Add Reading
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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
                    {(isEditing ? editedCondition.labResults : selectedCondition.labResults).map(
                      (result: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-md">
                          {isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label>Date</Label>
                                <Input
                                  type="date"
                                  value={result.date}
                                  onChange={(e) => {
                                    const updatedResults = [...editedCondition.labResults]
                                    updatedResults[index] = { ...result, date: e.target.value }
                                    setEditedCondition({ ...editedCondition, labResults: updatedResults })
                                  }}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Test Name</Label>
                                <Input
                                  value={result.name}
                                  onChange={(e) => {
                                    const updatedResults = [...editedCondition.labResults]
                                    updatedResults[index] = { ...result, name: e.target.value }
                                    setEditedCondition({ ...editedCondition, labResults: updatedResults })
                                  }}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Result</Label>
                                <Select
                                  value={result.result}
                                  onValueChange={(value) => {
                                    const updatedResults = [...editedCondition.labResults]
                                    updatedResults[index] = { ...result, result: value }
                                    setEditedCondition({ ...editedCondition, labResults: updatedResults })
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select result" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="Abnormal">Abnormal</SelectItem>
                                    <SelectItem value="Positive">Positive</SelectItem>
                                    <SelectItem value="Negative">Negative</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Notes</Label>
                                <Input
                                  value={result.notes}
                                  onChange={(e) => {
                                    const updatedResults = [...editedCondition.labResults]
                                    updatedResults[index] = { ...result, notes: e.target.value }
                                    setEditedCondition({ ...editedCondition, labResults: updatedResults })
                                  }}
                                  className="mt-1"
                                />
                              </div>
                              <div className="md:col-span-2 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    const updatedResults = editedCondition.labResults.filter(
                                      (_: any, i: number) => i !== index,
                                    )
                                    setEditedCondition({ ...editedCondition, labResults: updatedResults })
                                  }}
                                >
                                  <X className="h-4 w-4 mr-1" /> Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
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
                          )}
                        </div>
                      ),
                    )}

                    {isEditing && (
                      <div className="p-4 border border-dashed rounded-md">
                        <h4 className="text-sm font-medium mb-3">Add New Lab Result</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Date</Label>
                            <Input type="date" className="mt-1" />
                          </div>
                          <div>
                            <Label>Test Name</Label>
                            <Input placeholder="e.g., Blood Glucose, Lipid Panel" className="mt-1" />
                          </div>
                          <div>
                            <Label>Result</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select result" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="Abnormal">Abnormal</SelectItem>
                                <SelectItem value="Positive">Positive</SelectItem>
                                <SelectItem value="Negative">Negative</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Notes</Label>
                            <Input placeholder="Additional details about the result" className="mt-1" />
                          </div>
                          <div className="md:col-span-2 flex justify-end mt-2">
                            <Button>
                              <Plus className="h-4 w-4 mr-1" /> Add Lab Result
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground">No lab results recorded for this condition</p>
                    {isEditing && (
                      <Button variant="outline" className="mt-2">
                        <Plus className="h-4 w-4 mr-1" /> Add Lab Result
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <History className="h-5 w-5 mr-2 text-primary" /> Progress Notes
                </h3>

                <div className="space-y-4">
                  {(isEditing ? editedCondition.notes : selectedCondition.notes).map((note: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-md">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              {new Date(note.date).toLocaleDateString()} by {note.author}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                              onClick={() => {
                                const updatedNotes = editedCondition.notes.filter((_: any, i: number) => i !== index)
                                setEditedCondition({ ...editedCondition, notes: updatedNotes })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            value={note.content}
                            onChange={(e) => {
                              const updatedNotes = [...editedCondition.notes]
                              updatedNotes[index] = { ...note, content: e.target.value }
                              setEditedCondition({ ...editedCondition, notes: updatedNotes })
                            }}
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(note.date).toLocaleDateString()} by {note.author}
                          </p>
                          <p>{note.content}</p>
                        </>
                      )}
                    </div>
                  ))}

                  {isEditing && (
                    <div className="p-4 border border-dashed rounded-md">
                      <h4 className="text-sm font-medium mb-3">Add New Note</h4>
                      <Textarea
                        placeholder="Enter progress note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <div className="flex justify-end mt-3">
                        <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                          <Plus className="h-4 w-4 mr-1" /> Add Note
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-1" /> Edit Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Medical Record Modal */}
      <Dialog open={isNewDiagnosisModalOpen} onOpenChange={setIsNewDiagnosisModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl">
                Add New Medical Condition
              </DialogTitle>
            </div>
            <DialogDescription>
              Enter details for the new medical condition
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Overview Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" /> Overview
              </h3>

              <div>
                <Label>Condition Name</Label>
                <Input
                  value={newDiagnosis.name}
                  onChange={(e) => setNewDiagnosis({ ...newDiagnosis, name: e.target.value })}
                  className="mt-1"
                  placeholder="e.g., Hypertension, Type 2 Diabetes"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Severity</Label>
                  <Select
                    value={newDiagnosis.severity}
                    onValueChange={(value) => setNewDiagnosis({ ...newDiagnosis, severity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={newDiagnosis.status}
                    onValueChange={(value) => setNewDiagnosis({ ...newDiagnosis, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="recurring">Recurring</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newDiagnosis.description}
                  onChange={(e) => setNewDiagnosis({ ...newDiagnosis, description: e.target.value })}
                  className="mt-1"
                  placeholder="Detailed description of the condition"
                />
              </div>

              <div>
                <Label>Treatment Plan</Label>
                <Textarea
                  value={newDiagnosis.treatment}
                  onChange={(e) => setNewDiagnosis({ ...newDiagnosis, treatment: e.target.value })}
                  className="mt-1"
                  placeholder="Outline the treatment approach"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Diagnosed Date</Label>
                  <Input
                    type="date"
                    value={newDiagnosis.diagnosedDate}
                    onChange={(e) => setNewDiagnosis({ ...newDiagnosis, diagnosedDate: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Next Checkup</Label>
                  <Input
                    value={newDiagnosis.nextCheckup}
                    onChange={(e) => setNewDiagnosis({ ...newDiagnosis, nextCheckup: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., In 3 months, As needed"
                  />
                </div>

                <div>
                  <Label>Diagnosed By</Label>
                  <Input
                    value={newDiagnosis.diagnosedBy}
                    onChange={(e) => setNewDiagnosis({ ...newDiagnosis, diagnosedBy: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Symptoms Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" /> Symptoms
              </h3>

              <div className="space-y-2">
                {newDiagnosis.symptoms.map((symptom, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={symptom}
                      onChange={(e) => {
                        const updatedSymptoms = [...newDiagnosis.symptoms];
                        updatedSymptoms[index] = e.target.value;
                        setNewDiagnosis({ ...newDiagnosis, symptoms: updatedSymptoms });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSymptomFromDiagnosis(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add new symptom"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSymptom.trim()) {
                        handleAddSymptomToDiagnosis();
                        e.preventDefault();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddSymptomToDiagnosis}
                    disabled={!newSymptom.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Medications Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Pill className="h-5 w-5 mr-2 text-primary" /> Medications
              </h3>

              <div className="space-y-4">
                {newDiagnosis.medications.map((medication, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Medication Name</Label>
                        <Input
                          value={medication.name}
                          onChange={(e) => {
                            const updatedMedications = [...newDiagnosis.medications];
                            updatedMedications[index] = { ...medication, name: e.target.value };
                            setNewDiagnosis({ ...newDiagnosis, medications: updatedMedications });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Dosage</Label>
                        <Input
                          value={medication.dosage}
                          onChange={(e) => {
                            const updatedMedications = [...newDiagnosis.medications];
                            updatedMedications[index] = { ...medication, dosage: e.target.value };
                            setNewDiagnosis({ ...newDiagnosis, medications: updatedMedications });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Frequency</Label>
                        <Input
                          value={medication.frequency}
                          onChange={(e) => {
                            const updatedMedications = [...newDiagnosis.medications];
                            updatedMedications[index] = { ...medication, frequency: e.target.value };
                            setNewDiagnosis({ ...newDiagnosis, medications: updatedMedications });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={medication.startDate}
                          onChange={(e) => {
                            const updatedMedications = [...newDiagnosis.medications];
                            updatedMedications[index] = { ...medication, startDate: e.target.value };
                            setNewDiagnosis({ ...newDiagnosis, medications: updatedMedications });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>End Date (if applicable)</Label>
                        <Input
                          type="date"
                          value={medication.endDate || ""}
                          onChange={(e) => {
                            const updatedMedications = [...newDiagnosis.medications];
                            updatedMedications[index] = { ...medication, endDate: e.target.value || null };
                            setNewDiagnosis({ ...newDiagnosis, medications: updatedMedications });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const updatedMedications = newDiagnosis.medications.filter((_, i) => i !== index);
                            setNewDiagnosis({ ...newDiagnosis, medications: updatedMedications });
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 border border-dashed rounded-md">
                  <h4 className="text-sm font-medium mb-3">Add New Medication</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Medication Name</Label>
                      <Input
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Dosage</Label>
                      <Input
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Input
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newMedication.startDate}
                        onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-2">
                      <Button
                        onClick={() => {
                          if (newMedication.name && newMedication.dosage && newMedication.frequency && newMedication.startDate) {
                            setNewDiagnosis({
                              ...newDiagnosis,
                              medications: [...newDiagnosis.medications, newMedication]
                            });
                            setNewMedication({ name: "", dosage: "", frequency: "", startDate: "", endDate: "" });
                          }
                        }}
                        disabled={
                          !newMedication.name ||
                          !newMedication.dosage ||
                          !newMedication.frequency ||
                          !newMedication.startDate
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Medication
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Readings/Measurements Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" /> Readings & Measurements
              </h3>

              <div className="space-y-3">
                {newDiagnosis.readings.map((reading, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={reading.date}
                          onChange={(e) => {
                            const updatedReadings = [...newDiagnosis.readings];
                            updatedReadings[index] = { ...reading, date: e.target.value };
                            setNewDiagnosis({ ...newDiagnosis, readings: updatedReadings });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Value</Label>
                        <Input
                          value={reading.value}
                          onChange={(e) => {
                            const updatedReadings = [...newDiagnosis.readings];
                            updatedReadings[index] = { ...reading, value: e.target.value };
                            setNewDiagnosis({ ...newDiagnosis, readings: updatedReadings });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Input
                          value={reading.notes}
                          onChange={(e) => {
                            const updatedReadings = [...newDiagnosis.readings];
                            updatedReadings[index] = { ...reading, notes: e.target.value };
                            setNewDiagnosis({ ...newDiagnosis, readings: updatedReadings });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-3 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            const updatedReadings = newDiagnosis.readings.filter((_, i) => i !== index);
                            setNewDiagnosis({ ...newDiagnosis, readings: updatedReadings });
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 border border-dashed rounded-md">
                  <h4 className="text-sm font-medium mb-3">Add New Reading</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newReading.date}
                        onChange={(e) => setNewReading({ ...newReading, date: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={newReading.value}
                        onChange={(e) => setNewReading({ ...newReading, value: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., 140/90, HbA1c: 7.2%"
                      />
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Input
                        value={newReading.notes}
                        onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                        className="mt-1"
                        placeholder="Optional notes"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end mt-2">
                      <Button
                        onClick={() => {
                          if (newReading.date && newReading.value) {
                            setNewDiagnosis({
                              ...newDiagnosis,
                              readings: [...newDiagnosis.readings, newReading]
                            });
                            setNewReading({ date: "", value: "", notes: "" });
                          }
                        }}
                        disabled={!newReading.date || !newReading.value}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Reading
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Lab Results Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" /> Lab Results
              </h3>

              <div className="space-y-3">
                {newDiagnosis.labResults.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={result.date}
                          onChange={(e) => setNewLabResult({ ...newLabResult, notes: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Test Name</Label>
                        <Input
                          value={result.name}
                          onChange={(e) => setNewLabResult({ ...newLabResult, notes: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Result</Label>
                        <Select
                          value={result.result}
                          onValueChange={(value) => setNewLabResult({ ...newLabResult, result: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select result" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Abnormal">Abnormal</SelectItem>
                            <SelectItem value="Positive">Positive</SelectItem>
                            <SelectItem value="Negative">Negative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Input
                          value={result.notes}
                          onChange={(e) => setNewLabResult({ ...newLabResult, notes: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            console.log(newLabResult)
                            if (newLabResult.date && newLabResult.name && newLabResult.result) {
                              setNewDiagnosis({
                                ...newDiagnosis,
                                readings: [...newDiagnosis.readings, newLabResult]
                              });
                              setNewLabResult({ date: "", name: "", result: "", notes: "" });
                            }
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-4 border border-dashed rounded-md">
                  <h4 className="text-sm font-medium mb-3">Add New Lab Result</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        className="mt-1"
                        id="new-lab-date"
                        onChange={(e) => setNewLabResult({ ...newLabResult, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Test Name</Label>
                      <Input
                        placeholder="e.g., Blood Glucose, Lipid Panel"
                        className="mt-1"
                        onChange={(e) => setNewLabResult({ ...newLabResult, name: e.target.value })}
                        id="new-lab-name"
                      />
                    </div>
                    <div>
                      <Label>Result</Label>
                      <Select
                        value={newLabResult.result || ""}
                        onValueChange={(value) => setNewLabResult({ ...newLabResult, result: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Abnormal">Abnormal</SelectItem>
                          <SelectItem value="Positive">Positive</SelectItem>
                          <SelectItem value="Negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Input
                        placeholder="Additional details about the result"
                        className="mt-1"
                        onChange={(e) => setNewLabResult({ ...newLabResult, notes: e.target.value })}
                        id="new-lab-notes"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-2">
                      <Button
                        onClick={() => {
                          console.log(newLabResult)
                          if (newLabResult.date && newLabResult.name && newLabResult.result) {
                            setNewDiagnosis({
                              ...newDiagnosis,
                              labResults: [...newDiagnosis.labResults, newLabResult]
                            });
                            console.log(newDiagnosis)
                            setNewLabResult({ date: "", name: "", result: "", notes: "" });
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Lab Result
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Initial Note Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <History className="h-5 w-5 mr-2 text-primary" /> Initial Note
              </h3>

              <div className="p-4 border border-dashed rounded-md">
                <h4 className="text-sm font-medium mb-3">Add Initial Diagnostic Note</h4>
                <Textarea
                  placeholder="Enter initial diagnostic note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This note will be added to the medical record with today's date.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsNewDiagnosisModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {

                setNewDiagnosis({
                  ...newDiagnosis,
                  notes: [...newDiagnosis.notes, newNote]
                });
                setNewNote("")
                handleSaveNewDiagnosis()
              }}
              disabled={!newDiagnosis.name || !newDiagnosis.description}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Medical Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
