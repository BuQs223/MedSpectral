"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, FileText, FilePlus, Download, Calendar, ClipboardList, MoreHorizontal } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/utils/supabase"

// Mock data for medical records
const medicalRecordsData = [
  {
    id: 1,
    patientName: "John Doe",
    patientId: 1,
    patientImage: "/placeholder.svg?height=100&width=100",
    recordType: "Lab Results",
    title: "Blood Test Results",
    date: "2023-06-15",
    description: "Complete blood count and metabolic panel",
    files: [{ id: 1, name: "Blood Test Results.pdf", type: "pdf", size: "2.4 MB" }],
    notes: "Patient's cholesterol levels are slightly elevated. Recommended dietary changes and follow-up in 3 months.",
  },
  {
    id: 2,
    patientName: "Emma Thompson",
    patientId: 2,
    patientImage: "/placeholder.svg?height=100&width=100",
    recordType: "Imaging",
    title: "Chest X-Ray",
    date: "2023-06-20",
    description: "Routine chest X-ray examination",
    files: [{ id: 2, name: "Chest X-Ray.jpg", type: "image", size: "5.1 MB" }],
    notes: "No abnormalities detected. Lungs clear.",
  },
  {
    id: 3,
    patientName: "David Wilson",
    patientId: 3,
    patientImage: "/placeholder.svg?height=100&width=100",
    recordType: "Consultation",
    title: "Initial Consultation",
    date: "2023-03-12",
    description: "First visit for arthritis management",
    files: [],
    notes:
      "Patient presents with joint pain in knees and hands. Prescribed anti-inflammatory medication and physical therapy.",
  },
  {
    id: 4,
    patientName: "Sophia Garcia",
    patientId: 4,
    patientImage: "/placeholder.svg?height=100&width=100",
    recordType: "Prescription",
    title: "Migraine Medication",
    date: "2023-06-18",
    description: "Prescription for migraine management",
    files: [{ id: 3, name: "Prescription.pdf", type: "pdf", size: "0.9 MB" }],
    notes: "Prescribed sumatriptan for acute migraine attacks. Discussed triggers and preventive measures.",
  },
  {
    id: 5,
    patientName: "Michael Brown",
    patientId: 5,
    patientImage: "/placeholder.svg?height=100&width=100",
    recordType: "Imaging",
    title: "MRI Scan Results",
    date: "2023-06-10",
    description: "Lumbar spine MRI for lower back pain",
    files: [{ id: 4, name: "MRI Scan Results.zip", type: "archive", size: "12.6 MB" }],
    notes: "Mild disc bulging at L4-L5. Recommended physical therapy and core strengthening exercises.",
  },
  {
    id: 6,
    patientName: "Olivia Martinez",
    patientId: 6,
    patientImage: "/placeholder.svg?height=100&width=100",
    recordType: "Lab Results",
    title: "Bone Density Test",
    date: "2023-05-28",
    description: "DEXA scan for osteoporosis assessment",
    files: [{ id: 5, name: "Bone Density Results.pdf", type: "pdf", size: "1.8 MB" }],
    notes:
      "T-score of -2.2 indicates osteopenia. Recommended calcium and vitamin D supplements, weight-bearing exercises.",
  },
]

