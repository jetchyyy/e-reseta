import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import SuccessModal from './SuccessModal';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { updateUserProfile, userData } = useAuth();
  const [licenseNo, setLicenseNo] = useState(userData?.licenseNo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Load existing signature if available
        if (userData?.signature) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            setHasSignature(true);
          };
          img.src = userData.signature;
        }
      }
    }
  }, [isOpen, userData?.signature]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = async () => {
    if (!licenseNo.trim()) {
      setError('License number is required');
      return;
    }

    if (licenseNo.trim().length < 5) {
      setError('Please enter a valid license number');
      return;
    }

    if (!hasSignature) {
      setError('Please draw your signature');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setLoading(true);
      setError('');
      const signatureData = canvas.toDataURL('image/png');
      await updateUserProfile(licenseNo.trim(), signatureData);
      setLoading(false);
      onClose();
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (userData?.hasCompletedProfile) {
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && licenseNo.trim() && hasSignature) {
      handleSubmit();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
          {userData?.hasCompletedProfile && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p className="text-gray-600">
              Please provide your medical license number and signature to continue
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="licenseNo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Medical License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="licenseNo"
                value={licenseNo}
                onChange={(e) => {
                  setLicenseNo(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter your license number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be used to verify your credentials
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Draw Your Signature <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  This will appear on generated prescriptions
                </p>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                You can edit this later in your profile menu
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Why do we need this?
                  </p>
                  <p className="text-xs text-blue-700">
                    Your license number and signature ensure that only verified healthcare
                    professionals can generate prescriptions through our system.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !licenseNo.trim() || !hasSignature}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Complete Profile</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Your information is encrypted and secure
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Profile Completed! 🎉"
        message="Your medical license and signature have been saved successfully. You can now create prescription templates and generate prescriptions."
        icon="celebration"
        autoCloseDelay={4000}
        showConfetti={true}
      />
    </>
  );
};

export default CompleteProfileModal;