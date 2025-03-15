"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  FileText,
  Download,
  Printer,
  Plus,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  File,
  Image,
  FileArchive,
  Upload,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/utils/supabase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { v4 as uuidv4 } from 'uuid'
import { Progress } from "@/components/ui/progress"

interface MedicalReport {
  id: number
  created_at: string
  type: string | null
  summary: string | null
  user_id: string | null
  file_path?: string
  file_name?: string
  file_type?: string
  file_size?: string
  file_url?: string
}

interface PatientReportsProps {
  patient: any
}

export function PatientReports({ patient }: PatientReportsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null)
  const [expandedReport, setExpandedReport] = useState<number | null>(null)
  const [addReportDialogOpen, setAddReportDialogOpen] = useState(false)
  const [editReportDialogOpen, setEditReportDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // New report form state
  const [reportType, setReportType] = useState("")
  const [reportSummary, setReportSummary] = useState("")
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([])
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('medical_report')
        .select('*')
        .eq("user_id", patient.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error("Error fetching reports:", error)
        throw error
      }
      
      setMedicalReports(data || [])
    } catch (err) {
      console.error("Failed to fetch medical reports:", err)
    } finally {
      setIsLoading(false)
    }
  }
  
  useEffect(() => {
    fetchReports()
  }, [patient.id])
  
  const filteredReports = medicalReports.filter((report) => {
    return (
      (report.type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (report.summary?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (report.file_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleFileUpload = async (reportId?: number) => {
    if (!selectedFile) return
    
    setUploading(true)
    setError("")
    
    try {
      // Generate a unique filename
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${patient.id}/medical_reports/${fileName}`
      
      // Start tracking progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        if (progress <= 90) {
          setUploadProgress(progress)
        }
      }, 300)
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('medspectra')
        .upload(filePath, selectedFile)
        
      if (storageError) throw storageError
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('medspectra')
        .getPublicUrl(filePath)
        
      clearInterval(interval)
      setUploadProgress(100)
      
      // If this is for an existing report (edit mode)
      if (reportId) {
        // Update the report with file information
        const { error } = await supabase
          .from('medical_report')
          .update({
            file_path: filePath,
            file_name: selectedFile.name,
            file_type: selectedFile.type,
            file_size: formatFileSize(selectedFile.size),
            file_url: urlData?.publicUrl
          })
          .eq('id', reportId)
          
        if (error) throw error
      }
      
      // Reset file input
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
      
      return {
        filePath,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: formatFileSize(selectedFile.size),
        fileUrl: urlData?.publicUrl
      }
      
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "Failed to upload file")
      setUploading(false)
      setUploadProgress(0)
      return null
    }
  }

  const handleDeleteFile = async (reportId: number) => {
    const report = medicalReports.find(r => r.id === reportId)
    if (!report || !report.file_path) return
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('medical_files')
        .remove([report.file_path])
        
      if (storageError) throw storageError
      
      // Update the report to remove file information
      const { error } = await supabase
        .from('medical_report')
        .update({
          file_path: null,
          file_name: null,
          file_type: null,
          file_size: null,
          file_url: null
        })
        .eq('id', reportId)
        
      if (error) throw error
      
      // Refresh reports
      await fetchReports()
      
    } catch (err: any) {
      console.error("Delete file error:", err)
      setError(err.message || "Failed to delete file")
    }
  }

  const handleAddReport = async () => {
    setIsLoading(true)
    try {
      let fileData = null
      
      // Upload file first if selected
      if (selectedFile) {
        fileData = await handleFileUpload()
        if (!fileData && selectedFile) {
          // If file upload failed but was attempted, stop the process
          setIsLoading(false)
          return
        }
      }
      
      const { data, error } = await supabase
        .from('medical_report')
        .insert([
          { 
            created_at: new Date().toISOString(),
            type: reportType,
            summary: reportSummary,
            user_id: patient.id,
            ...(fileData ? {
              file_path: fileData.filePath,
              file_name: fileData.fileName,
              file_type: fileData.fileType,
              file_size: fileData.fileSize,
              file_url: fileData.fileUrl
            } : {})
          },
        ])
        .select()
      
      if (error) {
        console.error("Error adding report:", error)
        throw error
      }
      
      // Refresh the reports list
      await fetchReports()
      
      // Reset form and close dialog
      setReportType("")
      setReportSummary("")
      setSelectedFile(null)
      setAddReportDialogOpen(false)
      
      // Show success message
      alert("Report added successfully")
    } catch (err) {
      console.error("Failed to add medical report:", err)
      alert("Failed to add report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleEditReport = async () => {
    if (!selectedReport) return
    
    setIsLoading(true)
    try {
      let fileData = null
      
      // Upload file first if selected
      if (selectedFile) {
        fileData = await handleFileUpload(selectedReport.id)
        if (!fileData && selectedFile) {
          // If file upload failed but was attempted, stop the process
          setIsLoading(false)
          return
        }
      }
      
      const { data, error } = await supabase
        .from('medical_report')
        .update({
          type: reportType,
          summary: reportSummary,
          // Only update file fields if a new file was uploaded
          ...(fileData ? {
            file_path: fileData.filePath,
            file_name: fileData.fileName,
            file_type: fileData.fileType,
            file_size: fileData.fileSize,
            file_url: fileData.fileUrl
          } : {})
        })
        .eq('id', selectedReport.id)
        .select()
      
      if (error) {
        console.error("Error updating report:", error)
        throw error
      }
      
      // Refresh the reports list
      await fetchReports()
      
      // Reset form and close dialog
      setReportType("")
      setReportSummary("")
      setSelectedFile(null)
      setSelectedReport(null)
      setEditReportDialogOpen(false)
      
      // Show success message
      alert("Report updated successfully")
    } catch (err) {
      console.error("Failed to update medical report:", err)
      alert("Failed to update report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDeleteReport = async () => {
    if (!selectedReport) return
    
    setIsLoading(true)
    try {
      // Delete the file from storage if it exists
      if (selectedReport.file_path) {
        const { error: storageError } = await supabase.storage
          .from('medical_files')
          .remove([selectedReport.file_path])
          
        if (storageError) {
          console.error("Error deleting file:", storageError)
          // Continue with report deletion even if file deletion fails
        }
      }
      
      // Delete the report from the database
      const { error } = await supabase
        .from('medical_report')
        .delete()
        .eq('id', selectedReport.id)
      
      if (error) {
        console.error("Error deleting report:", error)
        throw error
      }
      
      // Refresh the reports list
      await fetchReports()
      
      // Reset state and close dialog
      setSelectedReport(null)
      setDeleteDialogOpen(false)
      
      // Show success message
      alert("Report deleted successfully")
    } catch (err) {
      console.error("Failed to delete medical report:", err)
      alert("Failed to delete report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (report: MedicalReport) => {
    setSelectedReport(report)
    setReportType(report.type || "")
    setReportSummary(report.summary || "")
    setEditReportDialogOpen(true)
  }

  const openDeleteDialog = (report: MedicalReport) => {
    setSelectedReport(report)
    setDeleteDialogOpen(true)
  }

  const toggleExpandReport = (reportId: number) => {
    setExpandedReport(expandedReport === reportId ? null : reportId)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />
    } else if (fileType.includes('image')) {
      return <Image className="h-8 w-8 text-blue-500" />
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return <FileArchive className="h-8 w-8 text-yellow-500" />
    } else if (fileType.includes('doc') || fileType.includes('word')) {
      return <File className="h-8 w-8 text-blue-700" />
    } else {
      return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download file. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
          <div>
            <CardTitle>Medical Reports</CardTitle>
            <CardDescription>View and manage test results and medical reports</CardDescription>
          </div>
          <Dialog open={addReportDialogOpen} onOpenChange={setAddReportDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Report</DialogTitle>
                <DialogDescription>Enter the details of the new medical report</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blood Test">Blood Test</SelectItem>
                      <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                      <SelectItem value="X-Ray">X-Ray</SelectItem>
                      <SelectItem value="MRI">MRI</SelectItem>
                      <SelectItem value="CT Scan">CT Scan</SelectItem>
                      <SelectItem value="Echocardiogram">Echocardiogram</SelectItem>
                      <SelectItem value="EKG">EKG</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="Enter a brief summary of the report..."
                    value={reportSummary}
                    onChange={(e) => setReportSummary(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="file">Attach Report File (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="file" 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    {selectedFile && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Uploading: {uploadProgress}%
                      </p>
                    </div>
                  )}
                  {error && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {error}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAddReportDialogOpen(false)
                    setSelectedFile(null)
                    setError("")
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  disabled={isLoading || uploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddReport} 
                  disabled={!reportType || !reportSummary || isLoading || uploading}
                >
                  {isLoading || uploading ? "Saving..." : "Save Report"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative w-full max-w-sm mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reports..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading && medicalReports.length === 0 ? (
            <div className="flex justify-center py-8">
              <p>Loading reports...</p>
            </div>
          ) : filteredReports.length > 0 ? (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="cursor-pointer" onClick={() => toggleExpandReport(report.id)}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">{report.type}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {report.type}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(report);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(report);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleExpandReport(report.id)}
                        >
                          {expandedReport === report.id ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="mt-2">{report.summary}</p>
                    
                    {/* Show file information if available */}
                    {report.file_name && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {report.file_type && getFileIcon(report.file_type)}
                          <div>
                            <p className="font-medium text-sm">{report.file_name}</p>
                            <p className="text-xs text-muted-foreground">{report.file_size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.file_url && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadFile(report.file_url!, report.file_name!)}
                            >
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteFile(report.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {expandedReport === report.id && (
                    <div className="border-t px-4 py-3">
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </Button>
                        {report.file_url ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadFile(report.file_url!, report.file_name!)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <Download className="mr-2 h-4 w-4" />
                            No File
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">No reports found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? "Try adjusting your search criteria" : "Add medical reports to get started"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setAddReportDialogOpen(true)} variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Report
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Report Dialog */}
      <Dialog open={editReportDialogOpen} onOpenChange={setEditReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>Update the details of this medical report</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="edit-report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blood Test">Blood Test</SelectItem>
                  <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                  <SelectItem value="X-Ray">X-Ray</SelectItem>
                  <SelectItem value="MRI">MRI</SelectItem>
                  <SelectItem value="CT Scan">CT Scan</SelectItem>
                  <SelectItem value="Echocardiogram">Echocardiogram</SelectItem>
                  <SelectItem value="EKG">EKG</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-summary">Summary</Label>
              <Textarea
                id="edit-summary"
                placeholder="Enter a brief summary of the report..."
                value={reportSummary}
                onChange={(e) => setReportSummary(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-file">
                {selectedReport?.file_name ? "Replace File" : "Attach File"} (Optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="edit-file" 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setSelectedFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Show current file if exists */}
              {selectedReport?.file_name && !selectedFile && (
                <div className="p-3 bg-gray-50 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedReport.file_type && getFileIcon(selectedReport.file_type)}
                    <div>
                      <p className="font-medium text-sm">{selectedReport.file_name}</p>
                      <p className="text-xs text-muted-foreground">{selectedReport.file_size}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteFile(selectedReport.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Show selected file */}
              {selectedFile && (
                <div className="text-sm text-muted-foreground">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
              
              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
              
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {error}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditReportDialogOpen(false)
                setSelectedFile(null)
                setError("")
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              disabled={isLoading || uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditReport} 
              disabled={!reportType || !reportSummary || isLoading || uploading}
            >
              {isLoading || uploading ? "Saving..." : "Update Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this medical report
              {selectedReport?.file_name ? " and its associated file" : ""}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteReport}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
