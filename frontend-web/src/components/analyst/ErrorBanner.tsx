import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { authUtils } from '../../utils/api';

interface ErrorBannerProps {
  error: string;
  onRetry: () => void;
}

export function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/30 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <span className="text-red-800 dark:text-red-300 font-medium">{error}</span>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              Token d'authentification: {authUtils.getToken() ? '✓ Présent' : '✗ Manquant'}
            </p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}