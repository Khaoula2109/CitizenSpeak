import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-neutral-600">Chargement du profil…</span>
        </div>
      </div>
    </div>
  );
}