import React from 'react';
import { AlertCircle } from 'lucide-react';
import { getPriorityColor, getPriorityLabel } from '../../constants/complaintConstants';

interface ComplaintPriorityBadgeProps {
  priorityLevel: number;
  isVerified: number;
}

export const ComplaintPriorityBadge: React.FC<ComplaintPriorityBadgeProps> = ({ 
  priorityLevel, 
  isVerified 
}) => {
  if (isVerified === 0 || priorityLevel === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                     bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300">
        <AlertCircle className="h-3 w-3 mr-1" />
        En attente de priorisation
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priorityLevel)}`}>
      {getPriorityLabel(priorityLevel)}
    </span>
  );
};