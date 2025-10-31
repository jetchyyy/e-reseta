import React from 'react';
import type { Patient } from '../../types/patient';

interface PatientFormProps {
  formData: Patient;
  formErrors: Record<string, string>;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFormDataChange: (data: Patient) => void;
  onFormErrorsChange: (errors: Record<string, string>) => void;
}

const PatientForm: React.FC<PatientFormProps> = ({
  formData,
  formErrors,
  isEditing,
  onSubmit,
  onCancel,
  onFormDataChange,
}) => {
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

  // Handle date of birth change
  const handleDOBChange = (dob: string) => {
    const age = calculateAge(dob);
    onFormDataChange({ ...formData, dateOfBirth: dob, age });
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1D3557]">
          {isEditing ? 'Edit Patient' : 'Add New Patient'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-[#457B9D]/60 hover:text-[#1D3557] transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-[#457B9D]"
          aria-label="Close form"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
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
                onChange={(e) => onFormDataChange({ ...formData, firstName: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, middleName: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, lastName: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
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
                onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
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
            Medical Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                Blood Type
              </label>
              <select
                value={formData.bloodType}
                onChange={(e) => onFormDataChange({ ...formData, bloodType: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, allergies: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, chronicConditions: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, currentMedications: e.target.value })}
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
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1D3557] mb-1.5">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => onFormDataChange({ ...formData, emergencyContactName: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, emergencyContactPhone: e.target.value })}
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
            onChange={(e) => onFormDataChange({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-[#457B9D]/20 focus:border-[#457B9D] focus:ring-2 focus:ring-[#457B9D]/20 transition-all"
            placeholder="Any additional information about the patient"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#457B9D]/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-[#457B9D] hover:text-[#1D3557] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#457B9D] focus:ring-offset-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-[#1D3557] to-[#457B9D] hover:from-[#457B9D] hover:to-[#1D3557] text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#457B9D]"
          >
            {isEditing ? 'Update Patient' : 'Save Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
