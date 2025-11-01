import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import CompleteProfileModal from '../components/reusable/CompleteProfileModal';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const { userData, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Show modal when user data is loaded and profile is incomplete
  useEffect(() => {
    // Wait for loading to complete and userData to be available
    if (!loading && userData) {
      
      if (!userData.hasCompletedProfile) {
        setIsModalOpen(true);
      }
    }
  }, [loading, userData]);

  const handleCloseModal = () => {
    // Only allow closing if profile is completed
    if (userData?.hasCompletedProfile) {
      setIsModalOpen(false);
    }
  };

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1FAEE] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1D3557] to-[#457B9D] rounded-2xl mb-6 shadow-lg">
            <svg 
              className="w-8 h-8 text-white animate-pulse" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <div className="w-12 h-12 border-4 border-[#A8DADC] border-t-[#1D3557] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#457B9D] font-medium">Loading your dashboard...</p>
          <p className="text-sm text-[#457B9D]/70 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, Dr. ${userData?.displayName || 'Doctor'}`}
      actions={
        <button
          onClick={() => navigate('/generate-prescription')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white font-medium rounded-xl hover:shadow-lg transition-all transform hover:scale-[1.02]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm">New Rx</span>
        </button>
      }
    >
      {/* Complete Profile Modal */}
      <CompleteProfileModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
      />

      {/* Dashboard Content */}
      <div className="relative">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#A8DADC]/20 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#457B9D]/10 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          {/* Floating Icons Animation */}
          <div className="absolute top-20 left-20 w-12 h-12 opacity-5 animate-float">
            <svg fill="currentColor" viewBox="0 0 24 24" className="text-[#1D3557]">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="absolute top-40 right-32 w-16 h-16 opacity-5 animate-float-delayed">
            <svg fill="currentColor" viewBox="0 0 24 24" className="text-[#457B9D]">
              <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div className="absolute bottom-32 right-20 w-14 h-14 opacity-5 animate-float">
            <svg fill="currentColor" viewBox="0 0 24 24" className="text-[#A8DADC]">
              <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
            {/* Profile Completion Alert */}
            {!userData?.hasCompletedProfile && (
              <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-900 mb-2">Complete Your Profile</h3>
                    <p className="text-sm text-amber-800 mb-4">
                      Add your medical license number and signature to unlock all features.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      Complete Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Prescriptions */}
              <div className="group bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      +0%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1D3557] mb-1">0</h3>
                  <p className="text-sm text-[#457B9D] font-medium">Total Prescriptions</p>
                </div>
              </div>

              {/* This Month */}
              <div className="group bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      +0%
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1D3557] mb-1">0</h3>
                  <p className="text-sm text-[#457B9D] font-medium">This Month</p>
                </div>
              </div>

              {/* Total Patients */}
              <div className="group bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden cursor-pointer"
                onClick={() => navigate('/patients')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1D3557] mb-1">0</h3>
                  <p className="text-sm text-[#457B9D] font-medium">Total Patients</p>
                </div>
              </div>

              {/* Active Templates */}
              <div className="group bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-xl hover:border-cyan-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden cursor-pointer"
                onClick={() => navigate('/create-reseta-template')}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1D3557] mb-1">1</h3>
                  <p className="text-sm text-[#457B9D] font-medium">Active Template</p>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1D3557]/10 to-[#457B9D]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#1D3557]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-[#1D3557]">Recent Activity</h3>
                  </div>
                  <button
                    onClick={() => navigate('/view-prescriptions')}
                    className="flex items-center gap-1 text-sm text-[#457B9D] hover:text-[#1D3557] font-medium transition-colors group"
                  >
                    View All
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Empty State */}
                  <div className="text-center py-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F1FAEE]/30 to-[#A8DADC]/10 rounded-xl"></div>
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-2">No prescriptions yet</h4>
                      <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">Start your journey by creating your first prescription for patients</p>
                      <button
                        onClick={() => navigate('/generate-prescription')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1D3557] to-[#457B9D] text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create First Prescription
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats & Info */}
              <div className="space-y-6">
                {/* System Status */}
                <div className="bg-gradient-to-br from-[#1D3557] via-[#457B9D] to-[#1D3557] rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold">System Status</h4>
                    </div>
                    
                    <p className="text-sm text-white/90 mb-4 leading-relaxed">
                      All systems operational. Your data is secure and encrypted.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute top-0 animate-ping"></div>
                      </div>
                      <span className="text-sm text-white/90 font-medium">Connected & Secure</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
                  <h4 className="font-bold text-[#1D3557] mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate('/generate-prescription')}
                      className="w-full flex items-center gap-3 p-3 bg-[#F1FAEE] hover:bg-[#A8DADC]/20 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-[#1D3557] to-[#457B9D] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-[#1D3557]">New Prescription</span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/patients')}
                      className="w-full flex items-center gap-3 p-3 bg-[#F1FAEE] hover:bg-[#A8DADC]/20 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-[#1D3557]">Manage Patients</span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/view-prescriptions')}
                      className="w-full flex items-center gap-3 p-3 bg-[#F1FAEE] hover:bg-[#A8DADC]/20 rounded-xl transition-all group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-[#1D3557]">View History</span>
                    </button>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-[#1D3557]">Need Help?</h4>
                  </div>
                  <p className="text-sm text-[#457B9D] mb-4">
                    Contact support for assistance
                  </p>
                  <button className="w-full px-4 py-2.5 bg-[#F1FAEE] hover:bg-[#A8DADC] text-[#1D3557] font-medium rounded-xl transition-all border border-[#A8DADC]">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
};

export default LandingPage;