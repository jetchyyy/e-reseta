import React, { useState } from 'react';
import type { Patient } from '../../types/patient';
import { usePatientPrescriptions } from '../../hooks/usePatientPrescriptions';
import { useAuth } from '../../auth/AuthContext';
import PrescriptionPreview from '../reusable/PrescriptionPreview';

interface PatientDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: string) => void;
  onCreatePrescription: (patient: Patient) => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onCreatePrescription,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'prescriptions'>('info');
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);
  const { prescriptions, loading: prescriptionsLoading } = usePatientPrescriptions(
    patient?.id,
    currentUser?.uid
  );

  if (!isOpen || !patient) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      if (patient.id) {
        onDelete(patient.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-soft max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 md:p-8 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#457B9D] to-[#A8DADC] flex items-center justify-center text-white font-bold text-2xl shadow-md">
              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1D3557]">
                {patient.firstName} {patient.middleName} {patient.lastName}
              </h2>
              <p className="text-[#457B9D]">
                {patient.age} years • {patient.gender}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#457B9D]/60 hover:text-[#1D3557] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
            aria-label="Close patient details"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 md:px-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-[#457B9D] text-[#1D3557]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Patient Info
            </div>
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'prescriptions'
                ? 'border-[#457B9D] text-[#1D3557]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Prescriptions
              {prescriptions.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-[#457B9D] text-white rounded-full">
                  {prescriptions.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'info' ? (
            <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#1D3557] mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-[#457B9D]">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {patient.phone}
              </div>
              {patient.email && (
                <div className="flex items-center text-[#457B9D]">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {patient.email}
                </div>
              )}
              <div className="flex items-start text-[#457B9D]">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {patient.address}
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-semibold text-[#1D3557] mb-3">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patient.bloodType && (
                <div className="bg-[#F1FAEE] p-3 rounded-lg">
                  <p className="text-xs text-[#457B9D] mb-1">Blood Type</p>
                  <p className="text-sm font-semibold text-[#1D3557]">{patient.bloodType}</p>
                </div>
              )}
              <div className="bg-[#F1FAEE] p-3 rounded-lg">
                <p className="text-xs text-[#457B9D] mb-1">Date of Birth</p>
                <p className="text-sm font-semibold text-[#1D3557]">
                  {new Date(patient.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {patient.allergies && (
              <div className="mt-3 bg-rose-50 border border-rose-200 p-3 rounded-lg">
                <p className="text-xs text-rose-700 font-semibold mb-1">⚠️ Allergies</p>
                <p className="text-sm text-rose-900">{patient.allergies}</p>
              </div>
            )}
            
            {patient.chronicConditions && (
              <div className="mt-3 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p className="text-xs text-amber-700 font-semibold mb-1">Chronic Conditions</p>
                <p className="text-sm text-amber-900">{patient.chronicConditions}</p>
              </div>
            )}
            
            {patient.currentMedications && (
              <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="text-xs text-blue-700 font-semibold mb-1">Current Medications</p>
                <p className="text-sm text-blue-900">{patient.currentMedications}</p>
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          {(patient.emergencyContactName || patient.emergencyContactPhone) && (
            <div>
              <h3 className="text-lg font-semibold text-[#1D3557] mb-3">Emergency Contact</h3>
              <div className="space-y-2 text-sm">
                {patient.emergencyContactName && (
                  <p className="text-[#457B9D]">
                    <strong>Name:</strong> {patient.emergencyContactName}
                  </p>
                )}
                {patient.emergencyContactPhone && (
                  <p className="text-[#457B9D]">
                    <strong>Phone:</strong> {patient.emergencyContactPhone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional Notes */}
          {patient.notes && (
            <div>
              <h3 className="text-lg font-semibold text-[#1D3557] mb-3">Additional Notes</h3>
              <p className="text-sm text-[#457B9D] bg-[#F1FAEE] p-3 rounded-lg">
                {patient.notes}
              </p>
            </div>
          )}
            </div>
          ) : (
            /* Prescriptions Tab */
            <div className="space-y-4">
              {prescriptionsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-12 h-12 border-4 border-[#457B9D] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-[#457B9D]">Loading prescriptions...</p>
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-2">No Prescriptions Yet</h4>
                  <p className="text-sm text-gray-600 mb-6">This patient doesn't have any prescription history</p>
                  <button
                    onClick={() => onCreatePrescription(patient)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create First Prescription
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#1D3557]">
                      Prescription History ({prescriptions.length})
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {prescriptions.map((prescription: any) => {
                      const isExpanded = expandedPrescription === prescription.id;
                      
                      return (
                        <div key={prescription.id} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#457B9D] transition-colors">
                          {/* Prescription Header - Always Visible */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedPrescription(isExpanded ? null : prescription.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[#1D3557] truncate">
                                    {prescription.diagnosis || 'General Prescription'}
                                  </p>
                                  <p className="text-xs text-[#457B9D]">
                                    {prescription.prescriptionDate || (prescription.createdAt?.toDate ? new Date(prescription.createdAt.toDate()).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    }) : 'Date unavailable')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                                  {prescription.medications?.length || 0} med{prescription.medications?.length !== 1 ? 's' : ''}
                                </span>
                                <svg 
                                  className={`w-5 h-5 text-[#457B9D] transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Quick Preview of Medications */}
                            {!isExpanded && prescription.medications && prescription.medications.length > 0 && (
                              <div className="mt-2 pl-13">
                                <p className="text-xs text-gray-600">
                                  {prescription.medications.slice(0, 2).map((med: any) => med.name).join(', ')}
                                  {prescription.medications.length > 2 && ` +${prescription.medications.length - 2} more`}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Expanded Prescription Details */}
                          {isExpanded && prescription.template && (
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                              <PrescriptionPreview
                                template={prescription.template}
                                patientInfo={{
                                  name: prescription.patientInfo?.name || patient.firstName + ' ' + patient.lastName,
                                  age: prescription.patientInfo?.age?.toString() || patient.age?.toString() || '',
                                  sex: prescription.patientInfo?.sex || patient.gender || '',
                                }}
                                prescriptionDate={prescription.prescriptionDate || new Date(prescription.createdAt?.toDate()).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                })}
                                diagnosis={prescription.diagnosis}
                                medications={prescription.medications || []}
                                additionalNotes={prescription.additionalNotes}
                                signatureUrl={currentUser?.photoURL || undefined}
                                showActions={true}
                                className="max-w-2xl mx-auto"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => onCreatePrescription(patient)}
            className="flex-1 min-w-[200px] px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Create Prescription
          </button>
          <button
            onClick={() => onEdit(patient)}
            className="px-6 py-3 bg-[#457B9D]/10 hover:bg-[#457B9D]/20 text-[#1D3557] font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-3 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;
