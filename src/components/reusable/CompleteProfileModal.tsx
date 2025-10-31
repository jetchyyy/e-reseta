import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import SuccessModal from './SuccessModal';
import { validateLicenseNumber } from '../../utils/validation';

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
  const [licenseError, setLicenseError] = useState('');
  const [signatureError, setSignatureError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Focus management: Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        licenseInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Canvas initialization and signature loading
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      
      // Make canvas responsive to container width
      if (container) {
        const resizeCanvas = () => {
          const containerWidth = container.offsetWidth;
          const scale = containerWidth / 400; // 400 is the base width
          canvas.style.width = `${containerWidth}px`;
          canvas.style.height = `${150 * scale}px`;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        return () => window.removeEventListener('resize', resizeCanvas);
      }
      
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

  // Keyboard navigation: Escape key support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && userData?.hasCompletedProfile) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, userData?.hasCompletedProfile]);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent default touch behavior (scrolling, zooming)
    if ('touches' in e) {
      e.preventDefault();
    }

    // Save current state for undo functionality
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev, imageData]);

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = 'touches' in e 
      ? (e.touches[0].clientX - rect.left) * scaleX
      : (e.clientX - rect.left) * scaleX;
    const y = 'touches' in e 
      ? (e.touches[0].clientY - rect.top) * scaleY
      : (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Prevent default touch behavior
    if ('touches' in e) {
      e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = 'touches' in e 
      ? (e.touches[0].clientX - rect.left) * scaleX
      : (e.clientX - rect.left) * scaleX;
    const y = 'touches' in e 
      ? (e.touches[0].clientY - rect.top) * scaleY
      : (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5; // Slightly thicker for better visibility on mobile
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
    setSignatureError('');
    setStrokeHistory([]); // Clear undo history
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokeHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the last saved state
    const previousState = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);

    // Remove the last state from history
    setStrokeHistory((prev) => prev.slice(0, -1));

    // Check if canvas is now empty
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const isEmpty = imageData.data.every((value, index) => {
      // Check if all pixels are white (255, 255, 255, 255)
      return index % 4 === 3 ? value === 255 : value === 255;
    });

    if (isEmpty || strokeHistory.length === 1) {
      setHasSignature(false);
    }
  };

  // Inline validation for license number
  const validateLicense = (value: string): string => {
    if (!value.trim()) {
      return 'License number is required';
    }
    const validation = validateLicenseNumber(value.trim());
    return validation.isValid ? '' : validation.error || 'Invalid license number';
  };

  // Handle license number change with inline validation
  const handleLicenseChange = (value: string) => {
    setLicenseNo(value);
    setError('');
    // Only show validation error if user has typed something and then it becomes invalid
    if (value.trim()) {
      const validationError = validateLicense(value);
      setLicenseError(validationError);
    } else {
      setLicenseError('');
    }
  };

  // Validate signature canvas
  const validateSignature = (): boolean => {
    if (!hasSignature) {
      setSignatureError('Please draw your signature');
      return false;
    }
    setSignatureError('');
    return true;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setError('');
    setLicenseError('');
    setSignatureError('');

    // Validate license number
    const licenseValidationError = validateLicense(licenseNo);
    if (licenseValidationError) {
      setLicenseError(licenseValidationError);
      licenseInputRef.current?.focus();
      return;
    }

    // Validate signature
    if (!validateSignature()) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setLoading(true);
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
      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isOpen ? 'Complete your profile dialog opened' : ''}
      </div>

      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-profile-title"
        aria-describedby="complete-profile-description"
      >
        <div 
          ref={modalRef}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
        >
          {userData?.hasCompletedProfile && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
              aria-label="Close dialog"
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4" aria-hidden="true">
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
            <h2 id="complete-profile-title" className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h2>
            <p id="complete-profile-description" className="text-gray-600">
              Please provide your medical license number and signature to continue
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="licenseNo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Medical License Number <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                ref={licenseInputRef}
                type="text"
                id="licenseNo"
                value={licenseNo}
                onChange={(e) => handleLicenseChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your license number"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                  licenseError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                aria-invalid={!!licenseError}
                aria-describedby={licenseError ? 'license-error' : 'license-help'}
                required
              />
              {licenseError && (
                <p id="license-error" className="mt-1 text-sm text-red-600" role="alert">
                  {licenseError}
                </p>
              )}
              <p id="license-help" className="mt-1 text-xs text-gray-500">
                This will be used to verify your credentials
              </p>
            </div>

            <div>
              <label htmlFor="signature-canvas" className="block text-sm font-medium text-gray-700 mb-2">
                Draw Your Signature <span className="text-red-500" aria-label="required">*</span>
              </label>
              <div 
                ref={canvasContainerRef}
                className={`border-2 rounded-lg overflow-hidden bg-white ${
                  signatureError ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <canvas
                  id="signature-canvas"
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full cursor-crosshair"
                  style={{ touchAction: 'none' }} // Prevent touch scrolling/zooming
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  aria-label="Signature drawing canvas"
                  aria-describedby={signatureError ? 'signature-error' : 'signature-help'}
                  role="img"
                />
              </div>
              {signatureError && (
                <p id="signature-error" className="mt-1 text-sm text-red-600" role="alert">
                  {signatureError}
                </p>
              )}
              <div className="flex items-center justify-between mt-2 gap-2">
                <p id="signature-help" className="text-xs text-gray-500">
                  This will appear on generated prescriptions
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={undoLastStroke}
                    disabled={loading || strokeHistory.length === 0}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-3 py-2 min-h-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    aria-label="Undo last stroke"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span className="ml-1">Undo</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-3 py-2 min-h-[44px] flex items-center justify-center"
                    disabled={loading}
                    aria-label="Clear signature"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="ml-1">Clear</span>
                  </button>
                </div>
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
              ref={submitButtonRef}
              onClick={handleSubmit}
              disabled={loading || !licenseNo.trim() || !hasSignature}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 min-h-[44px]"
              aria-label={loading ? 'Saving profile' : 'Complete profile and continue'}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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