"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { v4 as uuidv4 } from "uuid";
import {
  Upload,
  File,
  FileText,
  Image,
  FileArchive,
  Download,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import { supabase } from "@/utils/supabase";

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

export function FileUpload() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Function to fetch files from Supabase
  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Fetch files from the database
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('patient_id', user.id)
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
          uploadDate: new Date().toISOString(),
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

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError("");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      // Generate a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${selectedCategory}/${fileName}`;
      
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
            patient_id: user.id,
            category: selectedCategory,
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
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      clearInterval(interval);
      setUploadProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
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
        return <FileText className="h-8 w-8 text-red-500" />;
      case "image":
        return <Image className="h-8 w-8 text-blue-500" />;
      case "document":
        return <File className="h-8 w-8 text-blue-700" />;
      case "archive":
        return <FileArchive className="h-8 w-8 text-yellow-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Medical Files</CardTitle>
          <CardDescription>
            Upload your medical documents, test results, or imaging files. Supported formats: PDF, JPG, PNG, DOCX, ZIP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="file">Select File</Label>
              <Input 
                id="file" 
                type="file" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                onChange={(e) => setSelectedCategory(e.target.value)}
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="lab-results">Lab Results</option>
                <option value="imaging">Imaging</option>
                <option value="medical-records">Medical Records</option>
                <option value="prescriptions">Prescriptions</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Button 
              type="button" 
              onClick={handleFileUpload} 
              disabled={uploading || !selectedFile}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
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
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Files</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading files...</span>
              </div>
            ) : (
              <>
                {files.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 p-4">
                    {files.map((file) => (
                      <Card key={file.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex items-center p-4">
                            <div className="mr-4">{getFileIcon(file.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium truncate">{file.name}</h3>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <span>{file.size}</span>
                                <span className="mx-2">•</span>
                                <span>{file.category}</span>
                                <span className="mx-2">•</span>
                                <span>Uploaded on {new Date(file.uploadDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex border-t">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1 rounded-none py-2 h-auto"
                              onClick={() => file.url && window.open(file.url, "_blank")}
                              disabled={!file.url}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-1 rounded-none py-2 h-auto border-l"
                              onClick={() => file.url && window.open(file.url, "_blank")}
                              disabled={!file.url}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 rounded-none py-2 h-auto border-l text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteFile(file.id, file.path)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No files found</p>
                    <p className="text-sm text-muted-foreground">
                      Upload your first medical file to get started.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
