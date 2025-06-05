import React from 'react';
import { MapPin, Clock, User, MessageSquare, Eye } from 'lucide-react';
import { getStatusColor, getStatusLabel, getPriorityColor, convertStringToPriorityLevel } from '../../constants/complaintConstants';

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

interface ComplaintListItemProps {
  complaint: Complaint;
  index: number;
  onClick: () => void;
}

export const ComplaintListItem: React.FC<ComplaintListItemProps> = ({
  complaint,
  index,
  onClick
}) => {
  const getPriorityTextFromString = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Basse';
      default:
        return priority;
    }
  };

  const getPriorityColorFromString = (priority: string) => {
    const level = convertStringToPriorityLevel(priority);
    return getPriorityColor(level);
  };

  return (
    <div 
      className={`p-6 hover:bg-gradient-to-r hover:from-primary-700/5 hover:to-primary-600/5 
                transition-all duration-200 cursor-pointer group
                ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-neutral-100/30 dark:bg-gray-700/50'}`}
      onClick={onClick}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
                <span className="text-sm font-bold text-white">
                  #{complaint.complaintId.slice(-3)}
                </span>
              </div>
              <div>
                <span className="text-sm text-neutral-500 dark:text-gray-400">#{complaint.complaintId}</span>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors">
                  {complaint.title}
                </h3>
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-gray-300 line-clamp-2 ml-13">
              {complaint.description}
            </p>
          </div>
          <button className="p-2 opacity-0 group-hover:opacity-100 text-primary-600 hover:bg-primary-600/10 rounded-lg transition-all">
            <Eye className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-13">
          <div>
            <div className="flex items-center text-sm text-neutral-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-2 text-neutral-500 dark:text-gray-500" />
              {complaint.latitude && complaint.longitude ? 
                `${complaint.latitude.toFixed(4)}, ${complaint.longitude.toFixed(4)}` : 
                'Localisation non disponible'
              }
            </div>
          </div>
          <div>
            <div className="flex items-center text-sm text-neutral-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-2 text-neutral-500 dark:text-gray-500" />
              {new Date(complaint.creationDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div>
            <div className="flex items-center text-sm text-neutral-600 dark:text-gray-400">
              <User className="h-4 w-4 mr-2 text-neutral-500 dark:text-gray-500" />
              {complaint.citizen?.name || 'Citoyen inconnu'}
            </div>
          </div>
          <div>
            <div className="flex items-center text-sm text-neutral-600 dark:text-gray-400">
              <MessageSquare className="h-4 w-4 mr-2 text-neutral-500 dark:text-gray-500" />
              {complaint.comments?.length || 0} commentaire{(complaint.comments?.length || 0) > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-13">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(complaint.status)}`}>
            {getStatusLabel(complaint.status)}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColorFromString(complaint.priority)}`}>
            {getPriorityTextFromString(complaint.priority)}
          </span>
          {complaint.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold 
                           bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              {complaint.category.label}
            </span>
          )}
          {complaint.department && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold 
                           bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {complaint.department}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};