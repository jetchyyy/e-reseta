import React from 'react';
import type { Patient } from '../../types/patient';

interface PatientCardProps {
  patient: Patient;
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onCreatePrescription: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onView,
  onEdit,
  onCreatePrescription,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-md transition-all duration-300 border border-[#457B9D]/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#457B9D] to-[#A8DADC] flex items-center justify-center text-white font-bold text-lg">
            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1D3557]">
              {patient.firstName} {patient.lastName}
            </h3>
            <p className="text-sm text-[#457B9D]">
              {patient.age} years • {patient.gender}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center text-[#457B9D]">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="truncate">{patient.phone}</span>
        </div>
        {patient.email && (
          <div className="flex items-center text-[#457B9D]">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate">{patient.email}</span>
          </div>
        )}
        {patient.allergies && (
          <div className="flex items-start text-rose-600">
            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs line-clamp-2"><strong>Allergies:</strong> {patient.allergies}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-4 border-t border-[#457B9D]/10">
        <button
          onClick={() => onCreatePrescription(patient)}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 text-sm"
          aria-label={`Create prescription for ${patient.firstName} ${patient.lastName}`}
        >
          Create Rx
        </button>
        <button
          onClick={() => onView(patient)}
          className="px-4 py-2 bg-[#457B9D]/10 hover:bg-[#457B9D]/20 text-[#1D3557] font-medium rounded-lg transition-all text-sm focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
          aria-label={`View ${patient.firstName} ${patient.lastName} details`}
        >
          View
        </button>
        <button
          onClick={() => onEdit(patient)}
          className="p-2 text-[#457B9D] hover:bg-[#457B9D]/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
          aria-label={`Edit ${patient.firstName} ${patient.lastName}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
