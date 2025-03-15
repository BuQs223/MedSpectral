"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, MessageCircle, Calendar, AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase"

// Types for connection status
type ConnectionStatus = "pending" | "accepted" | "declined" | "none";

interface DoctorConnection {
  id: number
  name: string
  specialty: string
  image: string
  status: ConnectionStatus
  requestDate: string
  responseDate?: string
  rejection_reason?: string
}

export function ConnectionStatus() {
  const [connections, setConnections] = useState<DoctorConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch connections on component mount
  useEffect(() => {
    fetchConnections();
  }, []);

  // Function to fetch connections from Supabase
  const fetchConnections = async () => {
    try {
      setLoading(true);
      
      // Get current user (or use a hardcoded ID for testing)
      const { data: { user } } = await supabase.auth.getUser();
      
      // First, let's fetch the connections
      const { data: connectionData, error: connectionError } = await supabase
        .from('connection')
        .select('*')
        .eq('patient_id', user?.id);

      if (connectionError) throw connectionError;
      
      if (!connectionData || connectionData.length === 0) {
        setConnections([]);
        return;
      }

      // Now let's get the doctor information for each connection
      const doctorIds = connectionData.map(conn => conn.doctor_id).filter(Boolean);
      // Only fetch doctors if we have doctor IDs
      if (doctorIds.length > 0) {
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctor') // Adjust this to your actual doctor table name
          .select('*')
          .in('id', doctorIds);
          
        if (doctorError) throw doctorError;
        
        // Create a map of doctor data for easy lookup
        
        const doctorMap: any = {};
        if (doctorData) {
          doctorData.forEach((doctor: any) => {
            doctorMap[doctor.id] = doctor;
          });
        }
        // Transform the data to match our DoctorConnection type
        const transformedConnections: DoctorConnection[] = connectionData.map(conn => {
          const doctor = doctorMap[conn.doctor_id] || {};
          return {
            id: conn.id,
            name: doctor.name || "Unknown Doctor",
            specialty: doctor.speciality || "General Practice",
            image: doctor.profile_image || "",
            status: (conn.status as ConnectionStatus) || "none",
            requestDate: conn.created_at || "",
            responseDate: conn.response_date || undefined,
            rejection_reason: conn.rejection_reason || undefined,
          };
        });

        setConnections(transformedConnections);
      } else {
        setConnections([]);
      }
    } catch (err: any) {
      console.error("Error fetching connections:", err);
      setError(err.message || "Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  // Filter connections by status
  const pendingConnections = connections.filter((conn) => conn.status === "pending");
  const acceptedConnections = connections.filter((conn) => conn.status === "accepted");
  const deniedConnections = connections.filter((conn) => conn.status === "declined");

  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
            <Clock className="mr-1 h-3 w-3" /> Pending Approval
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50">
            <XCircle className="mr-1 h-3 w-3" /> Denied
          </Badge>
        )
      default:
        return null
    }
  }

  const getActionButtons = (connection: DoctorConnection) => {
    switch (connection.status) {
      case "accepted":
        return (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex-1">
              <MessageCircle className="mr-2 h-4 w-4" /> Message
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="mr-2 h-4 w-4" /> Schedule
            </Button>
          </div>
        )
      case "declined":
        return (
          <></>
        )
      case "pending":
        return (
          <div className="mt-4">
            <Button variant="outline" size="sm" disabled className="w-full">
              <Clock className="mr-2 h-4 w-4" /> Awaiting Response
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading connections...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-medium">Error loading connections</h3>
        <p className="mt-2 text-sm">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => fetchConnections()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Doctor Connection Status</CardTitle>
          <CardDescription>Track the status of your connection requests with doctors</CardDescription>
        </CardHeader>
        <CardContent>
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No connection requests</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't sent any connection requests to doctors yet.
              </p>
              <Button className="mt-4" variant="outline">
                Find a Doctor
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingConnections.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Pending Approvals</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pendingConnections.map((connection) => (
                      <div key={connection.id} className="border rounded-lg p-4 bg-amber-50/30">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border border-gray-200">
                            <AvatarImage src={connection.image} alt={connection.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {connection.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{connection.name}</div>
                            <div className="text-sm text-muted-foreground">{connection.specialty}</div>
                            <div className="mt-2">{getStatusBadge(connection.status)}</div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Requested on {new Date(connection.requestDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {getActionButtons(connection)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {acceptedConnections.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Approved Connections</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {acceptedConnections.map((connection) => (
                      <div key={connection.id} className="border rounded-lg p-4 bg-green-50/30">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border border-gray-200">
                            <AvatarImage src={connection.image} alt={connection.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {connection.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{connection.name}</div>
                            <div className="text-sm text-muted-foreground">{connection.specialty}</div>
                            <div className="mt-2">{getStatusBadge(connection.status)}</div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Approved on{" "}
                              {connection.responseDate ? new Date(connection.responseDate).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        </div>
                        {getActionButtons(connection)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {deniedConnections.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Denied Connections</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {deniedConnections.map((connection) => (
                      <div key={connection.id} className="border rounded-lg p-4 bg-red-50/30">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border border-gray-200">
                            <AvatarImage src={connection.image} alt={connection.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {connection.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{connection.name}</div>
                            <div className="text-sm text-muted-foreground">{connection.specialty}</div>
                            <div className="mt-2">{getStatusBadge(connection.status)}</div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Response on{" "}
                              {connection.responseDate ? new Date(connection.responseDate).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        </div>
                        {connection.rejection_reason && (
                          <div className="mt-3 text-sm p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="font-medium text-xs text-gray-500 mb-1">Message from doctor:</p>
                            <p>{connection.rejection_reason}</p>
                          </div>
                        )}
                        {getActionButtons(connection)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
