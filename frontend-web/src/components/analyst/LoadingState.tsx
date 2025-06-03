import React from 'react';

interface LoadingStateProps {
  selectedYear: number;
}

export function LoadingState({ selectedYear }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Chargement des données d'analyse pour {selectedYear}...
          </span>
        </div>
      </div>
    </div>
  );
}