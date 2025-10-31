import { Timestamp } from 'firebase/firestore';

/**
 * Patient entity interface
 * Represents a patient record in the system
 */
export interface Patient {
  /** Firestore document ID */
  id?: string;
  
  /** Patient's first name (required) */
  firstName: string;
  
  /** Patient's last name (required) */
  lastName: string;
  
  /** Patient's middle name (optional) */
  middleName?: string;
  
  /** Patient's date of birth in YYYY-MM-DD format (required) */
  dateOfBirth: string;
  
  /** Patient's calculated age in years (required) */
  age: number;
  
  /** Patient's gender (required) */
  gender: 'Male' | 'Female' | 'Other';
  
  /** Patient's email address (optional) */
  email?: string;
  
  /** Patient's phone number (required) */
  phone: string;
  
  /** Patient's complete address (required) */
  address: string;
  
  /** Known allergies (optional) */
  allergies?: string;
  
  /** Chronic conditions or diseases (optional) */
  chronicConditions?: string;
  
  /** Current medications being taken (optional) */
  currentMedications?: string;
  
  /** Blood type (optional) */
  bloodType?: string;
  
  /** Emergency contact person's name (optional) */
  emergencyContactName?: string;
  
  /** Emergency contact person's phone number (optional) */
  emergencyContactPhone?: string;
  
  /** Additional notes about the patient (optional) */
  notes?: string;
  
  /** Timestamp when the patient record was created */
  createdAt?: Timestamp;
  
  /** Timestamp when the patient record was last updated */
  updatedAt?: Timestamp;
  
  /** UID of the doctor who owns this patient record (required for isolation) */
  doctorUid: string;
}

/**
 * Patient form data interface
 * Used for creating/editing patient records
 * Extends Patient but omits Firestore-specific fields
 */
export interface PatientFormData extends Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'doctorUid'> {
  /** Doctor UID is added programmatically during save */
  doctorUid?: string;
}

/**
 * Patient validation errors
 * Maps field names to error messages
 */
export type PatientValidationErrors = Partial<Record<keyof Patient, string>>;

/**
 * Blood type options
 */
export const BLOOD_TYPES = [
  'A+', 'A-', 
  'B+', 'B-', 
  'AB+', 'AB-', 
  'O+', 'O-'
] as const;

export type BloodType = typeof BLOOD_TYPES[number];

/**
 * Gender options
 */
export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const;

export type Gender = typeof GENDER_OPTIONS[number];
