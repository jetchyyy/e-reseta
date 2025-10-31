import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';
import type { ResetaTemplate } from '../../types/prescription';

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
    
    // Validation
    if (!template.clinicName.trim()) {
      setErrorMessage('Please enter clinic name');
      setShowError(true);
      return;
    }
    if (!template.doctorName.trim()) {
      setErrorMessage('Please enter doctor name');
      setShowError(true);
      return;
    }
    if (!template.specialty.trim()) {
      setErrorMessage('Please enter specialty');
      setShowError(true);
      return;
    }
    if (!template.clinicAddress.trim()) {
      setErrorMessage('Please enter clinic address');
      setShowError(true);
      return;
    }
    if (!template.phone.trim()) {
      setErrorMessage('Please enter phone number');
      setShowError(true);
      return;
    }
    if (!template.email.trim()) {
      setErrorMessage('Please enter email');
      setShowError(true);
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {existingTemplate ? 'Edit' : 'Create'} Prescription Template
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Customize how your prescriptions will look
                </p>
              </div>
              <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate('/landing')}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Navigation */}
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                <div className="flex gap-1 sm:gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
                  {[
                    { id: 'basic', label: 'Basic Info', icon: '📋', shortLabel: 'Basic' },
                    { id: 'contact', label: 'Contact', icon: '📞', shortLabel: 'Contact' },
                    { id: 'hours', label: 'Clinic Hours', icon: '🕐', shortLabel: 'Hours' },
                    { id: 'design', label: 'Design', icon: '🎨', shortLabel: 'Design' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-2 sm:px-4 py-2 sm:py-3 font-medium transition-all relative whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                        activeTab === tab.id
                          ? 'text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <span className="mr-1 sm:mr-2">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="inline sm:hidden">{tab.shortLabel}</span>
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinic/Institute Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={template.clinicName}
                        onChange={(e) => updateField('clinicName', e.target.value)}
                        placeholder="e.g., THE KNEE ARTHRITIS & ORTHOPAEDIC INSTITUTE"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Doctor Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={template.doctorName}
                          onChange={(e) => updateField('doctorName', e.target.value)}
                          placeholder="e.g., Rene Catan"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Professional Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={template.professionalTitle}
                          onChange={(e) => updateField('professionalTitle', e.target.value)}
                          placeholder="e.g., MD, DO, RN"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This appears after your name (e.g., MD, DO, RN)
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credentials
                      </label>
                      <input
                        type="text"
                        value={template.doctorCredentials}
                        onChange={(e) => updateField('doctorCredentials', e.target.value)}
                        placeholder="e.g., MBAH, FPOA (Additional credentials)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Additional credentials beyond your professional title
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialty <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={template.specialty}
                        onChange={(e) => updateField('specialty', e.target.value)}
                        placeholder="e.g., Orthopaedic Surgeon"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          License No. <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={template.licenseNo}
                          onChange={(e) => updateField('licenseNo', e.target.value)}
                          placeholder="e.g., 60125"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This is your license number from your profile
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PTR No. (Optional)
                        </label>
                        <input
                          type="text"
                          value={template.ptrNo}
                          onChange={(e) => updateField('ptrNo', e.target.value)}
                          placeholder="PTR Number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        S2 License No. (Optional)
                      </label>
                      <input
                        type="text"
                        value={template.s2LicenseNo}
                        onChange={(e) => updateField('s2LicenseNo', e.target.value)}
                        placeholder="S2 License Number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clinic Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={template.clinicAddress}
                        onChange={(e) => updateField('clinicAddress', e.target.value)}
                        placeholder="e.g., E. Rodriguez Sr., Blvd."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Room/Floor (Optional)
                        </label>
                        <input
                          type="text"
                          value={template.clinicRoom}
                          onChange={(e) => updateField('clinicRoom', e.target.value)}
                          placeholder="e.g., Room 709 -MAB"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={template.clinicCity}
                          onChange={(e) => updateField('clinicCity', e.target.value)}
                          placeholder="e.g., Quezon City 1600"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={template.clinicCountry}
                        onChange={(e) => updateField('clinicCountry', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={template.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="e.g., (02) 893 5762"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile (Optional)
                        </label>
                        <input
                          type="tel"
                          value={template.mobile}
                          onChange={(e) => updateField('mobile', e.target.value)}
                          placeholder="e.g., 09285006794"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={template.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Clinic Hours Tab */}
                {activeTab === 'hours' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Enter clinic hours for each day. Leave blank for days you're not available.
                    </p>
                    
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <label className="w-full sm:w-32 text-sm font-medium text-gray-700">
                          {day}
                        </label>
                        <input
                          type="text"
                          value={template.clinicHours[day.toLowerCase() as keyof typeof template.clinicHours] || ''}
                          onChange={(e) => updateClinicHours(day.toLowerCase(), e.target.value)}
                          placeholder="e.g., 10am to 12nn (on call)"
                          className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Design Tab */}
                {activeTab === 'design' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header Color
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={template.headerColor}
                            onChange={(e) => updateField('headerColor', e.target.value)}
                            className="w-12 sm:w-16 h-10 sm:h-12 rounded-lg cursor-pointer flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={template.headerColor}
                            onChange={(e) => updateField('headerColor', e.target.value)}
                            className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Accent Color
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={template.accentColor}
                            onChange={(e) => updateField('accentColor', e.target.value)}
                            className="w-12 sm:w-16 h-10 sm:h-12 rounded-lg cursor-pointer flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={template.accentColor}
                            onChange={(e) => updateField('accentColor', e.target.value)}
                            className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paper Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={template.paperColor}
                          onChange={(e) => updateField('paperColor', e.target.value)}
                          className="w-12 sm:w-16 h-10 sm:h-12 rounded-lg cursor-pointer flex-shrink-0"
                        />
                        <input
                          type="text"
                          value={template.paperColor}
                          onChange={(e) => updateField('paperColor', e.target.value)}
                          className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Default beige color mimics traditional prescription paper
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showRx"
                        checked={template.showRxSymbol}
                        onChange={(e) => updateField('showRxSymbol', e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <label htmlFor="showRx" className="text-sm font-medium text-gray-700">
                        Show Rx Symbol on prescription
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1">
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
            </div>
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
    </>
  );
};

export default CreateResetaTemplate;