export  function MedicalRecords() {
  const [records, setRecords] = useState(medicalRecordsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [recordTypeFilter, setRecordTypeFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<(typeof medicalRecordsData)[0] | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [addRecordDialogOpen, setAddRecordDialogOpen] = useState(false)
  const uploadRecord = ()=>{
    
  }
  const uploadFile = async (file: File) => {
    const {data: {user}} =await supabase.auth.getUser()
    const { data, error } = await supabase.storage.from('medspectra').upload(user?.id + "/" + "TestName", file)
    return { data, error }
  }
  // Form state for adding new record
  const [newRecord, setNewRecord] = useState({
    patientId: "",
    recordType: "",
    title: "",
    description: "",
    notes: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  console.log(selectedFile)
  
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = recordTypeFilter === "all" || record.recordType === recordTypeFilter
    return matchesSearch && matchesType
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "image":
        return <Eye className="h-8 w-8 text-blue-500" />
      case "archive":
        return <FileText className="h-8 w-8 text-yellow-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const handleAddRecord = () => {

    if (selectedFile) {
      uploadFile(selectedFile)
    }
    // Reset form
    setNewRecord({
      patientId: "",
      recordType: "",
      title: "",
      description: "",
      notes: "",
    })
    setSelectedFile(null)
    setAddRecordDialogOpen(false)

    // Show success message
    alert("Medical record added successfully")
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>View and manage patient medical records</CardDescription>
          </div>
          <Button onClick={() => setAddRecordDialogOpen(true)}>
            <FilePlus className="mr-2 h-4 w-4" />
            Add New Record
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search records..."
                className="pl-8 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setRecordTypeFilter}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="Lab Results"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Lab Results
                </TabsTrigger>
                <TabsTrigger
                  value="Imaging"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Imaging
                </TabsTrigger>
                <TabsTrigger
                  value="Consultation"
                  className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  Consultations
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <Avatar className="h-10 w-10 border border-gray-200">
                    <AvatarImage src={record.patientImage} alt={record.patientName} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {record.patientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{record.title}</div>
                    <div className="text-sm text-muted-foreground">{record.patientName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-fit">
                    {record.recordType}
                  </Badge>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200"
                      onClick={() => {
                        setSelectedRecord(record)
                        setViewDialogOpen(true)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download Files</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Schedule Follow-up</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          <span>Edit Notes</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}

            {filteredRecords.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900">No records found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Record Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>Detailed information about the medical record</DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-gray-200">
                  <AvatarImage src={selectedRecord.patientImage} alt={selectedRecord.patientName} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedRecord.patientName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedRecord.patientName}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {selectedRecord.recordType}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedRecord.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Title</h4>
                <p className="mt-1 text-lg font-medium">{selectedRecord.title}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1">{selectedRecord.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Doctor's Notes</h4>
                <p className="mt-1">{selectedRecord.notes}</p>
              </div>

              {selectedRecord.files.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Files</h4>
                  <div className="space-y-2">
                    {selectedRecord.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="border-gray-200">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <ClipboardList className="mr-2 h-4 w-4" />
              Edit Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Record Dialog */}
      <Dialog open={addRecordDialogOpen} onOpenChange={setAddRecordDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Medical Record</DialogTitle>
            <DialogDescription>Create a new medical record for a patient</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="patient">Patient</Label>
                <Select
                  value={newRecord.patientId}
                  onValueChange={(value) => setNewRecord({ ...newRecord, patientId: value })}
                >
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">John Doe</SelectItem>
                    <SelectItem value="2">Emma Thompson</SelectItem>
                    <SelectItem value="3">David Wilson</SelectItem>
                    <SelectItem value="4">Sophia Garcia</SelectItem>
                    <SelectItem value="5">Michael Brown</SelectItem>
                    <SelectItem value="6">Olivia Martinez</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="record-type">Record Type</Label>
                <Select
                  value={newRecord.recordType}
                  onValueChange={(value) => setNewRecord({ ...newRecord, recordType: value })}
                >
                  <SelectTrigger id="record-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lab Results">Lab Results</SelectItem>
                    <SelectItem value="Imaging">Imaging</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="Procedure">Procedure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter record title"
                value={newRecord.title}
                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of the record"
                value={newRecord.description}
                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Doctor's Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter detailed medical notes"
                className="min-h-[100px]"
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file">Attach Files (optional)</Label>
              <Input id="file" type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              <p className="text-xs text-muted-foreground">
                Upload medical documents, test results, or imaging files. Supported formats: PDF, JPG, PNG, DOCX, ZIP.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRecordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRecord}
              disabled={!newRecord.patientId || !newRecord.recordType || !newRecord.title}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

