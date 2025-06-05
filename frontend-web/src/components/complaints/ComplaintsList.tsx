import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ComplaintListItem } from './ComplaintListItem';

interface ComplaintsListProps {
  complaints: any[];
  onComplaintClick: (complaint: any) => void;
}

export const ComplaintsList: React.FC<ComplaintsListProps> = ({ 
  complaints, 
  onComplaintClick 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/50
                  hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300
                  hover:border-amber-200 dark:hover:border-amber-800">
      <div className="divide-y divide-amber-100 dark:divide-amber-900/50">
        {complaints.map((complaint) => (
          <div key={complaint.complaintId} 
               className="hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors duration-200">
            <ComplaintListItem
              complaint={complaint}
              onClick={onComplaintClick}
            />
          </div>
        ))}

        {complaints.length === 0 && (
          <div className="p-8 text-center">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucune plainte trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aucune plainte ne correspond à vos critères de recherche.
            </p>
            <div className="mt-4 text-sm text-amber-600 dark:text-amber-400">
              Essayez de modifier vos filtres pour voir plus de résultats
            </div>
          </div>
        )}
      </div>
    </div>
  );
};