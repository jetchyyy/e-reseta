import React from 'react';

interface PatientSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-[#457B9D]/10 p-1.5">
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-[#457B9D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search patients by name, phone, or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-5 py-4 pl-14 rounded-xl border-2 border-transparent focus:border-[#457B9D] focus:ring-4 focus:ring-[#457B9D]/10 transition-all bg-[#F1FAEE]/30 hover:bg-[#F1FAEE]/50 text-[#1D3557] placeholder:text-[#457B9D]/60 font-medium"
          aria-label="Search patients"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-[#457B9D]/60 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label="Clear search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default PatientSearchBar;
