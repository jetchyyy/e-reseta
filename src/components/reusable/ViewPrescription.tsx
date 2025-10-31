import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { toJpeg } from 'html-to-image';
import ErrorModal from './ErrorModal';
import type { Prescription } from '../../types/prescription';

const ViewPrescriptions: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState('');

  useEffect(() => {
    loadPrescriptions();
  }, [currentUser]);

  // Convert signature URL to base64 for better iOS compatibility
  useEffect(() => {
    const loadSignature = async () => {
      if (userData?.signature) {
        try {
          const response = await fetch(userData.signature);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setSignatureBase64(reader.result as string);
          };
          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error loading signature:', error);
          // Fallback to original URL if conversion fails
          setSignatureBase64(userData.signature);
        }
      }
    };
    
    loadSignature();
  }, [userData?.signature]);

 const loadPrescriptions = async () => {
  if (!currentUser) return;

  try {
    setLoading(true);
    const prescriptionsRef = collection(db, 'prescriptions');
    const q = query(
      prescriptionsRef,
      where('doctorId', '==', currentUser.uid)
    );

    const querySnapshot = await getDocs(q);
    const loadedPrescriptions: Prescription[] = [];

    querySnapshot.forEach((doc) => {
      loadedPrescriptions.push({
        id: doc.id,
        ...doc.data()
      } as Prescription);
    });

    // Sort in JavaScript instead of Firestore to avoid composite index requirement
    loadedPrescriptions.sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() || 0;
      const bTime = b.createdAt?.toMillis?.() || 0;
      return bTime - aTime; // descending order (newest first)
    });

    setPrescriptions(loadedPrescriptions);
  } catch (error) {
    console.error('Error loading prescriptions:', error);
    setErrorMessage('Failed to load prescriptions. Please try again.');
    setShowError(true);
  } finally {
    setLoading(false);
  }
};

const handleDeletePrescription = async (prescriptionId: string) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'prescriptions', prescriptionId));
      
      setPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
      
      if (selectedPrescription?.id === prescriptionId) {
        setSelectedPrescription(null);
      }
      
      // Success feedback would be better with a toast, but we'll keep it simple for now
    } catch (error) {
      console.error('Error deleting prescription:', error);
      setErrorMessage('Failed to delete prescription. Please try again.');
      setShowError(true);
    }
  };

  const handlePrintPrescription = () => {
    window.print();
  };

  const prescriptionRef = useRef<HTMLDivElement>(null);

