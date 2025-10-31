import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';
import type { ResetaTemplate } from '../../types/prescription';
import { useTemplateValidation } from '../../hooks/useTemplateValidation';
import TemplateBasicInfo from './template/TemplateBasicInfo';
import TemplateContactInfo from './template/TemplateContactInfo';
import TemplateClinicHours from './template/TemplateClinicHours';
import TemplateDesign from './template/TemplateDesign';
import TemplatePreview from './template/TemplatePreview';

const CreateResetaTemplate: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingTemplate, setExistingTemplate] = useState<ResetaTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'hours' | 'design'>('basic');
  
  // Validation hook
  const {
    fieldErrors,
    updateFieldWithValidation,
    validateAllFields,
    clearFieldError,
    clearAllErrors,
  } = useTemplateValidation();
  
  // Refs for accessibility
  const clinicNameRef = useRef<HTMLInputElement>(null);
  const firstErrorFieldRef = useRef<HTMLInputElement>(null);
  
  const [template, setTemplate] = useState<ResetaTemplate>({
    clinicName: '',
    doctorName: userData?.displayName || '',
    doctorCredentials: '',
    professionalTitle: userData?.professionalTitle || 'MD',
    specialty: '',
    clinicAddress: '',
    clinicRoom: '',
    clinicCity: '',
    clinicCountry: 'PHILIPPINES',
    phone: '',
    email: userData?.email || '',
    mobile: '',
    clinicHours: {},
    licenseNo: userData?.licenseNo || '',
    ptrNo: '',
    s2LicenseNo: '',
    headerColor: '#1e40af',
    accentColor: '#6366f1',
    showRxSymbol: true,
    paperColor: '#f5f5dc'
  });

  useEffect(() => {
    loadExistingTemplate();
  }, [currentUser]);

  const loadExistingTemplate = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const templateRef = doc(db, 'resetaTemplates', currentUser.uid);
      const templateDoc = await getDoc(templateRef);
      
      if (templateDoc.exists()) {
        const data = templateDoc.data() as ResetaTemplate;
        setTemplate(data);
        setExistingTemplate(data);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!currentUser) return;
    
    // Validate all fields
    clearAllErrors();
    const errors = validateAllFields(template);
    
    // If there are validation errors
    if (Object.keys(errors).length > 0) {
      // Determine which tab to switch to for the first error
      const firstErrorField = Object.keys(errors)[0];
      if (['clinicName', 'doctorName', 'specialty', 'licenseNo', 'ptrNo', 's2LicenseNo', 'professionalTitle', 'doctorCredentials'].includes(firstErrorField)) {
        setActiveTab('basic');
      } else if (['clinicAddress', 'clinicRoom', 'clinicCity', 'phone', 'mobile', 'email'].includes(firstErrorField)) {
        setActiveTab('contact');
      }
      
      setErrorMessage(`Please fix the validation errors: ${Object.values(errors)[0]}`);
      setShowError(true);
      
      // Focus on first error field after a short delay
      setTimeout(() => {
        firstErrorFieldRef.current?.focus();
      }, 100);
      
      return;
    }
    
    try {
      setSaving(true);
      const templateRef = doc(db, 'resetaTemplates', currentUser.uid);
      await setDoc(templateRef, template);
      setExistingTemplate(template);
      setSaving(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error saving template:', error);
      setErrorMessage('Failed to save template. Please try again.');
      setShowError(true);
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setTemplate(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    clearFieldError(field);
  };

  const handleUpdateFieldWithValidation = (field: string, value: any) => {
    updateFieldWithValidation(field, value, updateField);
  };

  const updateClinicHours = (day: string, hours: string) => {
    setTemplate(prev => ({
      ...prev,
      clinicHours: {
        ...prev.clinicHours,
        [day]: hours
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title={existingTemplate ? 'Edit Prescription Template' : 'Create Prescription Template'}
      subtitle="Customize how your prescriptions will look"
      actions={
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => navigate('/landing')}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
            aria-label="Cancel and return to landing page"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTemplate}
            disabled={saving}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
            aria-label={saving ? 'Saving template' : 'Save template'}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Template</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Navigation */}
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                <div className="flex gap-1 sm:gap-2 border-b border-gray-200 mb-6 overflow-x-auto" role="tablist">
                  {[
                    { id: 'basic', label: 'Basic Info', icon: '📋', shortLabel: 'Basic' },
                    { id: 'contact', label: 'Contact', icon: '📞', shortLabel: 'Contact' },
                    { id: 'hours', label: 'Clinic Hours', icon: '🕐', shortLabel: 'Hours' },
                    { id: 'design', label: 'Design', icon: '🎨', shortLabel: 'Design' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      aria-controls={`${tab.id}-panel`}
                      className={`px-2 sm:px-4 py-2 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                        activeTab === tab.id
                          ? 'text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span className="mr-1 sm:mr-2" aria-hidden="true">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="inline sm:hidden">{tab.shortLabel}</span>
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" aria-hidden="true"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Panels */}
                {activeTab === 'basic' && (
                  <div role="tabpanel" id="basic-panel" aria-labelledby="basic-tab">
                    <TemplateBasicInfo
                      template={template}
                      fieldErrors={fieldErrors}
                      onUpdateField={updateField}
                      onUpdateFieldWithValidation={handleUpdateFieldWithValidation}
                      clinicNameRef={clinicNameRef}
                    />
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div role="tabpanel" id="contact-panel" aria-labelledby="contact-tab">
                    <TemplateContactInfo
                      template={template}
                      fieldErrors={fieldErrors}
                      onUpdateField={updateField}
                      onUpdateFieldWithValidation={handleUpdateFieldWithValidation}
                    />
                  </div>
                )}

                {activeTab === 'hours' && (
                  <div role="tabpanel" id="hours-panel" aria-labelledby="hours-tab">
                    <TemplateClinicHours
                      template={template}
                      onUpdateClinicHours={updateClinicHours}
                    />
                  </div>
                )}

                {activeTab === 'design' && (
                  <div role="tabpanel" id="design-panel" aria-labelledby="design-tab">
                    <TemplateDesign
                      template={template}
                      onUpdateField={updateField}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <TemplatePreview
                template={template}
                userSignature={userData?.signature}
              />
            </div>
          </div>
        </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Template Saved Successfully! 📋"
        message="Your prescription template has been saved. You can now use it to generate professional prescriptions for your patients."
        icon="check"
        autoCloseDelay={2500}
        showConfetti={false}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title="Validation Error"
        message={errorMessage}
        errorType="warning"
      />
    </DashboardLayout>
  );
};

export default CreateResetaTemplate;
