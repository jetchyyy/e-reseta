import React from 'react';
import type { ResetaTemplate } from '../../../types/prescription';

interface TemplateClinicHoursProps {
  template: ResetaTemplate;
  onUpdateClinicHours: (day: string, hours: string) => void;
}

const TemplateClinicHours: React.FC<TemplateClinicHoursProps> = ({
  template,
  onUpdateClinicHours,
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Enter clinic hours for each day. Leave blank for days you're not available.
      </p>
      
      {days.map(day => (
        <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label htmlFor={`clinic-hours-${day.toLowerCase()}`} className="w-full sm:w-32 text-sm font-medium text-gray-700">
            {day}
          </label>
          <input
            id={`clinic-hours-${day.toLowerCase()}`}
            type="text"
            value={template.clinicHours[day.toLowerCase() as keyof typeof template.clinicHours] || ''}
            onChange={(e) => onUpdateClinicHours(day.toLowerCase(), e.target.value)}
            placeholder="e.g., 10am to 12nn (on call)"
            className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      ))}
    </div>
  );
};

export default TemplateClinicHours;
