import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="relative mr-3">
          <BarChart3 className="h-8 w-8 text-amber-600" />
          <TrendingUp className="h-5 w-5 text-amber-500 absolute -bottom-1 -right-1 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-transparent">
          Analyse des plaintes
        </h1>
      </div>
      <p className="text-gray-500 text-lg">
        Tableau de bord analytique pour le suivi des tendances et indicateurs
      </p>
    </div>
  );
}