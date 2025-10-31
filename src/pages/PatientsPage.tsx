import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usePatients } from '../hooks/usePatients';
import type { Patient } from '../types/patient';
import DashboardLayout from '../components/layout/DashboardLayout';
import PatientSearchBar from '../components/patients/PatientSearchBar';
import PatientList from '../components/patients/PatientList';
import PatientForm from '../components/patients/PatientForm';
import PatientDetailModal from '../components/patients/PatientDetailModal';
import SuccessModal from '../components/reusable/SuccessModal';
import ErrorModal from '../components/reusable/ErrorModal';
import SkeletonLoader from '../components/reusable/SkeletonLoader';
import { createRegistrationToken } from '../utils/registrationToken';

const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    patients,
    loading,
    error: hookError,
    savePatient,
    deletePatient,
    validateForm,
  } = usePatients(currentUser?.uid || '');

  // UI State
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Patient>({
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
    doctorUid: currentUser?.uid || '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Generate registration link with time-based token
  const handleGenerateLink = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setGeneratingLink(true);
      
      // Create a new token in Firestore (valid for 15 minutes)
      const tokenId = await createRegistrationToken(currentUser.uid);
      
      // Generate link with token
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/register-patient/${tokenId}`;
      setRegistrationLink(link);
      setShowLinkModal(true);
    } catch (error) {
      console.error('Error generating link:', error);
      setErrorModal({
        isOpen: true,
        message: 'Failed to generate registration link. Please try again.',
      });
    } finally {
      setGeneratingLink(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(registrationLink);
      setSuccessModal({
        isOpen: true,
        title: 'Link Copied!',
        message: 'The registration link has been copied to your clipboard. You can now share it with your patients.',
      });
      setShowLinkModal(false);
    } catch (error) {
      console.error('Error copying link:', error);
      setErrorModal({
        isOpen: true,
        message: 'Failed to copy link. Please try again.',
      });
    }
  };

  // Handle form submit
  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(formData);
    setFormErrors(validation.errors);

    if (!validation.isValid) {
      setErrorModal({
        isOpen: true,
        message: 'Please fix the errors in the form before submitting.',
      });
      return;
    }

    try {
      await savePatient(formData, !!editingPatient);
      
      setSuccessModal({
        isOpen: true,
        title: editingPatient ? 'Patient Updated' : 'Patient Added',
        message: `${formData.firstName} ${formData.lastName}'s information has been ${
          editingPatient ? 'updated' : 'added'
        } successfully.`,
      });

      resetForm();
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Failed to save patient. Please try again.',
      });
    }
  };

  // Handle delete
  const handleDelete = async (patientId: string) => {
    try {
      await deletePatient(patientId);
      
      setSuccessModal({
        isOpen: true,
        title: 'Patient Deleted',
        message: 'Patient has been removed from your records.',
      });
      
      setSelectedPatient(null);
    } catch (err) {
      setErrorModal({
        isOpen: true,
        message: err instanceof Error ? err.message : 'Failed to delete patient. Please try again.',
      });
    }
  };

  // Handle edit
  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setShowAddPatient(true);
    setSelectedPatient(null);
  };

  // Reset form
  const resetForm = () => {
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
      doctorUid: currentUser?.uid || '',
    });
    setFormErrors({});
    setShowAddPatient(false);
    setEditingPatient(null);
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(patient => {
    const searchLower = searchQuery.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.phone.includes(searchQuery) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower))
    );
  });

  // Navigate to create prescription
  const handleCreatePrescription = (patient: Patient) => {
    sessionStorage.setItem('selectedPatient', JSON.stringify(patient));
    navigate('/generate-prescription');
  };

  // Show loading skeleton
  if (loading) {
    return (
      <DashboardLayout title="Patient Management" subtitle="Loading patients...">
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </DashboardLayout>
    );
  }

  // Show error from hook
  if (hookError) {
    return (
      <DashboardLayout title="Patient Management" subtitle="Error loading patients">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 mb-4">
              <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1D3557] mb-2">Error Loading Patients</h3>
            <p className="text-[#457B9D] mb-4">{hookError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Patient Management"
      subtitle={`${patients.length} active patient${patients.length !== 1 ? 's' : ''} registered`}
      actions={
        <>
          <button
            onClick={handleGenerateLink}
            disabled={generatingLink}
            className="hidden md:flex items-center gap-2 px-4 py-2 border-2 border-[#457B9D] text-[#457B9D] hover:bg-[#457B9D] hover:text-white font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#457B9D] disabled:opacity-50"
            title="Generate patient registration link"
          >
            {generatingLink ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm">Generate Link</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddPatient(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md transform hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm hidden sm:inline">Add Patient</span>
            <span className="text-sm sm:hidden">Add</span>
          </button>
        </>
      }
    >
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Stats Overview - Only show when not adding patient */}
        {!showAddPatient && patients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-soft p-6 border-l-4 border-[#1D3557]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#457B9D] mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-[#1D3557]">{patients.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-soft p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#457B9D] mb-1">With Email</p>
                  <p className="text-3xl font-bold text-[#1D3557]">
                    {patients.filter(p => p.email).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-soft p-6 border-l-4 border-[#A8DADC]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#457B9D] mb-1">Complete Profiles</p>
                  <p className="text-3xl font-bold text-[#1D3557]">
                    {patients.filter(p => p.email && p.bloodType && p.allergies).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A8DADC] to-[#457B9D] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Search Bar */}
        {!showAddPatient && (
          <div className="mb-6">
            <PatientSearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          </div>
        )}

        {/* Patient Form */}
        {showAddPatient && (
          <div className="bg-white rounded-3xl shadow-xl border border-[#457B9D]/10 p-6 md:p-10 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1D3557] to-[#457B9D] flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingPatient ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"} />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[#1D3557] tracking-tight">
                    {editingPatient ? 'Edit Patient Record' : 'Add New Patient'}
                  </h2>
                  <p className="text-sm text-[#457B9D] mt-1">
                    {editingPatient ? 'Update patient information below' : 'Fill in the patient details to create a new record'}
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-3 text-[#457B9D]/60 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 group"
                aria-label="Close form"
              >
                <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <PatientForm
              formData={formData}
              formErrors={formErrors}
              isEditing={!!editingPatient}
              onSubmit={handleSavePatient}
              onCancel={resetForm}
              onFormDataChange={setFormData}
              onFormErrorsChange={setFormErrors}
            />
          </div>
        )}

        {/* Patients List */}
        {!showAddPatient && (
          <PatientList
            patients={filteredPatients}
            searchQuery={searchQuery}
            onView={setSelectedPatient}
            onEdit={handleEdit}
            onCreatePrescription={handleCreatePrescription}
            onAddPatient={() => setShowAddPatient(true)}
          />
        )}
      </div>

      {/* Patient Detail Modal */}
      <PatientDetailModal
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreatePrescription={handleCreatePrescription}
      />

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

      {/* Registration Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-10 transform transition-all animate-scale-in">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#457B9D] via-[#A8DADC] to-[#457B9D] flex items-center justify-center shadow-lg animate-pulse-slow">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[#1D3557] tracking-tight">Registration Link</h2>
                  <p className="text-sm text-[#457B9D] mt-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure • Expires in 15 minutes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="p-3 text-[#457B9D]/60 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 group"
                aria-label="Close"
              >
                <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Link Display */}
              <div className="bg-gradient-to-br from-[#F1FAEE] to-[#A8DADC]/20 border-2 border-[#457B9D]/30 rounded-2xl p-6 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-[#457B9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <p className="text-sm text-[#457B9D] font-semibold">Your Unique Registration Link:</p>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm bg-white px-5 py-4 rounded-xl border-2 border-[#457B9D]/20 text-[#1D3557] break-all font-mono shadow-sm hover:shadow-md transition-shadow">
                    {registrationLink}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className="flex-shrink-0 p-3 bg-[#457B9D] hover:bg-[#1D3557] text-white rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#457B9D] group"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-blue-500 flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 mb-3 text-lg">How to use this link:</p>
                    <ul className="space-y-2.5 text-sm text-blue-800">
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong>Share</strong> this link with your patients via email, SMS, WhatsApp, or messenger</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Patients can <strong>fill out their information</strong> directly from any device</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Submitted data will <strong>appear automatically</strong> in your patient list</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-amber-800"><strong>Link expires in 15 minutes</strong> for security — generate a new one if needed</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#457B9D]/10">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-6 py-3 text-[#457B9D] hover:bg-[#457B9D]/5 font-semibold transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:ring-offset-2"
                >
                  Close
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#1D3557] to-[#457B9D] hover:from-[#457B9D] hover:to-[#1D3557] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#457B9D] transform hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PatientsPage;
