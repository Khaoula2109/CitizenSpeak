import React from 'react';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-gradient rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-lg text-neutral-600 dark:text-gray-400">Chargement des données…</p>
        </div>
      </div>
    </div>
  );
}