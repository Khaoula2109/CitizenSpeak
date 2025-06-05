import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface LoadingStateProps {}

export const LoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <RefreshCw className="animate-spin h-12 w-12 text-blue-600" />
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900 dark:text-white">Chargement des données...</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">Veuillez patienter</p>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  onContinueDemo: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, onContinueDemo }) => {
  return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <AlertTriangle className="h-12 w-12 text-red-600" />
      <div className="text-center">
        <p className="text-lg font-medium text-red-900 dark:text-red-100">Erreur de chargement</p>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
        <div className="space-x-4">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={onContinueDemo}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Continuer (mode démo)
          </button>
        </div>
      </div>
    </div>
  );
};