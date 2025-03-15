"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, UserCheck, UserX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/utils/supabase";

// Define types for our data
interface PatientRequest {
  id: number;
  name: string;
  email: string;
  gender: string;
  age: number;
  image: string;
  requestDate: string;
  reason: string;
  medicalConditions: string[] | string;
  status: string;
  patientId: string;
}

export function PatientRequests() {
  const [patientRequests, setPatientRequests] = useState<PatientRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PatientRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRequests();
  }, []);

  const getRequests = async () => {
    try {
      setIsLoading(true);
      
      // Step 1: Get connections for this doctor
      const { data: connections, error: connectionsError } = await supabase
        .from('connection')
        .select("*")
        .eq("status", "pending")
        .eq("doctor_id", "8e4cd7e3-db41-4f1a-bafe-77bcb7efe6a4");
      
      if (connectionsError) throw connectionsError;
      if (!connections || connections.length === 0) {
        setPatientRequests([]);
        return;
      }
      console.log("con",connections)
      // Step 2: Get user data for each patient
      const patientIds = connections.map(conn => conn.patient_id);
      console.log("patientIDS",patientIds)
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select("*")
        .in("supabase_id", patientIds);
      console.log("@userDATA" , userData)
      if (userError) throw userError;
      
      // Step 3: Combine the data
      const formattedRequests: PatientRequest[] = connections.map(connection => {
        // Find the matching user data
        const user = userData?.find(u => u.supabase_id === connection.patient_id) || {};
        console.log("@@@@@@@USEZSR",user)
        return {
          id: connection.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Unknown Patient",
          email: user.email || "",
          gender: user.gender || "Not specified",
          age: connection.age || 0,
          image: user.image_url || "/placeholder.svg?height=100&width=100",
          requestDate: connection.created_at || new Date().toISOString(),
          reason: connection.reason || "No reason provided",
          medicalConditions: connection.medical_conditions || [],
          status: connection.status || "pending",
          patientId: connection.patient_id,
        };
      });
      
      setPatientRequests(formattedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredRequests = patientRequests.filter((request) => {
    return (
      request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAcceptRequest = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('connection')
        .update({ 
          status: 'accepted',
          response_date: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Update the local state to reflect the change
      setPatientRequests(prevRequests => 
        prevRequests.filter(request => request.id !== id)
      );
      
      setViewDialogOpen(false);
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleRejectRequest = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('connection')
        .update({ 
          status: 'declined',
          rejection_reason: rejectionReason,
          response_date: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Update the local state to reflect the change
      setPatientRequests(prevRequests => 
        prevRequests.filter(request => request.id !== id)
      );
      
      setRejectionReason("");
      setRejectDialogOpen(false);
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Patient Connection Requests</CardTitle>
          <CardDescription>Review and manage patient requests to connect with you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="pl-8 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredRequests.length} pending requests
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarImage src={request.image} alt={request.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {request.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{request.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.age} years, {request.gender}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Requested on {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-200"
                        onClick={() => {
                          setSelectedRequest(request);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        onClick={() => {
                          setSelectedRequest(request);
                          setRejectDialogOpen(true);
                        }}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredRequests.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <UserCheck className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">No pending requests</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You don't have any pending patient connection requests
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Request Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Patient Request Details</DialogTitle>
            <DialogDescription>Review the patient's connection request</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 border border-gray-200">
                  <AvatarImage src={selectedRequest.image} alt={selectedRequest.name} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {selectedRequest.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedRequest.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedRequest.age} years, {selectedRequest.gender}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Request Reason</h4>
                  <p className="mt-1">{selectedRequest.reason}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Medical Conditions</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {typeof selectedRequest.medicalConditions === "string"
                      ? selectedRequest.medicalConditions
                          .split(",")
                          .map((condition, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {condition.trim()}
                            </Badge>
                          ))
                      : Array.isArray(selectedRequest.medicalConditions)
                      ? selectedRequest.medicalConditions.map((condition, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {condition}
                          </Badge>
                        ))
                      : null}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Request Date</h4>
                  <p className="mt-1">{new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() => {
                  setViewDialogOpen(false);
                  setRejectDialogOpen(true);
                }}
              >
                <UserX className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => selectedRequest && handleAcceptRequest(selectedRequest.id)}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Accept Request
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Request Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Patient Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this patient's connection request.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="flex items-center gap-4 py-4">
              <Avatar className="h-12 w-12 border border-gray-200">
                <AvatarImage src={selectedRequest.image} alt={selectedRequest.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedRequest.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{selectedRequest.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.age} years, {selectedRequest.gender}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="rejection-reason" className="text-sm font-medium">
                Reason for Declining
              </label>
              <Textarea
                id="rejection-reason"
                className="min-h-[100px]"
                placeholder="Please provide a reason for declining this patient request..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleRejectRequest(selectedRequest.id)}
              disabled={!rejectionReason.trim()}
            >
              <UserX className="mr-2 h-4 w-4" />
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
