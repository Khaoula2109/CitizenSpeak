import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface ComplaintsLoadingProps {
  loading: boolean;
  error: string | null;
}

export const ComplaintsLoadingError: React.FC<ComplaintsLoadingProps> = ({ 
  loading, 
  error 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des plaintes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/50 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Erreur de chargement
            </h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};