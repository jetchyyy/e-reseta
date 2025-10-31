import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Template {
  clinicName: string;
  doctorName: string;
  professionalTitle: string;
  doctorCredentials?: string;
  specialty: string;
  clinicRoom?: string;
  clinicAddress: string;
  clinicCity?: string;
  clinicCountry: string;
  phone: string;
  mobile?: string;
  email: string;
  clinicHours: Record<string, string>;
  licenseNo: string;
  ptrNo?: string;
  s2LicenseNo?: string;
  showRxSymbol: boolean;
  headerColor: string;
  accentColor: string;
  paperColor: string;
}

interface PatientInfo {
  name: string;
  age: string;
  sex: string;
}

interface PrescriptionPreviewProps {
  template: Template;
  patientInfo: PatientInfo;
  prescriptionDate: string;
  diagnosis?: string;
  medications: Medication[];
  additionalNotes?: string;
  signatureUrl?: string;
  showActions?: boolean;
  className?: string;
}

const PrescriptionPreview: React.FC<PrescriptionPreviewProps> = ({
  template,
  patientInfo,
  prescriptionDate,
  diagnosis,
  medications,
  additionalNotes,
  signatureUrl,
  showActions = false,
  className = '',
}) => {
  const prescriptionRef = useRef<HTMLDivElement>(null);

  const handleDownloadAsJPG = async () => {
    if (!prescriptionRef.current) return;

    try {
      const canvas = await html2canvas(prescriptionRef.current, {
        scale: 3, // Higher quality
        backgroundColor: template.paperColor,
        logging: false,
      });

      // Convert to JPG
      const link = document.createElement('a');
      link.download = `prescription-${patientInfo.name}-${prescriptionDate}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (error) {
      console.error('Error downloading prescription:', error);
      alert('Failed to download prescription. Please try again.');
    }
  };

  const handlePrint = () => {
    if (!prescriptionRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the prescription');
      return;
    }

    const prescriptionHTML = prescriptionRef.current.outerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${patientInfo.name}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            @media print {
              body {
                padding: 0;
              }
              @page {
                margin: 0.5in;
              }
            }
          </style>
        </head>
        <body>
          ${prescriptionHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSharePrescription = async () => {
    if (!prescriptionRef.current) return;

    try {
      const canvas = await html2canvas(prescriptionRef.current, {
        scale: 2,
        backgroundColor: template.paperColor,
        logging: false,
      });

      canvas.toBlob(async (blob: Blob | null) => {
        if (!blob) return;

        const file = new File([blob], `prescription-${patientInfo.name}.jpg`, {
          type: 'image/jpeg',
        });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Prescription',
              text: `Prescription for ${patientInfo.name}`,
            });
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              console.error('Error sharing:', error);
              // Fallback to download
              handleDownloadAsJPG();
            }
          }
        } else {
          // Fallback: copy to clipboard or download
          alert('Sharing is not supported on this device. The prescription will be downloaded instead.');
          handleDownloadAsJPG();
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error sharing prescription:', error);
      alert('Failed to share prescription. Please try downloading instead.');
    }
  };

  return (
    <div className={className}>
      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleSharePrescription}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          
          <button
            onClick={handleDownloadAsJPG}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download JPG
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      )}

      {/* Prescription Preview */}
      <div 
        ref={prescriptionRef}
        className="border-2 border-gray-300 rounded-lg p-6 text-xs bg-white shadow-lg"
        style={{ backgroundColor: template.paperColor }}
      >
        {/* Header */}
        <div className="text-center mb-4 pb-3 border-b-2 border-gray-300">
          <h4 className="font-bold text-lg mb-1" style={{ color: template.headerColor }}>
            {template.clinicName}
          </h4>
          <p className="font-semibold text-sm">
            {template.doctorName}, {template.professionalTitle}
            {template.doctorCredentials && `, ${template.doctorCredentials}`}
          </p>
          <p className="text-gray-600 text-xs">{template.specialty}</p>
        </div>

        {/* Clinic Info */}
        <div className="mb-4 text-[10px]">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="font-semibold mb-1">Address:</p>
              {template.clinicRoom && <p>{template.clinicRoom}</p>}
              <p>{template.clinicAddress}</p>
              {template.clinicCity && <p>{template.clinicCity}</p>}
              <p>{template.clinicCountry}</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Contact:</p>
              <p>Phone: {template.phone}</p>
              {template.mobile && <p>Mobile: {template.mobile}</p>}
              <p>Email: {template.email}</p>
            </div>
          </div>
          
          {Object.keys(template.clinicHours).length > 0 && Object.values(template.clinicHours).some(v => v) && (
            <div className="border-t border-gray-300 pt-2 mt-2">
              <p className="font-semibold mb-1">Clinic Hours:</p>
              <div className="grid grid-cols-2 gap-x-3">
                {Object.entries(template.clinicHours).map(([day, hours]) => 
                  hours ? (
                    <p key={day} className="capitalize">
                      {day}: {hours}
                    </p>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>

        {/* Patient Info */}
        <div className="mb-4 text-sm border-t border-gray-300 pt-3">
          <p><strong>Patient:</strong> {patientInfo.name || 'N/A'}</p>
          <p><strong>Age/Sex:</strong> {patientInfo.age || 'N/A'} / {patientInfo.sex || 'N/A'}</p>
          <p><strong>Date:</strong> {prescriptionDate}</p>
          {diagnosis && <p><strong>Diagnosis:</strong> {diagnosis}</p>}
        </div>

        {/* Rx Symbol */}
        {template.showRxSymbol && (
          <div className="text-4xl font-serif mb-3" style={{ color: template.accentColor }}>
            ℞
          </div>
        )}

        {/* Medications */}
        <div className="border-t border-gray-300 pt-3 mb-4">
          {medications.filter(m => m.name).length > 0 ? (
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-700 mb-2">Medications will appear here...</p>
              {medications.filter(m => m.name).map((med, idx) => (
                <div key={med.id || idx} className="mb-3">
                  <p className="font-semibold">{idx + 1}. {med.name} {med.dosage}</p>
                  {med.frequency && <p className="ml-4">Frequency: {med.frequency}</p>}
                  {med.duration && <p className="ml-4">Duration: {med.duration}</p>}
                  {med.instructions && <p className="ml-4 italic text-gray-600">{med.instructions}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic text-sm">Medications will appear here...</p>
          )}
        </div>

        {/* Additional Notes */}
        {additionalNotes && (
          <div className="border-t border-gray-300 pt-3 mb-4 text-sm">
            <p className="font-semibold mb-1">Notes:</p>
            <p className="italic text-gray-700">{additionalNotes}</p>
          </div>
        )}

        {/* Doctor Signature */}
        <div className="border-t border-gray-300 pt-3 mt-4 text-xs">
          {signatureUrl && (
            <div className="mb-2">
              <img 
                src={signatureUrl} 
                alt="Signature" 
                className="h-12 object-contain mix-blend-darken"
                style={{ 
                  filter: 'contrast(1.2) brightness(1)',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          )}
          
          <p className="font-semibold">{template.doctorName}, {template.professionalTitle}</p>
          <p>Lic. No.: {template.licenseNo}</p>
          {template.ptrNo && <p>PTR No.: {template.ptrNo}</p>}
          {template.s2LicenseNo && <p>S2 No.: {template.s2LicenseNo}</p>}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPreview;
