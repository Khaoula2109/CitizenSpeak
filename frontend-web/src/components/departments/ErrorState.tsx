import React from 'react';
import { AlertCircle, Building2, AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error?: string;
  type?: 'error' | 'not-found';
}

export function ErrorState({ error, type = 'error' }: ErrorStateProps) {
  const isNotFound = type === 'not-found';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 p-8 text-center ${
          isNotFound 
            ? 'border-warning-200 dark:border-warning-600' 
            : 'border-error-200 dark:border-error-600'
        }`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isNotFound
              ? 'bg-warning-100 dark:bg-warning-900/50'
              : 'bg-error-100 dark:bg-error-900/50'
          }`}>
            {isNotFound ? (
              <Building2 className="h-8 w-8 text-warning-600 dark:text-warning-400" />
            ) : (
              <AlertCircle className="h-8 w-8 text-error-600 dark:text-error-400" />
            )}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${
            isNotFound
              ? 'text-warning-700 dark:text-warning-300'
              : 'text-error-700 dark:text-error-300'
          }`}>
            {isNotFound ? 'Organisation introuvable' : 'Erreur de chargement'}
          </h2>
          <p className={`${
            isNotFound
              ? 'text-warning-600 dark:text-warning-400'
              : 'text-error-600 dark:text-error-400'
          }`}>
            {isNotFound ? "L'organisation demandée n'existe pas." : error}
          </p>
        </div>
      </div>
    </div>
  );
}