const handleSaveAsJPG = async () => {
  if (!prescriptionRef.current) {
    setErrorMessage('Prescription preview not found.');
    setShowError(true);
    return;
  }

  try {
    setIsGeneratingImage(true);
    
    // Small delay to ensure signature is fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const dataUrl = await toJpeg(prescriptionRef.current, {
      quality: 0.95,
      backgroundColor: 'white',
      pixelRatio: 2,
      cacheBust: true,
      skipAutoScale: false,
    });

    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File(
        [blob], 
        `${selectedPrescription?.patientInfo.name.replace(/\s+/g, '_') || 'prescription'}_${new Date().getTime()}.jpg`, 
        { type: 'image/jpeg' }
      );

      try {
        await navigator.share({
          files: [file],
          title: 'Prescription',
          text: `Prescription for ${selectedPrescription?.patientInfo.name}`
        });
        return;
      } catch (shareError) {
        console.log('Share failed, falling back to download:', shareError);
      }
    }

    const link = document.createElement('a');
    link.download = `${selectedPrescription?.patientInfo.name.replace(/\s+/g, '_') || 'prescription'}_${new Date().getTime()}.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message using ErrorModal with info type
    setErrorMessage('Image saved successfully! Check your Downloads folder or Gallery.');
    setShowError(true);
  } catch (error) {
    console.error('Error saving JPG:', error);
    setErrorMessage('Failed to save as JPG. Please try again or use the Print option.');
    setShowError(true);
  } finally {
    setIsGeneratingImage(false);
  }
};

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.patientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Prescription History
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                View and manage all your prescriptions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/landing')}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/generate-prescription')}
                className="px-4 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Prescription</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">All Prescriptions</h2>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search patient or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('archived')}
                  className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filterStatus === 'archived'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Archived
                </button>
              </div>
            </div>

            <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-900">
                <span className="font-bold">{filteredPrescriptions.length}</span> prescription{filteredPrescriptions.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No prescriptions found</p>
                </div>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    onClick={() => setSelectedPrescription(prescription)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPrescription?.id === prescription.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {prescription.patientInfo.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        prescription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prescription.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {prescription.patientInfo.age} years, {prescription.patientInfo.sex}
                    </p>
                    {prescription.diagnosis && (
                      <p className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(prescription.prescriptionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedPrescription ? (
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Prescription Details</h2>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handlePrintPrescription}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print
                    </button>
                    <button
                      onClick={handleSaveAsJPG}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Save as JPG
                    </button>
                    <button
                      onClick={() => handleDeletePrescription(selectedPrescription.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>

                <div 
                  ref={prescriptionRef}
                  className="border-2 border-gray-300 rounded-lg p-4 sm:p-8"
                  style={{ backgroundColor: selectedPrescription.template.paperColor }}
                >
                  <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
                    <h3 className="font-bold text-xl sm:text-2xl mb-2" style={{ color: selectedPrescription.template.headerColor }}>
                      {selectedPrescription.template.clinicName}
                    </h3>
                    <p className="font-semibold text-base sm:text-lg mb-1">
                      {selectedPrescription.template.doctorName}
                      {selectedPrescription.template.doctorCredentials && `, ${selectedPrescription.template.doctorCredentials}`}
                    </p>
                    <p className="text-sm sm:text-base text-gray-600">{selectedPrescription.template.specialty}</p>
                  </div>

                  <div className="mb-6 text-sm">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="font-semibold mb-2">Address:</p>
                        {selectedPrescription.template.clinicRoom && <p>{selectedPrescription.template.clinicRoom}</p>}
                        <p>{selectedPrescription.template.clinicAddress}</p>
                        {selectedPrescription.template.clinicCity && <p>{selectedPrescription.template.clinicCity}</p>}
                        <p>{selectedPrescription.template.clinicCountry}</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Contact:</p>
                        <p>Phone: {selectedPrescription.template.phone}</p>
                        {selectedPrescription.template.mobile && <p>Mobile: {selectedPrescription.template.mobile}</p>}
                        <p>Email: {selectedPrescription.template.email}</p>
                      </div>
                    </div>
                    
                    {Object.keys(selectedPrescription.template.clinicHours).length > 0 && 
                     Object.values(selectedPrescription.template.clinicHours).some(v => v) && (
                      <div className="border-t border-gray-300 pt-3 mt-3">
                        <p className="font-semibold mb-2">Clinic Hours:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(selectedPrescription.template.clinicHours).map(([day, hours]) => 
                            hours ? (
                              <p key={day} className="capitalize">
                                <span className="font-medium">{day}:</span> {hours}
                              </p>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 border-t-2 border-gray-300 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Patient Name:</strong> {selectedPrescription.patientInfo.name}</p>
                        {selectedPrescription.patientInfo.age && <p><strong>Age:</strong> {selectedPrescription.patientInfo.age}</p>}
                        {selectedPrescription.patientInfo.sex && <p><strong>Sex:</strong> {selectedPrescription.patientInfo.sex}</p>}
                      </div>
                      <div>
                        <p><strong>Date:</strong> {new Date(selectedPrescription.prescriptionDate).toLocaleDateString()}</p>
                        {selectedPrescription.patientInfo.address && (
                          <p><strong>Address:</strong> {selectedPrescription.patientInfo.address}</p>
                        )}
                        {selectedPrescription.patientInfo.contactNumber && (
                          <p><strong>Contact:</strong> {selectedPrescription.patientInfo.contactNumber}</p>
                        )}
                      </div>
                    </div>
                    {selectedPrescription.diagnosis && (
                      <p className="mt-3"><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
                    )}
                  </div>

                  {selectedPrescription.template.showRxSymbol && (
                    <div className="text-5xl font-serif mb-4" style={{ color: selectedPrescription.template.accentColor }}>
                      ℞
                    </div>
                  )}

                  <div className="border-t-2 border-gray-300 pt-4 mb-6">
                    <h4 className="font-bold text-lg mb-3">Medications:</h4>
                    <div className="space-y-4">
                      {selectedPrescription.medications.map((med, idx) => (
                        <div key={med.id} className="ml-4">
                          <p className="font-semibold">
                            {idx + 1}. {med.name} {med.dosage}
                          </p>
                          {med.frequency && <p className="ml-4">Sig: {med.frequency}</p>}
                          {med.duration && <p className="ml-4">Duration: {med.duration}</p>}
                          {med.instructions && <p className="ml-4 italic text-gray-700">{med.instructions}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPrescription.additionalNotes && (
                    <div className="border-t-2 border-gray-300 pt-4 mb-6">
                      <h4 className="font-bold text-lg mb-2">Additional Notes:</h4>
                      <p className="italic text-gray-700 ml-4">{selectedPrescription.additionalNotes}</p>
                    </div>
                  )}

                  <div className="border-t-2 border-gray-300 pt-4 mt-8">
                    {signatureBase64 && (
                      <div className="mb-3">
                        <img 
                          src={signatureBase64} 
                          alt="Signature" 
                          className="h-12 object-contain"
                          style={{ 
                            filter: 'contrast(1.2) brightness(1)',
                            backgroundColor: 'transparent'
                          }}
                        />
                      </div>
                    )}
                    
                    <p className="font-semibold text-lg">{selectedPrescription.template.doctorName}</p>
                    <p className="text-sm">License No.: {selectedPrescription.template.licenseNo}</p>
                    {selectedPrescription.template.ptrNo && (
                      <p className="text-sm">PTR No.: {selectedPrescription.template.ptrNo}</p>
                    )}
                    {selectedPrescription.template.s2LicenseNo && (
                      <p className="text-sm">S2 License No.: {selectedPrescription.template.s2LicenseNo}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Prescription Selected</h3>
                <p className="text-gray-600">
                  Select a prescription from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMessage}
        errorType="error"
      />

      {/* Loading Overlay */}
      {isGeneratingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-2xl max-w-sm mx-4">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-green-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Image</h3>
            <p className="text-gray-600 text-center">Please wait while we create your prescription image...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPrescriptions;