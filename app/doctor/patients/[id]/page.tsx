import { notFound } from "next/navigation"
import { PatientDetails } from "@/app/components/doctor/patient-details/patient-details"
import { supabase } from "@/utils/supabase"

async function getPatient(id: string) {
    // Fetch patient data from Supabase
    let { data: patientData, error: patientError } = await supabase
        .from('patient')
        .select('*')
        .eq("user_id", id)
        .single()

    // Fetch user data from Supabase
    let { data: userData, error: userError } = await supabase
        .from('user')
        .select('*')
        .eq("supabase_id", id)
        .single()

    let { data: emergencyContact, error: emergencyContactError } = await supabase
        .from('emergency_contact')
        .select('*')
        .eq("user_id", id)
        .single()

    let { data: currentMedications, error: currentMedicationError } = await supabase
        .from('current_medication')
        .select('*')
        .eq("user_id", id)

    let { data: pacientCheckup, error: pacientCheckupError } = await supabase
        .from('pacient_checkup')
        .select('*')
        .eq("user_id", id)

    let { data: pacientConditons, error: pacientConditonsError } = await supabase
        .from('pacient_diagnosis')
        .select('*')
        .eq("user_id", id)

    if (patientError || userError || !patientData || !userData) {
        console.error("Error fetching data:", patientError || userError)
        return null
    }

    // Parse allergies and medical conditions from comma-separated strings
    const allergies = patientData.allergies
        ? patientData.allergies.split(',').map((item: string) => item.trim())
        : []

    const medicalConditions = patientData.medical_conditions
        ? patientData.medical_conditions.split(',').map((item: string) => item.trim())
        : []


    interface Medication {
        name: string;
        dosage: string;
        frequency: string;
        startDate: string;
        endDate: string | null; // or string, depending on your requirements
    }
    // Calculate age from date of birth
    const birthDate = userData.date_of_birth ? new Date(userData.date_of_birth) : null
    const age = birthDate
        ? Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null
        const conditions = pacientConditons && pacientConditons.length > 0
        ? pacientConditons.map(condition => {
            // Parse the medications JSON string
            const medications: Medication[] = condition.medications ? JSON.parse(condition.medications) : [];

            return {
                name: condition.name,
                status: condition.status,
                medications: medications.map((med: Medication) => ({
                    name: med.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    startDate: med.startDate,
                    endDate: med.endDate
                }))
            };
        })
        : [];
    console.log(conditions)
    // Format medications - handle the case where it might be null or empty
    const medications = currentMedications && currentMedications.length > 0
        ? currentMedications.map(med => ({
            name: med.name || "Not specified",
            dosage: med.dosage || "Not specified",
            frequency: med.frequency || "Not specified",
            startDate: med.start_date || "Not specified",
            status: med.status || "Not Specified"
        }))
        : [
            {
                name: "No medication information available",
                dosage: "Not specified",
                frequency: "Not specified",
                startDate: "Not specified",
                status: "Not Specified"
            }
        ];

    const visits = pacientCheckup && pacientCheckup.length > 0
        ? pacientCheckup.map(visit => ({
            id: visit.id.toString(),
            date: visit.created_at ? new Date(visit.created_at).toISOString().split('T')[0] : "Unknown date",
            type: visit.type || "Check-up",
            notes: visit.notes || "No notes provided",
            vitalSigns: {
                bloodPressure: visit.blood_pressure || "Not recorded",
                heartRate: visit.heart_rate || "Not recorded",
                temperature: visit.temperature || "Not recorded",
                respiratoryRate: visit.respiratoryRate || "Not recorded",
            }
        }))
        : [
            {
                id: "v1",
                date: patientData.last_visit || "No recent visits",
                type: "Check-up",
                notes: "No visit records available",
                vitalSigns: {
                    bloodPressure: "Not recorded",
                    heartRate: "Not recorded",
                    temperature: "Not recorded",
                    respiratoryRate: "Not recorded",
                },
            }
        ];


    // Combine real data with mockup data
    return {
        id: id,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || "Unknown",
        email: userData.email || "No email provided",
        gender: userData.gender || "Not specified",
        age: age || 0,
        birthDate: birthDate ? birthDate.toISOString().split('T')[0] : "Unknown",
        phone: patientData.phone || "No phone provided",
        address: patientData.address || "No address provided",
        image: "/placeholder.svg?height=400&width=400", // Mockup
        status: userData.status || "active",
        insurance: {
            provider: "Blue Cross Blue Shield", // Mockup
            policyNumber: "BCBS-123456789", // Mockup
            expiryDate: "2024-12-31", // Mockup
        },
        emergencyContact: emergencyContact ? {
            name: emergencyContact.name || "Not provided",
            relationship: emergencyContact.relationship || "Not provided",
            phone: emergencyContact.phone || "Not provided",
        } : {
            name: "Not provided",
            relationship: "Not provided",
            phone: "Not provided",
        },
        allergies: Array.isArray(allergies) ? allergies : ["None listed"],
        bloodType: patientData.blood_type || "Unknown",
        medicalConditions : Array.isArray(conditions) ? conditions : ["None listed"],
        medications: medications,
        visits: visits,
        reports: [
            // Mockup data for reports
            {
                id: "r1",
                date: new Date().toISOString().split('T')[0],
                type: "Report",
                summary: "Report details not available in database",
                results: [
                    { name: "No results", value: "N/A", range: "N/A", flag: "N/A" },
                ],
                fileUrl: "#",
            },
        ],
        files: [
            // Mockup data for files
            {
                id: "f1",
                name: "No files available",
                type: "none",
                size: "0 KB",
                uploadDate: new Date().toISOString().split('T')[0],
                category: "None",
            },
        ],
        // Add next appointment if available
        nextAppointment: patientData.next_appointment || null,
        // Add lifestyle information if available
        lifestyle: patientData.lifestyles || null,
        // Add vaccination information if available
        vaccinations: patientData.vaccinations
            ? patientData.vaccinations.split(',').map((item: string) => item.trim())
            : [],
    }
}

export default async function PatientPage({ params }: { params: { id: string } }) {
    const patient = await getPatient(params.id)

    if (!patient) {
        notFound()
    }

    return <PatientDetails patient={patient} />
}
