import React from 'react';
import { FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface ComplaintStatsProps {
  totalComplaints: number;
  inProgressComplaints: number;
  pendingComplaints: number;
  completedComplaints: number;
}

export const ComplaintStats: React.FC<ComplaintStatsProps> = ({
  totalComplaints,
  inProgressComplaints,
  pendingComplaints,
  completedComplaints
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="group relative cursor-pointer rounded-2xl border-2 border-neutral-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 hover:border-primary-500 shadow-lg hover:shadow-xl 
                     transition-all duration-300 transform hover:scale-105">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl
                       bg-gradient-to-br from-primary-600/5 to-primary-500/10" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-gradient rounded-xl shadow-brand">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-700">{totalComplaints}</div>
              <div className="text-sm text-neutral-500">Total</div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Plaintes Totales</h3>
        </div>
      </div>

      <div className="group relative cursor-pointer rounded-2xl border-2 border-neutral-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 hover:border-primary-500 shadow-lg hover:shadow-xl 
                     transition-all duration-300 transform hover:scale-105">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl
                       bg-gradient-to-br from-blue-600/5 to-blue-500/10" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-700">{inProgressComplaints}</div>
              <div className="text-sm text-neutral-500">En cours</div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-white">En Cours</h3>
        </div>
      </div>

      <div className="group relative cursor-pointer rounded-2xl border-2 border-neutral-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 hover:border-primary-500 shadow-lg hover:shadow-xl 
                     transition-all duration-300 transform hover:scale-105">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl
                       bg-gradient-to-br from-orange-600/5 to-orange-500/10" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl shadow-lg">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-700">{pendingComplaints}</div>
              <div className="text-sm text-neutral-500">En attente</div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-white">En Attente</h3>
        </div>
      </div>

      <div className="group relative cursor-pointer rounded-2xl border-2 border-neutral-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 hover:border-primary-500 shadow-lg hover:shadow-xl 
                     transition-all duration-300 transform hover:scale-105">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl
                       bg-gradient-to-br from-success-600/5 to-success-500/10" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-r from-success-600 to-success-500 rounded-xl shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-success-700">{completedComplaints}</div>
              <div className="text-sm text-neutral-500">Résolues</div>
            </div>
          </div>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Résolues</h3>
        </div>
      </div>
    </div>
  );
};