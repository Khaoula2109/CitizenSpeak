import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface NoDataMessageProps {
  selectedYear: number;
  onBackToCurrent: () => void;
}

export function NoDataMessage({ selectedYear, onBackToCurrent }: NoDataMessageProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="text-center py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Aucune donnée disponible pour {selectedYear}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Aucune plainte n'a été enregistrée pour cette année ou les données ne sont pas encore disponibles.
        </p>
        <button
          onClick={onBackToCurrent}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Revenir à {currentYear}
        </button>
      </div>
    </div>
  );
}