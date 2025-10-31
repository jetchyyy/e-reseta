import React from 'react';
import type { ResetaTemplate } from '../../../types/prescription';

interface TemplateDesignProps {
  template: ResetaTemplate;
  onUpdateField: (field: string, value: any) => void;
}

const TemplateDesign: React.FC<TemplateDesignProps> = ({
  template,
  onUpdateField,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="headerColor" className="block text-sm font-medium text-gray-700 mb-2">
            Header Color
          </label>
          <div className="flex gap-3">
            <input
              id="headerColor"
              type="color"
              value={template.headerColor}
              onChange={(e) => onUpdateField('headerColor', e.target.value)}
              className="w-12 sm:w-16 h-10 sm:h-12 rounded-lg cursor-pointer flex-shrink-0"
              aria-label="Select header color"
            />
            <input
              type="text"
              value={template.headerColor}
              onChange={(e) => onUpdateField('headerColor', e.target.value)}
              className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              aria-label="Header color hex code"
            />
          </div>
        </div>

        <div>
          <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-2">
            Accent Color
          </label>
          <div className="flex gap-3">
            <input
              id="accentColor"
              type="color"
              value={template.accentColor}
              onChange={(e) => onUpdateField('accentColor', e.target.value)}
              className="w-12 sm:w-16 h-10 sm:h-12 rounded-lg cursor-pointer flex-shrink-0"
              aria-label="Select accent color"
            />
            <input
              type="text"
              value={template.accentColor}
              onChange={(e) => onUpdateField('accentColor', e.target.value)}
              className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              aria-label="Accent color hex code"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="paperColor" className="block text-sm font-medium text-gray-700 mb-2">
          Paper Color
        </label>
        <div className="flex gap-3">
          <input
            id="paperColor"
            type="color"
            value={template.paperColor}
            onChange={(e) => onUpdateField('paperColor', e.target.value)}
            className="w-12 sm:w-16 h-10 sm:h-12 rounded-lg cursor-pointer flex-shrink-0"
            aria-label="Select paper color"
          />
          <input
            type="text"
            value={template.paperColor}
            onChange={(e) => onUpdateField('paperColor', e.target.value)}
            className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            aria-label="Paper color hex code"
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
          onChange={(e) => onUpdateField('showRxSymbol', e.target.checked)}
          className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
        />
        <label htmlFor="showRx" className="text-sm font-medium text-gray-700">
          Show Rx Symbol on prescription
        </label>
      </div>
    </div>
  );
};

export default TemplateDesign;
