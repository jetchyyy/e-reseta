import React from 'react';
import type { ResetaTemplate } from '../../../types/prescription';

interface TemplatePreviewProps {
  template: ResetaTemplate;
  userSignature?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  userSignature,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:sticky lg:top-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
      
      <div 
        className="border-2 border-gray-300 rounded-lg p-4 text-xs"
        style={{ backgroundColor: template.paperColor }}
      >
        {/* Header Preview */}
        <div className="text-center mb-4 pb-3 border-b-2 border-gray-300">
          <h4 className="font-bold text-sm mb-1" style={{ color: template.headerColor }}>
            {template.clinicName || 'Clinic Name'}
          </h4>
          <p className="font-semibold">
            {template.doctorName || 'Doctor Name'}, {template.professionalTitle || 'MD'}
            {template.doctorCredentials && `, ${template.doctorCredentials}`}
          </p>
          <p className="text-gray-600">{template.specialty || 'Specialty'}</p>
        </div>

        {/* Contact Info Preview */}
        <div className="mb-4 text-[10px]">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p className="font-semibold mb-1">Address:</p>
              {template.clinicRoom && <p>{template.clinicRoom}</p>}
              <p>{template.clinicAddress || 'Address'}</p>
              {template.clinicCity && <p>{template.clinicCity}</p>}
              <p>{template.clinicCountry}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Contact:</p>
              <p>Phone: {template.phone || 'N/A'}</p>
              {template.mobile && <p>Mobile: {template.mobile}</p>}
              <p>Email: {template.email || 'N/A'}</p>
            </div>
          </div>
          
          {/* Clinic Hours Preview */}
          {Object.keys(template.clinicHours).length > 0 && Object.values(template.clinicHours).some(v => v) && (
            <div className="border-t border-gray-300 pt-2 mt-2">
              <p className="font-semibold mb-1">Clinic Hours:</p>
              {Object.entries(template.clinicHours).map(([day, hours]) => 
                hours ? (
                  <p key={day} className="capitalize">
                    {day}: {hours}
                  </p>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Rx Symbol */}
        {template.showRxSymbol && (
          <div className="text-4xl font-serif mb-2" style={{ color: template.accentColor }}>
            ℞
          </div>
        )}

        {/* Sample Prescription Area */}
        <div className="border-t border-gray-300 pt-2 min-h-[100px]">
          <p className="text-gray-400 italic">Prescription content will appear here...</p>
        </div>

        {/* Footer Preview */}
        <div className="border-t border-gray-300 pt-2 mt-4 text-[10px]">
          {/* Signature Display in Footer */}
          {userSignature && (
            <div className="mb-1">
              <img 
                src={userSignature} 
                alt="Signature" 
                className="h-8 object-contain mix-blend-darken"
                style={{ 
                  filter: 'contrast(1.2) brightness(1)',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          )}
          
          <p className="font-semibold">
            {template.doctorName || 'Doctor Name'}, {template.professionalTitle || 'MD'}
          </p>
          <p>Lic. No.: {template.licenseNo || 'N/A'}</p>
          {template.ptrNo && <p>PTR No.: {template.ptrNo}</p>}
          {template.s2LicenseNo && <p>S2 No.: {template.s2LicenseNo}</p>}
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-900">
          💡 This is how your prescriptions will look when printed or exported
        </p>
      </div>
    </div>
  );
};

export default TemplatePreview;
