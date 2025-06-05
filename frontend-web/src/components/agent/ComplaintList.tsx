import React from 'react';
import { AlertCircle } from 'lucide-react';
import { ComplaintListItem } from './ComplaintListItem';

interface Complaint {
  complaintId: string;
  title: string;
  description: string;
  status: string;
  creationDate: string;
  latitude?: number;
  longitude?: number;
  priority: string;
  priorityLevel: number;
  isVerified: number;
  closureDate?: string;
  category?: {
    id: string;
    label: string;
  };
  citizen?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    service: string;
    role: string;
  };
  department?: string;
  comments?: any[];
}

interface ComplaintListProps {
  complaints: Complaint[];
  loading: boolean;
  error: string | null;
  onComplaintClick: (complaint: Complaint) => void;
  onRetry: () => void;
}

export const ComplaintList: React.FC<ComplaintListProps> = ({
  complaints,
  loading,
  error,
  onComplaintClick,
  onRetry
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-neutral-500 dark:text-gray-400">Chargement des plaintes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-error-600" />
        <h3 className="mt-2 text-sm font-medium text-error-800 dark:text-error-400">
          Erreur de chargement
        </h3>
        <p className="mt-1 text-sm text-error-600 dark:text-error-300">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-3 bg-brand-gradient text-white rounded-xl font-semibold 
                   hover:from-primary-800 hover:to-primary-700 shadow-brand hover:shadow-brand-lg 
                   transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-neutral-400 dark:text-gray-500" />
        <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-white">
          Aucune plainte trouvée
        </h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">
          Aucune plainte ne correspond à vos critères de recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-primary-200/10 dark:divide-gray-700">
      {complaints.map((complaint, index) => (
        <ComplaintListItem
          key={complaint.complaintId}
          complaint={complaint}
          index={index}
          onClick={() => onComplaintClick(complaint)}
        />
      ))}
    </div>
  );
};