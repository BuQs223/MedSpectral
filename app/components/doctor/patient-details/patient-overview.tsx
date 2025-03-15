"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  CalendarClock,
  Phone,
  Mail,
  MapPin,
  User,
  Shield,
  Activity,
  Thermometer,
  HeartPulse,
  TreesIcon as Lungs,
} from "lucide-react"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react"

interface PatientOverviewProps {
  patient: any
}
interface MedicalCondition {
  name: string;
  status: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate: string | null;
  }>;
}

export function PatientOverview({ patient }: PatientOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column - Personal Information */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Patient demographics and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-28 w-28 mb-4">
                <AvatarImage src={patient.image} alt={patient.name} />
                <AvatarFallback className="text-2xl">
                  {patient.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <p className="text-sm text-muted-foreground">
                {patient.age} years • {patient.gender} • {patient.bloodType}
              </p>

            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <CalendarClock className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p>{new Date(patient.birthDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{patient.phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p>{patient.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p>{patient.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>Who to contact in case of emergency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p>{patient.emergencyContact.name}</p>
                </div>
              </div>

              <div className="flex items-start">
                <User className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Relationship</p>
                  <p>{patient.emergencyContact.relationship}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p>{patient.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Insurance Information</CardTitle>
            <CardDescription>Patient coverage details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Provider</p>
                  <p>{patient.insurance.provider}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Shield className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Policy Number</p>
                  <p>{patient.insurance.policyNumber}</p>
                </div>
              </div>

              <div className="flex items-start">
                <CalendarClock className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                  <p>{new Date(patient.insurance.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle column - Medical Information */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Medical Information</CardTitle>
            <CardDescription>Allergies, conditions, and medications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Allergies</h3>
                {patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy: string) => (
                      <Badge key={allergy} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No known allergies</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Medical Conditions</h3>
                {patient.medicalConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalConditions.map((condition: MedicalCondition) => (
                      <Badge
                        key={condition.name}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {condition.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No medical conditions</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Current Medications</h3>
                {patient.medicalConditions.length > 0 ? (
                  <div className="space-y-3">
                    {patient.medicalConditions.flatMap((condition: { medications: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; dosage: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; frequency: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; startDate: string | number | Date }[]; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined }, conditionIndex: number) =>
                      condition.medications.map((medication: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; dosage: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; frequency: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; startDate: string | number | Date }, medicationIndex: number) => (
                        <div key={`${conditionIndex}-${medicationIndex}`} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex justify-between">
                            <p className="font-medium">{medication.name}</p>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {condition.name}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {medication.dosage} • {medication.frequency}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Started: {new Date(medication.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No current medications</p>
                )}


              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Latest Vital Signs</CardTitle>
            <CardDescription>Recorded on {new Date(patient.visits[0].date).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center mb-1">
                  <Activity className="h-4 w-4 mr-2 text-blue-600" />
                  <p className="text-sm font-medium">Blood Pressure</p>
                </div>
                <p className="text-xl font-medium">{patient.visits[0].vitalSigns.bloodPressure}</p>
                <p className="text-xs text-muted-foreground">mmHg</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center mb-1">
                  <HeartPulse className="h-4 w-4 mr-2 text-red-600" />
                  <p className="text-sm font-medium">Heart Rate</p>
                </div>
                <p className="text-xl font-medium">{patient.visits[0].vitalSigns.heartRate}</p>
                <p className="text-xs text-muted-foreground">bpm</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center mb-1">
                  <Thermometer className="h-4 w-4 mr-2 text-amber-600" />
                  <p className="text-sm font-medium">Temperature</p>
                </div>
                <p className="text-xl font-medium">{patient.visits[0].vitalSigns.temperature}</p>
                <p className="text-xs text-muted-foreground">°F</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-center mb-1">
                  <Lungs className="h-4 w-4 mr-2 text-green-600" />
                  <p className="text-sm font-medium">Respiratory Rate</p>
                </div>
                <p className="text-xl font-medium">{patient.visits[0].vitalSigns.respiratoryRate}</p>
                <p className="text-xs text-muted-foreground">breaths/min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column - Recent Activity */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest visits and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Latest Visit</h3>
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{patient.visits[0].type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(patient.visits[0].date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {patient.visits[0].type}
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">{patient.visits[0].notes}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Latest Report</h3>
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{patient.reports[0].type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(patient.reports[0].date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {patient.reports[0].type}
                    </Badge>
                  </div>
                  <p className="text-sm mt-2">{patient.reports[0].summary}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Latest Uploaded File</h3>
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{patient.files[0].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(patient.files[0].uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {patient.files[0].category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {patient.files[0].type.toUpperCase()} • {patient.files[0].size}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Scheduled future visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-md border-dashed flex items-center justify-center">
              <div className="text-center">
                <CalendarClock className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming appointments</p>
                <button className="text-primary text-sm mt-2">Schedule appointment</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

