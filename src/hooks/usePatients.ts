import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { validateName, validateEmail, validatePhone } from '../utils/validation';
import type { Patient } from '../types/patient';

interface UsePatients {
  patients: Patient[];
  loading: boolean;
  error: string | null;
  loadPatients: () => Promise<void>;
  savePatient: (patientData: Patient, isEditing: boolean) => Promise<void>;
  deletePatient: (patientId: string) => Promise<void>;
  validateForm: (formData: Patient) => { isValid: boolean; errors: Record<string, string> };
  calculateAge: (dob: string) => number;
}

export const usePatients = (doctorUid: string): UsePatients => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load patients from Firestore
  const loadPatients = async () => {
    if (!doctorUid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const patientsQuery = query(
        collection(db, 'patients'),
        where('doctorUid', '==', doctorUid),
        orderBy('lastName', 'asc')
      );
      
      const querySnapshot = await getDocs(patientsQuery);
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Patient[];
      
      setPatients(patientsData);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Validate patient form
  const validateForm = (formData: Patient): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    // Required fields
    const firstNameValidation = validateName(formData.firstName, true);
    if (!firstNameValidation.isValid) errors.firstName = firstNameValidation.error!;

    const lastNameValidation = validateName(formData.lastName, true);
    if (!lastNameValidation.isValid) errors.lastName = lastNameValidation.error!;

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }

    const phoneValidation = validatePhone(formData.phone, true);
    if (!phoneValidation.isValid) errors.phone = phoneValidation.error!;

    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }

    // Optional email validation
    if (formData.email && formData.email.trim()) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) errors.email = emailValidation.error!;
    }

    // Emergency contact phone validation
    if (formData.emergencyContactPhone && formData.emergencyContactPhone.trim()) {
      const emergencyPhoneValidation = validatePhone(formData.emergencyContactPhone, false);
      if (!emergencyPhoneValidation.isValid) {
        errors.emergencyContactPhone = emergencyPhoneValidation.error!;
      }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  // Save patient (create or update)
  const savePatient = async (patientData: Patient, isEditing: boolean) => {
    try {
      const dataToSave = {
        ...patientData,
        updatedAt: Timestamp.now(),
        ...(isEditing ? {} : { createdAt: Timestamp.now() }),
      };

      if (isEditing && patientData.id) {
        await updateDoc(doc(db, 'patients', patientData.id), dataToSave);
      } else {
        await addDoc(collection(db, 'patients'), dataToSave);
      }

      await loadPatients();
    } catch (err) {
      console.error('Error saving patient:', err);
      throw new Error('Failed to save patient. Please try again.');
    }
  };

  // Delete patient
  const deletePatient = async (patientId: string) => {
    try {
      await deleteDoc(doc(db, 'patients', patientId));
      await loadPatients();
    } catch (err) {
      console.error('Error deleting patient:', err);
      throw new Error('Failed to delete patient. Please try again.');
    }
  };

  // Load patients on mount
  useEffect(() => {
    if (doctorUid) {
      loadPatients();
    }
  }, [doctorUid]);

  return {
    patients,
    loading,
    error,
    loadPatients,
    savePatient,
    deletePatient,
    validateForm,
    calculateAge,
  };
};
