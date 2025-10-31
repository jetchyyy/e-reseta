import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { validateName, validateEmail, validatePhone } from '../utils/validation';
import { validateRegistrationToken } from '../utils/registrationToken';
import SuccessModal from '../components/reusable/SuccessModal';
import ErrorModal from '../components/reusable/ErrorModal';
import type { PatientFormData } from '../types/patient';

interface DoctorInfo {
  displayName: string;
  professionalTitle?: string;
  licenseNo?: string;
}

const PatientSelfRegistration: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [actualDoctorUid, setActualDoctorUid] = useState<string>('');
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    age: 0,
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    bloodType: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if this token has been used successfully before
    if (doctorId) {
      const submittedKey = `patient_submitted_${doctorId}`;
      const hasSubmitted = localStorage.getItem(submittedKey) === 'true';
      if (hasSubmitted) {
        setIsSubmitted(true);
        setLoading(false);
        return;
      }
    }
    loadDoctorInfo();
  }, [doctorId]);

  const loadDoctorInfo = async () => {
    if (!doctorId) {
      setErrorModal({
        isOpen: true,
        message: 'Invalid registration link. Please contact your doctor for a valid link.',
      });
      setLoading(false);
      return;
    }

    try {
      // Validate the token first
      const tokenValidation = await validateRegistrationToken(doctorId);
      
      if (!tokenValidation.isValid) {
        setErrorModal({
          isOpen: true,
          message: tokenValidation.error || 'Invalid or expired registration link.',
        });
        setLoading(false);
        return;
      }
      
      // Token is valid, get the actual doctor UID
      const realDoctorUid = tokenValidation.doctorUid!;
      setActualDoctorUid(realDoctorUid);
      
      // Now load doctor info using the actual doctor UID
      const doctorRef = doc(db, 'users', realDoctorUid);
      const doctorDoc = await getDoc(doctorRef);

      if (doctorDoc.exists()) {
        const data = doctorDoc.data() as DoctorInfo;
        setDoctorInfo(data);
      } else {
        setErrorModal({
          isOpen: true,
          message: 'Doctor not found. Please contact your doctor for a valid registration link.',
        });
      }
    } catch (error) {
      console.error('Error loading doctor info:', error);
      setErrorModal({
        isOpen: true,
        message: 'Failed to load doctor information. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleDOBChange = (dob: string) => {
    const age = calculateAge(dob);
    setFormData(prev => ({ ...prev, dateOfBirth: dob, age }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

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

    if (formData.email && formData.email.trim()) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) errors.email = emailValidation.error!;
    }

    if (formData.emergencyContactPhone && formData.emergencyContactPhone.trim()) {
      const emergencyPhoneValidation = validatePhone(formData.emergencyContactPhone, false);
      if (!emergencyPhoneValidation.isValid) {
        errors.emergencyContactPhone = emergencyPhoneValidation.error!;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrorModal({
        isOpen: true,
        message: 'Please fix the errors in the form before submitting.',
      });
      return;
    }

    if (!actualDoctorUid) {
      setErrorModal({
        isOpen: true,
        message: 'Invalid registration link.',
      });
      return;
    }

    try {
      setSubmitting(true);

      const patientData = {
        ...formData,
        doctorUid: actualDoctorUid, // Use the actual doctor UID from token validation
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'patients'), patientData);

      // Mark this token as used in localStorage to prevent resubmission
      const submittedKey = `patient_submitted_${doctorId}`;
      localStorage.setItem(submittedKey, 'true');
      setIsSubmitted(true);

      setSuccessModal({
        isOpen: true,
        title: 'Registration Successful!',
        message: `Thank you, ${formData.firstName}! Your information has been sent to Dr. ${doctorInfo?.displayName || 'your doctor'}. You will be contacted soon. This form will close shortly.`,
      });

      // Reset form and hide it after successful submission to prevent spam
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          middleName: '',
          dateOfBirth: '',
          age: 0,
          gender: 'Male',
          email: '',
          phone: '',
          address: '',
          allergies: '',
          chronicConditions: '',
          currentMedications: '',
          bloodType: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          notes: '',
        });
        setFormErrors({});
        setSuccessModal({ isOpen: false, title: '', message: '' });
        // Hide the form by setting doctorInfo to null (will show "registration complete" message)
        setDoctorInfo(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting patient data:', error);
      setErrorModal({
        isOpen: true,
        message: 'Failed to submit your information. Please try again or contact your doctor.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F1FAEE] to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#457B9D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#457B9D] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!doctorInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F1FAEE] to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#1D3557] mb-2">
            {isSubmitted ? 'Registration Complete' : (errorModal.isOpen ? 'Invalid Link' : 'Registration Complete')}
          </h3>
          <p className="text-[#457B9D]">
            {isSubmitted 
              ? 'Thank you for registering! Your information has been submitted successfully. You may now close this window.'
              : (errorModal.isOpen 
                  ? 'Please contact your doctor for a valid registration link.'
                  : 'Thank you for registering! Your information has been submitted successfully. You may now close this window.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1FAEE] to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#1D3557] to-[#457B9D] mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-2">Patient Registration</h1>
            <p className="text-[#457B9D]">
              {doctorInfo.professionalTitle ? `${doctorInfo.professionalTitle} ` : ''}
              {doctorInfo.displayName}
              {doctorInfo.licenseNo && ` • License No: ${doctorInfo.licenseNo}`}
            </p>
            <p className="text-sm text-[#457B9D] mt-2">
              Please fill out your information below. All fields marked with <span className="text-rose-500">*</span> are required.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft p-6 md:p-8 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#1D3557] mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#457B9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    formErrors.firstName ? 'border-rose-500' : 'border-[#457B9D]/20'
                  } focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all`}
                  placeholder="Juan"
                />
                {formErrors.firstName && (
                  <p className="text-sm text-rose-500 mt-1">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#457B9D]/20 focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all"
                  placeholder="Santos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    formErrors.lastName ? 'border-rose-500' : 'border-[#457B9D]/20'
                  } focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all`}
                  placeholder="Dela Cruz"
                />
                {formErrors.lastName && (
                  <p className="text-sm text-rose-500 mt-1">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Date of Birth <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleDOBChange(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    formErrors.dateOfBirth ? 'border-rose-500' : 'border-[#457B9D]/20'
                  } focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all`}
                />
                {formErrors.dateOfBirth && (
                  <p className="text-sm text-rose-500 mt-1">{formErrors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Age
                </label>
                <input
                  type="text"
                  value={formData.age > 0 ? `${formData.age} years` : ''}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-lg border border-[#457B9D]/20 bg-gray-50 text-[#457B9D]"
                  placeholder="Auto-calculated"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    formErrors.gender ? 'border-rose-500' : 'border-[#457B9D]/20'
                  } focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.gender && (
                  <p className="text-sm text-rose-500 mt-1">{formErrors.gender}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#1D3557] mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#457B9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    formErrors.phone ? 'border-rose-500' : 'border-[#457B9D]/20'
                  } focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all`}
                  placeholder="09171234567"
                />
                {formErrors.phone && (
                  <p className="text-sm text-rose-500 mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    formErrors.email ? 'border-rose-500' : 'border-[#457B9D]/20'
                  } focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all`}
                  placeholder="patient@email.com"
                />
                {formErrors.email && (
                  <p className="text-sm text-rose-500 mt-1">{formErrors.email}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  formErrors.address ? 'border-rose-500' : 'border-[#457B9D]/20'
                } focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all`}
                placeholder="Complete address"
              />
              {formErrors.address && (
                <p className="text-sm text-rose-500 mt-1">{formErrors.address}</p>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#1D3557] mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#457B9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Medical Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Blood Type
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#457B9D]/20 focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all"
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Allergies
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#457B9D]/20 focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all"
                  placeholder="e.g., Penicillin, Peanuts"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Chronic Conditions
                </label>
                <textarea
                  value={formData.chronicConditions}
                  onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#457B9D]/20 focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all"
                  placeholder="e.g., Hypertension, Diabetes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Current Medications
                </label>
                <textarea
                  value={formData.currentMedications}
                  onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#457B9D]/20 focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all"
                  placeholder="e.g., Metformin 500mg"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold text-[#1D3557] mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#457B9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Emergency Contact (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#457B9D]/20 focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all"
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    formErrors.emergencyContactPhone ? 'border-rose-500' : 'border-[#457B9D]/20'
                  } focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all`}
                  placeholder="09171234567"
                />
                {formErrors.emergencyContactPhone && (
                  <p className="text-sm text-rose-500 mt-1">{formErrors.emergencyContactPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-[#457B9D]/20 focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all"
              placeholder="Any additional information you'd like to share with your doctor"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#457B9D]/10">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-[#1D3557] to-[#457B9D] hover:from-[#457B9D] hover:to-[#1D3557] text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#457B9D] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Privacy Notice */}
        <div className="mt-6 text-center text-sm text-[#457B9D]">
          <p>Your information is secure and will only be shared with your healthcare provider.</p>
        </div>
      </div>

      {/* Modals */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
        icon="check"
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
        errorType="error"
      />
    </div>
  );
};

export default PatientSelfRegistration;
