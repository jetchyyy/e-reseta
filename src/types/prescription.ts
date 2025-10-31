/**
 * Shared TypeScript interfaces for prescription-related data structures
 * Used across CreateResetaTemplate, GeneratePrescription, and ViewPrescription components
 */

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PatientInfo {
  name: string;
  age: string;
  sex: string;
  address: string;
  contactNumber: string;
}

export interface ClinicHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface ResetaTemplate {
  // Header Information
  clinicName: string;
  doctorName: string;
  doctorCredentials: string;
  professionalTitle: string;
  specialty: string;
  
  // Contact Information
  clinicAddress: string;
  clinicRoom?: string;
  clinicCity?: string;
  clinicCountry: string;
  phone: string;
  email: string;
  mobile?: string;
  
  // Clinic Hours
  clinicHours: ClinicHours;
  
  // Footer Information
  licenseNo: string;
  ptrNo?: string;
  s2LicenseNo?: string;
  
  // Design preferences
  headerColor: string;
  accentColor: string;
  showRxSymbol: boolean;
  paperColor: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientInfo: PatientInfo;
  medications: Medication[];
  diagnosis: string;
  additionalNotes: string;
  prescriptionDate: string;
  template: ResetaTemplate;
  createdAt: any; // Firebase Timestamp
  status: string;
}
