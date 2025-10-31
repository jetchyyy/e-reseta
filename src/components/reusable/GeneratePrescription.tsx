import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';
import type { ResetaTemplate, Medication, PatientInfo } from '../../types/prescription';

const GeneratePrescription: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [template, setTemplate] = useState<ResetaTemplate | null>(null);
  const [hasTemplate, setHasTemplate] = useState(false);
  const [templateLoadTime, setTemplateLoadTime] = useState<Date | null>(null);
  
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    age: '',
    sex: '',
    address: '',
    contactNumber: ''
  });

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }
  ]);

  const [diagnosis, setDiagnosis] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadTemplate();
  }, [currentUser]);

  const loadTemplate = async (isRefresh = false) => {
    if (!currentUser) return;
    
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const templateRef = doc(db, 'resetaTemplates', currentUser.uid);
      const templateDoc = await getDoc(templateRef);
      
      if (templateDoc.exists()) {
        const loadedTemplate = templateDoc.data() as ResetaTemplate;
        setTemplate(loadedTemplate);
        setHasTemplate(true);
        setTemplateLoadTime(new Date());
        
        if (isRefresh) {
          const alertDiv = document.createElement('div');
          alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
          alertDiv.textContent = 'Template refreshed successfully!';
          document.body.appendChild(alertDiv);
          setTimeout(() => alertDiv.remove(), 3000);
        }
      } else {
        setHasTemplate(false);
        setTemplate(null);
        setTemplateLoadTime(null);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      setHasTemplate(false);
      setErrorMessage('Failed to load template. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefreshTemplate = () => {
    loadTemplate(true);
  };

  const addMedication = () => {
    const newMed: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setMedications([...medications, newMed]);
  };

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const updatePatientInfo = (field: keyof PatientInfo, value: string) => {
    setPatientInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePrescription = async () => {
    if (!currentUser || !template) return;

    if (!patientInfo.name) {
      setErrorMessage('Please fill in required patient information (Name)');
      setShowError(true);
      return;
    }

    const hasValidMedication = medications.some(med => med.name.trim() !== '');
    if (!hasValidMedication) {
      setErrorMessage('Please add at least one medication');
      setShowError(true);
      return;
    }

    try {
      setSaving(true);
      
      const templateRef = doc(db, 'resetaTemplates', currentUser.uid);
      const templateDoc = await getDoc(templateRef);
      const latestTemplate = templateDoc.exists() ? templateDoc.data() as ResetaTemplate : template;
      
      const prescriptionData = {
        doctorId: currentUser.uid,
        patientInfo,
        medications: medications.filter(med => med.name.trim() !== ''),
        diagnosis,
        additionalNotes,
        prescriptionDate,
        template: latestTemplate,
        createdAt: serverTimestamp(),
        status: 'active'
      };

      const prescriptionsRef = collection(db, 'prescriptions');
      await addDoc(prescriptionsRef, prescriptionData);
      
      setSaving(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        setPatientInfo({
          name: '',
          age: '',
          sex: '',
          address: '',
          contactNumber: ''
        });
        setMedications([{
          id: '1',
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }]);
        setDiagnosis('');
        setAdditionalNotes('');
        setPrescriptionDate(new Date().toISOString().split('T')[0]);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving prescription:', error);
      setErrorMessage('Failed to save prescription. Please try again.');
      setShowError(true);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasTemplate || !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Template Found</h2>
          <p className="text-gray-600 mb-6">
            You need to create a prescription template first before generating prescriptions.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/create-reseta-template')}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all"
            >
              Create Template
            </button>
            <button
              onClick={() => navigate('/landing')}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Generate Prescription</h1>
                <p className="text-sm sm:text-base text-gray-600">Create a new prescription for your patient</p>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/landing')}
                  className="flex-1 sm:flex-none px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrescription}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">Save Prescription</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Using Template: {template.clinicName}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {templateLoadTime && `Loaded at ${templateLoadTime.toLocaleTimeString()}`}
                    {' • '}
                    <button 
                      onClick={() => navigate('/create-reseta-template')}
                      className="text-indigo-600 hover:text-indigo-700 font-medium underline"
                    >
                      Edit Template
                    </button>
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefreshTemplate}
                disabled={refreshing}
                className="w-full sm:w-auto px-4 py-2 bg-white border-2 border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {refreshing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-medium">Refresh Template</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Patient Information
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={patientInfo.name}
                        onChange={(e) => updatePatientInfo('name', e.target.value)}
                        placeholder="Juan Dela Cruz"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age (Optional)
                        </label>
                        <input
                          type="text"
                          value={patientInfo.age}
                          onChange={(e) => updatePatientInfo('age', e.target.value)}
                          placeholder="25"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sex (Optional)
                        </label>
                        <select
                          value={patientInfo.sex}
                          onChange={(e) => updatePatientInfo('sex', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={patientInfo.address}
                      onChange={(e) => updatePatientInfo('address', e.target.value)}
                      placeholder="123 Main St, City"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      value={patientInfo.contactNumber}
                      onChange={(e) => updatePatientInfo('contactNumber', e.target.value)}
                      placeholder="09123456789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Date</label>
                    <input
                      type="date"
                      value={prescriptionDate}
                      onChange={(e) => setPrescriptionDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Diagnosis (Optional)
                </h2>
                
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Medications
                  </h2>
                  <button
                    onClick={addMedication}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Medication
                  </button>
                </div>

                <div className="space-y-4">
                  {medications.map((med, index) => (
                    <div key={med.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Medication #{index + 1}
                        </span>
                        {medications.length > 1 && (
                          <button
                            onClick={() => removeMedication(med.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Medication Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                            placeholder="e.g., Amoxicillin"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                            placeholder="e.g., 500mg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                            placeholder="e.g., 3 times daily"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={med.duration}
                            onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                            placeholder="e.g., Take after meals"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Additional Notes
                </h2>
                
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any additional instructions or notes..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:sticky lg:top-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Preview</h3>
                
                <div 
                  className="border-2 border-gray-300 rounded-lg p-4 text-xs"
                  style={{ backgroundColor: template.paperColor }}
                >
                  <div className="text-center mb-3 pb-2 border-b-2 border-gray-300">
                    <h4 className="font-bold text-sm mb-1" style={{ color: template.headerColor }}>
                      {template.clinicName}
                    </h4>
                    <p className="font-semibold text-[10px]">
                      {template.doctorName}, {template.professionalTitle}
                      {template.doctorCredentials && `, ${template.doctorCredentials}`}
                    </p>
                    <p className="text-gray-600 text-[10px]">{template.specialty}</p>
                  </div>

                  <div className="mb-3 text-[9px]">
                    <div className="grid grid-cols-2 gap-2 mb-2">
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

                  <div className="mb-3 text-[10px] border-t border-gray-300 pt-2">
                    <p><strong>Patient:</strong> {patientInfo.name || 'N/A'}</p>
                    <p><strong>Age/Sex:</strong> {patientInfo.age || 'N/A'} / {patientInfo.sex || 'N/A'}</p>
                    <p><strong>Date:</strong> {prescriptionDate}</p>
                    {diagnosis && <p><strong>Diagnosis:</strong> {diagnosis}</p>}
                  </div>

                  {template.showRxSymbol && (
                    <div className="text-3xl font-serif mb-2" style={{ color: template.accentColor }}>
                      ℞
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-2 mb-3">
                    {medications.filter(m => m.name).length > 0 ? (
                      <div className="space-y-2 text-[10px]">
                        {medications.filter(m => m.name).map((med, idx) => (
                          <div key={med.id} className="mb-2">
                            <p className="font-semibold">{idx + 1}. {med.name} {med.dosage}</p>
                            {med.frequency && <p className="ml-3">Frequency: {med.frequency}</p>}
                            {med.duration && <p className="ml-3">Duration: {med.duration}</p>}
                            {med.instructions && <p className="ml-3 italic">{med.instructions}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic text-[10px]">Medications will appear here...</p>
                    )}
                  </div>

                  {additionalNotes && (
                    <div className="border-t border-gray-300 pt-2 mb-3 text-[10px]">
                      <p className="font-semibold mb-1">Notes:</p>
                      <p className="italic">{additionalNotes}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-2 mt-3 text-[9px]">
                    {userData?.signature && (
                      <div className="mb-1">
                        <img 
                          src={userData.signature} 
                          alt="Signature" 
                          className="h-8 object-contain mix-blend-darken"
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

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-900">
                    💡 Preview updates as you fill in the form
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Prescription Saved! 💊"
        message="The prescription has been successfully saved. You can now print it or save it in your prescriptions list."
        icon="check"
        autoCloseDelay={3500}
        showConfetti={false}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Error"
        message={errorMessage}
        errorType="error"
      />
    </>
  );
};

export default GeneratePrescription;