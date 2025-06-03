import React from 'react';
import { MapPin } from 'lucide-react';
import { AnalystComplaintMap } from './AnalystComplaintMap';

interface InteractiveMapSectionProps {
  selectedYear: number;
  complaints: any[];
  loading: boolean;
}

export function InteractiveMapSection({ selectedYear, complaints, loading }: InteractiveMapSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <MapPin className="h-6 w-6 text-blue-600 mr-2" />
          Carte interactive des plaintes
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Visualisation géographique pour {selectedYear} ({complaints.length} plaintes)
        </span>
      </div>
      <AnalystComplaintMap 
        selectedYear={selectedYear}
        complaints={complaints}
        loading={loading}
      />
    </div>
  );
}