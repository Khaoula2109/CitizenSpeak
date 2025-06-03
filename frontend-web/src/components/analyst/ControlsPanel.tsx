import React from 'react';
import { Calendar, RefreshCw, MapPin, FileText } from 'lucide-react';

interface ControlsPanelProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  onRefresh: () => void;
  showMap: boolean;
  onToggleMap: () => void;
  onGenerateReport: () => void;
  loading: boolean;
  isGeneratingReport: boolean;
  hasStats: boolean;
  hasError: boolean;
}

export function ControlsPanel({
  selectedYear,
  onYearChange,
  onRefresh,
  showMap,
  onToggleMap,
  onGenerateReport,
  loading,
  isGeneratingReport,
  hasStats,
  hasError
}: ControlsPanelProps) {
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - 2019 }, 
    (_, i) => currentYear - i
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 focus:border-amber-600 transition-colors font-medium min-w-[100px]"
            disabled={loading}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>

        <button
          onClick={onToggleMap}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            showMap 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>{showMap ? 'Masquer' : 'Afficher'} la carte</span>
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onGenerateReport}
          disabled={isGeneratingReport || loading || !hasStats || hasError}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGeneratingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Génération...</span>
            </>
          ) : (
            <>
              <FileText className="h-5 w-5" />
              <span>Générer rapport {selectedYear}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}