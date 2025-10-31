import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import CompleteProfileModal from '../components/reusable/CompleteProfileModal';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { currentUser, userData, signOut, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Show modal when user data is loaded and profile is incomplete
  useEffect(() => {
    // Wait for loading to complete and userData to be available
    if (!loading && userData) {
      console.log('User data loaded:', userData); // Debug log
      console.log('Has completed profile:', userData.hasCompletedProfile); // Debug log
      
      if (!userData.hasCompletedProfile) {
        setIsModalOpen(true);
      }
    }
  }, [loading, userData]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCloseModal = () => {
    // Only allow closing if profile is completed
    if (userData?.hasCompletedProfile) {
      setIsModalOpen(false);
    }
  };

  const handleNavigateToTemplate = () => {
    navigate('/create-reseta-template');
  };

  const handleNavigateToPrescription = () => {
    navigate('/generate-prescription');
  };

  const handleNavigateToHistory = () => {
    navigate('/view-prescriptions');
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Complete Profile Modal */}
      <CompleteProfileModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
      />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
                <svg 
                  className="w-6 h-6 text-indigo-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">E-Reseta</h1>
                <p className="text-xs text-gray-500">Electronic Prescription System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentUser && (
                <>
                  <div className="flex items-center gap-3">
                    <img 
                      src={currentUser.photoURL || ''} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full border-2 border-indigo-100"
                    />
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser.displayName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, Dr. {userData?.displayName || currentUser?.displayName}!
                </h2>
                <p className="text-gray-600">
                  Manage your prescriptions and patient care efficiently
                </p>
              </div>
            </div>

            {userData?.hasCompletedProfile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-900">Profile Complete</p>
                    <p className="text-xs text-green-700">License No: {userData.licenseNo}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={handleNavigateToPrescription}
                    className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-xl transition-all group"
                  >
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">New Prescription</p>
                      <p className="text-xs text-gray-600">Create prescription</p>
                    </div>
                  </button>

                  <button 
                    onClick={handleNavigateToHistory}
                    className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all group"
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Prescription List</p>
                      <p className="text-xs text-gray-600">Past prescriptions</p>
                    </div>
                  </button>

                  <button 
                    onClick={handleNavigateToTemplate}
                    className="flex items-center gap-3 p-4 bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 rounded-xl transition-all group"
                  >
                    <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Prescription Template</p>
                      <p className="text-xs text-gray-600">Customize layout</p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-xl transition-all group">
                    <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Settings</p>
                      <p className="text-xs text-gray-600">Account preferences</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
                <div className="flex gap-4">
                  <svg className="w-8 h-8 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-yellow-900 mb-2">
                      Complete Your Profile
                    </h3>
                    <p className="text-sm text-yellow-800 mb-4">
                      Add your medical license number to start creating prescriptions and accessing all features.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
                    >
                      Complete Profile Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats / Info Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">Total Prescriptions</span>
                  <span className="text-lg font-bold text-blue-600">0</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">This Month</span>
                  <span className="text-lg font-bold text-green-600">0</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-semibold">System Status</h4>
              </div>
              <p className="text-sm text-indigo-100 mb-3">
                All systems operational. Secure connection established.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-indigo-100">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;