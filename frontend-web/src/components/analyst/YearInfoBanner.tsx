import React from 'react';

interface YearInfoBannerProps {
  selectedYear: number;
  totalComplaints?: number;
}

export function YearInfoBanner({ selectedYear, totalComplaints }: YearInfoBannerProps) {
  return (
    <div className="flex justify-center">
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700/30 rounded-full px-6 py-2">
        <span className="text-amber-800 dark:text-amber-300 font-medium">
          Données pour l'année {selectedYear}
          {totalComplaints !== undefined && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">
              ({totalComplaints} plaintes)
            </span>
          )}
        </span>
      </div>
    </div>
  );
}