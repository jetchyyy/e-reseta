import React from 'react';
import type { ResetaTemplate } from '../../../types/prescription';

interface TemplateBasicInfoProps {
  template: ResetaTemplate;
  fieldErrors: Record<string, string>;
  onUpdateField: (field: string, value: any) => void;
  onUpdateFieldWithValidation: (field: string, value: any) => void;
  clinicNameRef: React.RefObject<HTMLInputElement | null>;
}

const TemplateBasicInfo: React.FC<TemplateBasicInfoProps> = ({
  template,
  fieldErrors,
  onUpdateField,
  onUpdateFieldWithValidation,
  clinicNameRef,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700 mb-2">
          Clinic/Institute Name <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          ref={clinicNameRef}
          id="clinicName"
          type="text"
          value={template.clinicName}
          onChange={(e) => onUpdateField('clinicName', e.target.value)}
          placeholder="e.g., THE KNEE ARTHRITIS & ORTHOPAEDIC INSTITUTE"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            fieldErrors.clinicName ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!fieldErrors.clinicName}
          aria-describedby={fieldErrors.clinicName ? 'clinicName-error' : undefined}
          required
        />
        {fieldErrors.clinicName && (
          <p id="clinicName-error" className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.clinicName}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-2">
            Doctor Name <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="doctorName"
            type="text"
            value={template.doctorName}
            onChange={(e) => onUpdateFieldWithValidation('doctorName', e.target.value)}
            placeholder="e.g., Rene Catan"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              fieldErrors.doctorName ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!fieldErrors.doctorName}
            aria-describedby={fieldErrors.doctorName ? 'doctorName-error' : undefined}
            required
          />
          {fieldErrors.doctorName && (
            <p id="doctorName-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.doctorName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="professionalTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Professional Title <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="professionalTitle"
            type="text"
            value={template.professionalTitle}
            onChange={(e) => onUpdateField('professionalTitle', e.target.value)}
            placeholder="e.g., MD, DO, RN"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-describedby="professionalTitle-help"
          />
          <p id="professionalTitle-help" className="text-xs text-gray-500 mt-1">
            This appears after your name (e.g., MD, DO, RN)
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="doctorCredentials" className="block text-sm font-medium text-gray-700 mb-2">
          Credentials
        </label>
        <input
          id="doctorCredentials"
          type="text"
          value={template.doctorCredentials}
          onChange={(e) => onUpdateField('doctorCredentials', e.target.value)}
          placeholder="e.g., MBAH, FPOA (Additional credentials)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          aria-describedby="doctorCredentials-help"
        />
        <p id="doctorCredentials-help" className="text-xs text-gray-500 mt-1">
          Additional credentials beyond your professional title
        </p>
      </div>

      <div>
        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
          Specialty <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          id="specialty"
          type="text"
          value={template.specialty}
          onChange={(e) => onUpdateField('specialty', e.target.value)}
          placeholder="e.g., Orthopaedic Surgeon"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            fieldErrors.specialty ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!fieldErrors.specialty}
          required
        />
        {fieldErrors.specialty && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.specialty}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="licenseNo" className="block text-sm font-medium text-gray-700 mb-2">
            License No. <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="licenseNo"
            type="text"
            value={template.licenseNo}
            onChange={(e) => onUpdateField('licenseNo', e.target.value)}
            placeholder="e.g., 60125"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            aria-describedby="licenseNo-help"
            disabled
          />
          <p id="licenseNo-help" className="text-xs text-gray-500 mt-1">
            This is your license number from your profile
          </p>
        </div>

        <div>
          <label htmlFor="ptrNo" className="block text-sm font-medium text-gray-700 mb-2">
            PTR No. (Optional)
          </label>
          <input
            id="ptrNo"
            type="text"
            value={template.ptrNo}
            onChange={(e) => onUpdateFieldWithValidation('ptrNo', e.target.value)}
            placeholder="PTR Number"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              fieldErrors.ptrNo ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!fieldErrors.ptrNo}
            aria-describedby={fieldErrors.ptrNo ? 'ptrNo-error' : undefined}
          />
          {fieldErrors.ptrNo && (
            <p id="ptrNo-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.ptrNo}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="s2LicenseNo" className="block text-sm font-medium text-gray-700 mb-2">
          S2 License No. (Optional)
        </label>
        <input
          id="s2LicenseNo"
          type="text"
          value={template.s2LicenseNo}
          onChange={(e) => onUpdateFieldWithValidation('s2LicenseNo', e.target.value)}
          placeholder="S2 License Number"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            fieldErrors.s2LicenseNo ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!fieldErrors.s2LicenseNo}
          aria-describedby={fieldErrors.s2LicenseNo ? 's2LicenseNo-error' : undefined}
        />
        {fieldErrors.s2LicenseNo && (
          <p id="s2LicenseNo-error" className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.s2LicenseNo}
          </p>
        )}
      </div>
    </div>
  );
};

export default TemplateBasicInfo;
