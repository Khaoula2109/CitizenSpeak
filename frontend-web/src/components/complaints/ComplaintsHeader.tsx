import React from 'react';

interface ComplaintsHeaderProps {
  complaintsCount: number;
}

export const ComplaintsHeader: React.FC<ComplaintsHeaderProps> = ({ complaintsCount }) => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent">
        Plaintes et réclamations
      </h1>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
        Gestion et suivi des plaintes des citoyens
      </p>
      <div className="mt-3 inline-flex items-center px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
        <span className="text-amber-800 dark:text-amber-200 font-medium">
          {complaintsCount} plainte{complaintsCount > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};