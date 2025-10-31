import React from 'react';
import PatientCard from './PatientCard';
import type { Patient } from '../../types/patient';

interface PatientListProps {
  patients: Patient[];
  searchQuery: string;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onCreatePrescription: (patient: Patient) => void;
  onAddPatient: () => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  searchQuery,
  onView,
  onEdit,
  onCreatePrescription,
  onAddPatient,
}) => {
  if (patients.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#A8DADC]/20 mb-4">
          <svg className="w-8 h-8 text-[#457B9D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[#1D3557] mb-2">
          {searchQuery ? 'No patients found' : 'No patients yet'}
        </h3>
        <p className="text-[#457B9D] mb-4">
          {searchQuery ? 'Try a different search term' : 'Add your first patient to get started'}
        </p>
        {!searchQuery && (
          <button
            onClick={onAddPatient}
            className="px-6 py-2.5 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#457B9D]"
          >
            + Add Patient
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onView={onView}
          onEdit={onEdit}
          onCreatePrescription={onCreatePrescription}
        />
      ))}
    </div>
  );
};

export default PatientList;
