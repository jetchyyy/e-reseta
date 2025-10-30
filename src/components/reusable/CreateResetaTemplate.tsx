import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface ResetaTemplate {
  // Header Information
  clinicName: string;
  doctorName: string;
  doctorCredentials: string;
  specialty: string;
  
  // Contact Information
  clinicAddress: string;
  clinicRoom?: string;
  clinicCity?: string;
  clinicCountry: string;
  phone: string;
  email: string;
  mobile?: string;
  
  // Clinic Hours
  clinicHours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  
  // Footer Information
  licenseNo: string;
  ptrNo?: string;
  s2LicenseNo?: string;
  
  // Design preferences
  headerColor: string;
  accentColor: string;
  showRxSymbol: boolean;
  paperColor: string;
}

const CreateResetaTemplate: React.FC = () => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingTemplate, setExistingTemplate] = useState<ResetaTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'hours' | 'design'>('basic');
  
  const [template, setTemplate] = useState<ResetaTemplate>({
    clinicName: '',
    doctorName: userData?.displayName || '',
    doctorCredentials: '',
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
    
    try {
      setSaving(true);
      const templateRef = doc(db, 'resetaTemplates', currentUser.uid);
      await setDoc(templateRef, template);
      setExistingTemplate(template);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {existingTemplate ? 'Edit' : 'Create'} Prescription Template
              </h1>
              <p className="text-gray-600">
                Customize how your prescriptions will look
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
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
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex gap-2 border-b border-gray-200 mb-6">
                {[
                  { id: 'basic', label: 'Basic Info', icon: '📋' },
                  { id: 'contact', label: 'Contact', icon: '📞' },
                  { id: 'hours', label: 'Clinic Hours', icon: '🕐' },
                  { id: 'design', label: 'Design', icon: '🎨' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-3 font-medium transition-all relative ${
                      activeTab === tab.id
                        ? 'text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
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
                        Credentials
                      </label>
                      <input
                        type="text"
                        value={template.doctorCredentials}
                        onChange={(e) => updateField('doctorCredentials', e.target.value)}
                        placeholder="e.g., MD, MBAH"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
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
                    <div key={day} className="flex items-center gap-4">
                      <label className="w-32 text-sm font-medium text-gray-700">
                        {day}
                      </label>
                      <input
                        type="text"
                        value={template.clinicHours[day.toLowerCase() as keyof typeof template.clinicHours] || ''}
                        onChange={(e) => updateClinicHours(day.toLowerCase(), e.target.value)}
                        placeholder="e.g., 10am to 12nn (on call)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Design Tab */}
              {activeTab === 'design' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Header Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={template.headerColor}
                          onChange={(e) => updateField('headerColor', e.target.value)}
                          className="w-16 h-12 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={template.headerColor}
                          onChange={(e) => updateField('headerColor', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                          className="w-16 h-12 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={template.accentColor}
                          onChange={(e) => updateField('accentColor', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                        className="w-16 h-12 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={template.paperColor}
                        onChange={(e) => updateField('paperColor', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
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
                    {template.doctorName || 'Doctor Name'}
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
                  <p className="font-semibold">{template.doctorName || 'Doctor Name'}, MD</p>
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
  );
};

export default CreateResetaTemplate;