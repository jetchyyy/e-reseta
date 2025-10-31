import React from 'react';
import type { ResetaTemplate } from '../../../types/prescription';

interface TemplateContactInfoProps {
  template: ResetaTemplate;
  fieldErrors: Record<string, string>;
  onUpdateField: (field: string, value: any) => void;
  onUpdateFieldWithValidation: (field: string, value: any) => void;
}

const TemplateContactInfo: React.FC<TemplateContactInfoProps> = ({
  template,
  fieldErrors,
  onUpdateField,
  onUpdateFieldWithValidation,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="clinicAddress" className="block text-sm font-medium text-gray-700 mb-2">
          Clinic Address <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          id="clinicAddress"
          type="text"
          value={template.clinicAddress}
          onChange={(e) => onUpdateField('clinicAddress', e.target.value)}
          placeholder="e.g., E. Rodriguez Sr., Blvd."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            fieldErrors.clinicAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!fieldErrors.clinicAddress}
          required
        />
        {fieldErrors.clinicAddress && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.clinicAddress}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="clinicRoom" className="block text-sm font-medium text-gray-700 mb-2">
            Room/Floor (Optional)
          </label>
          <input
            id="clinicRoom"
            type="text"
            value={template.clinicRoom}
            onChange={(e) => onUpdateField('clinicRoom', e.target.value)}
            placeholder="e.g., Room 709 -MAB"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="clinicCity" className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            id="clinicCity"
            type="text"
            value={template.clinicCity}
            onChange={(e) => onUpdateField('clinicCity', e.target.value)}
            placeholder="e.g., Quezon City 1600"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="clinicCountry" className="block text-sm font-medium text-gray-700 mb-2">
          Country <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          id="clinicCountry"
          type="text"
          value={template.clinicCountry}
          onChange={(e) => onUpdateField('clinicCountry', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone <span className="text-red-500" aria-label="required">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={template.phone}
            onChange={(e) => onUpdateFieldWithValidation('phone', e.target.value)}
            placeholder="e.g., (02) 893 5762"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!fieldErrors.phone}
            aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
            required
          />
          {fieldErrors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.phone}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile (Optional)
          </label>
          <input
            id="mobile"
            type="tel"
            value={template.mobile}
            onChange={(e) => onUpdateFieldWithValidation('mobile', e.target.value)}
            placeholder="e.g., 09285006794"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              fieldErrors.mobile ? 'border-red-500' : 'border-gray-300'
            }`}
            aria-invalid={!!fieldErrors.mobile}
            aria-describedby={fieldErrors.mobile ? 'mobile-error' : undefined}
          />
          {fieldErrors.mobile && (
            <p id="mobile-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.mobile}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email <span className="text-red-500" aria-label="required">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={template.email}
          onChange={(e) => onUpdateFieldWithValidation('email', e.target.value)}
          placeholder="email@example.com"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            fieldErrors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          required
        />
        {fieldErrors.email && (
          <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>
    </div>
  );
};

export default TemplateContactInfo;
