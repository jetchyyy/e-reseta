import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list' | 'prescription';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

/**
 * SkeletonLoader - A flexible loading skeleton component
 * Replaces traditional spinners with content-aware loading states
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width = '100%',
  height,
  count = 1,
  className = '',
}) => {
  const baseClass = 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';

  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div
            className={`${baseClass} rounded h-4 ${className}`}
            style={{ width, height: height || '1rem' }}
            role="status"
            aria-label="Loading text content"
          >
            <span className="sr-only">Loading...</span>
          </div>
        );

      case 'circular':
        return (
          <div
            className={`${baseClass} rounded-full ${className}`}
            style={{ 
              width: width || '40px', 
              height: height || width || '40px' 
            }}
            role="status"
            aria-label="Loading circular content"
          >
            <span className="sr-only">Loading...</span>
          </div>
        );

      case 'rectangular':
        return (
          <div
            className={`${baseClass} rounded-lg ${className}`}
            style={{ width, height: height || '200px' }}
            role="status"
            aria-label="Loading content"
          >
            <span className="sr-only">Loading...</span>
          </div>
        );

      case 'card':
        return (
          <div 
            className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}
            role="status"
            aria-label="Loading card"
          >
            <div className="space-y-4">
              {/* Header skeleton */}
              <div className="flex items-center space-x-4">
                <div className={`${baseClass} rounded-full w-12 h-12`}></div>
                <div className="flex-1 space-y-2">
                  <div className={`${baseClass} rounded h-4 w-3/4`}></div>
                  <div className={`${baseClass} rounded h-3 w-1/2`}></div>
                </div>
              </div>
              {/* Content skeleton */}
              <div className="space-y-3">
                <div className={`${baseClass} rounded h-3 w-full`}></div>
                <div className={`${baseClass} rounded h-3 w-5/6`}></div>
                <div className={`${baseClass} rounded h-3 w-4/6`}></div>
              </div>
              {/* Action skeleton */}
              <div className={`${baseClass} rounded-lg h-10 w-full`}></div>
            </div>
            <span className="sr-only">Loading card content...</span>
          </div>
        );

      case 'list':
        return (
          <div 
            className={`space-y-3 ${className}`}
            role="status"
            aria-label="Loading list"
          >
            {[...Array(count)].map((_, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className={`${baseClass} rounded h-5 w-2/3`}></div>
                    <div className={`${baseClass} rounded h-3 w-1/2`}></div>
                  </div>
                  <div className={`${baseClass} rounded-full h-6 w-16`}></div>
                </div>
                <div className={`${baseClass} rounded h-3 w-3/4`}></div>
                <div className={`${baseClass} rounded h-2 w-1/3`}></div>
              </div>
            ))}
            <span className="sr-only">Loading list items...</span>
          </div>
        );

      case 'prescription':
        return (
          <div 
            className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}
            role="status"
            aria-label="Loading prescription"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-3 pb-4 border-b-2 border-gray-200">
                <div className={`${baseClass} rounded h-8 w-3/4 mx-auto`}></div>
                <div className={`${baseClass} rounded h-6 w-2/3 mx-auto`}></div>
                <div className={`${baseClass} rounded h-4 w-1/2 mx-auto`}></div>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className={`${baseClass} rounded h-4 w-full`}></div>
                  <div className={`${baseClass} rounded h-4 w-5/6`}></div>
                </div>
                <div className="space-y-2">
                  <div className={`${baseClass} rounded h-4 w-full`}></div>
                  <div className={`${baseClass} rounded h-4 w-4/6`}></div>
                </div>
              </div>

              {/* Rx Symbol */}
              <div className={`${baseClass} rounded-full h-16 w-16`}></div>

              {/* Medications */}
              <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                <div className={`${baseClass} rounded h-5 w-32`}></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2 ml-4">
                    <div className={`${baseClass} rounded h-4 w-3/4`}></div>
                    <div className={`${baseClass} rounded h-3 w-2/3`}></div>
                  </div>
                ))}
              </div>

              {/* Signature */}
              <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                <div className={`${baseClass} rounded h-12 w-32`}></div>
                <div className={`${baseClass} rounded h-4 w-48`}></div>
              </div>
            </div>
            <span className="sr-only">Loading prescription details...</span>
          </div>
        );

      default:
        return null;
    }
  };

  // For simple variants, render multiple if count > 1
  if (variant === 'text' || variant === 'circular' || variant === 'rectangular') {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, index) => (
          <React.Fragment key={index}>
            {renderSkeleton()}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;

// Additional skeleton variants for specific use cases
export const PrescriptionListSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-label="Loading prescriptions">
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="animate-pulse space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="bg-gray-300 rounded h-8 w-64"></div>
            <div className="bg-gray-200 rounded h-4 w-48"></div>
          </div>
          <div className="flex gap-3">
            <div className="bg-gray-300 rounded-lg h-10 w-24"></div>
            <div className="bg-gray-300 rounded-lg h-10 w-36"></div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List skeleton */}
      <div className="lg:col-span-1">
        <SkeletonLoader variant="list" count={5} />
      </div>
      
      {/* Detail skeleton */}
      <div className="lg:col-span-2">
        <SkeletonLoader variant="prescription" />
      </div>
    </div>
    <span className="sr-only">Loading prescription history...</span>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-6" role="status" aria-label="Loading form">
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-300 rounded h-6 w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="animate-pulse bg-gray-200 rounded h-4 w-32"></div>
              <div className="animate-pulse bg-gray-300 rounded-lg h-12 w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <span className="sr-only">Loading form fields...</span>
  </div>
);
