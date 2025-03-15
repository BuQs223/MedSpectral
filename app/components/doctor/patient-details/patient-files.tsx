"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  File,
  FileText,
  ImageIcon,
  FileArchive,
  Download,
  Eye,
  UploadCloud,
  Trash2,
  MoreHorizontal,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/utils/supabase"
import { v4 as uuidv4 } from "uuid"

interface PatientFilesProps {
  patient: any
}

// Helper functions from the first code
const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf'].includes(extension)) return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) return 'image';
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) return 'document';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
  
  return 'document';
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Define a type for our file data
type FileData = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
  url?: string;
  path?: string;
};

export function PatientFiles({ patient }: PatientFilesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileCategory, setFileCategory] = useState("")

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, [patient]);

  // Function to fetch files from Supabase
  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // For doctor view, use patient.id, for patient view use user.id
      const patientId = patient?.id || user.id;
      console.log("@patientid",patientId)
      // Fetch files from the database
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Transform the data to match our FileData type
        const transformedFiles: FileData[] = data.map(file => ({
          id: file.id,
          name: file.file_name,
          type: getFileType(file.file_name),
          size: typeof file.file_size === 'number' 
            ? formatFileSize(file.file_size) 
            : file.file_size,
          uploadDate: file.created_at || new Date().toISOString(),
          category: file.category,
          url: file.url,
          path: file.file_path
        }));

        setFiles(transformedFiles);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileCategory) return;
    
    setUploading(true);
    setError("");
    setUploadProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // For doctor view, use patient.id, for patient view use user.id
      const patientId = patient?.id || user.id;
      
      // Generate a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${patientId}/${fileCategory}/${fileName}`;
      
      // Start tracking progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          setUploadProgress(progress);
        }
      }, 300);
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('medspectra')
        .upload(filePath, selectedFile);
        
      if (storageError) throw storageError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('medspectra')
        .getPublicUrl(filePath);
        
      // Insert record in database
      const { data, error } = await supabase
        .from('files')
        .insert([
          { 
            patient_id: patientId,
            category: fileCategory,
            file_size: formatFileSize(selectedFile.size),
            file_name: selectedFile.name,
            file_type: selectedFile.type,
            file_path: filePath,
            url: urlData?.publicUrl,
            created_at: new Date().toISOString(),
          },
        ])
        .select();
        
      if (error) throw error;
      
      // Refresh the file list
      await fetchFiles();
      
      // Reset file input
      setSelectedFile(null);
      setFileCategory("");
      
      clearInterval(interval);
      setUploadProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        setUploadDialogOpen(false);
      }, 500);
      
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (fileId: string, filePath?: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      // Delete from storage if path exists
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('medspectra')
          .remove([filePath]);
          
        if (storageError) throw storageError;
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);
        
      if (dbError) throw dbError;
      
      // Update UI
      setFiles(files.filter(file => file.id !== fileId));
      
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete file");
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "image":
        return <ImageIcon className="h-8 w-8 text-blue-500" />
      case "document":
        return <File className="h-8 w-8 text-blue-700" />
      case "archive":
        return <FileArchive className="h-8 w-8 text-yellow-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || file.category.toLowerCase() === categoryFilter.toLowerCase()
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
          <div>
            <CardTitle>Medical Files</CardTitle>
            <CardDescription>View and manage patient documents</CardDescription>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Medical File</DialogTitle>
                <DialogDescription>Add a new medical file to the patient's records</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="file">File</Label>
                  <Input id="file" type="file" onChange={handleFileSelect} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={fileCategory} onValueChange={setFileCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lab Results">Lab Results</SelectItem>
                      <SelectItem value="Imaging">Imaging</SelectItem>
                      <SelectItem value="Records">Records</SelectItem>
                      <SelectItem value="Prescriptions">Prescriptions</SelectItem>
                      <SelectItem value="Consent Forms">Consent Forms</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!selectedFile || !fileCategory || uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>Upload</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setCategoryFilter}>
              <TabsList className="grid w-full grid-cols-4 h-10">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Lab Results">Lab Results</TabsTrigger>
                <TabsTrigger value="Imaging">Imaging</TabsTrigger>
                <TabsTrigger value="Records">Records</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading files...</span>
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="space-y-4">
              {filteredFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {file.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {file.size} • Uploaded on {new Date(file.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => file.url && window.open(file.url, "_blank")}
                      disabled={!file.url}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => file.url && window.open(file.url, "_blank")}
                      disabled={!file.url}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => file.url && window.open(file.url, "_blank")}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => file.url && window.open(file.url, "_blank")}>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteFile(file.id, file.path)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <File className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">No files found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Upload medical files to get started"}
              </p>
              {!searchTerm && categoryFilter === "all" && (
                <Button onClick={() => setUploadDialogOpen(true)} variant="outline" className="mt-4">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              )}
            </div>
          )}
          
          {error && !uploading && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
