import React from 'react';
import { MessageSquare } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="relative mr-3">
          <MessageSquare className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent">
          Tableau de bord
        </h1>
      </div>
      <p className="text-neutral-500 dark:text-gray-400 text-lg">
        Vue global des données
      </p>
    </div>
  );
};