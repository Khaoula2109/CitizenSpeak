import React from 'react';
import { MapPin, Clock, User, MessageSquare, AlertCircle } from 'lucide-react';
import { ComplaintPriorityBadge } from './ComplaintPriorityBadge';
import { getStatusColor, getStatusLabel, getLocation } from '../../constants/complaintConstants';

interface ComplaintListItemProps {
  complaint: any;
  onClick: (complaint: any) => void;
}

export const ComplaintListItem: React.FC<ComplaintListItemProps> = ({ 
  complaint, 
  onClick 
}) => {
  return (
    <div 
      className={`p-6 rounded-2xl mb-4 transition-all duration-200 cursor-pointer border-2 
                 ${complaint.isVerified === 0 
                   ? 'border-l-4 border-l-orange-400 bg-gradient-to-r from-orange-50/50 to-yellow-50/30 dark:from-orange-900/20 dark:to-yellow-900/10 hover:from-orange-50 hover:to-yellow-50 dark:hover:from-orange-900/30 dark:hover:to-yellow-900/20' 
                   : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10'
                 } 
                 hover:shadow-xl hover:-translate-y-1`}
      onClick={() => onClick(complaint)}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold 
                             bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 
                             text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                #{complaint.complaintId}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {complaint.title}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
              {complaint.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {getLocation(complaint.latitude, complaint.longitude)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <Clock className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {new Date(complaint.creationDate).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <User className="h-4 w-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {complaint.citizen?.name || 'Inconnu'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <MessageSquare className="h-4 w-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {complaint.comments?.length || 0} commentaire{(complaint.comments?.length || 0) > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-2">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
              {getStatusLabel(complaint.status)}
            </span>
            
            <ComplaintPriorityBadge priorityLevel={complaint.priorityLevel} isVerified={complaint.isVerified} />
            
            {complaint.isVerified === 0 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold 
                             bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/50 dark:to-yellow-900/50 
                             text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700
                             animate-pulse">
                <AlertCircle className="h-3 w-3 mr-1.5" />
                À prioriser
              </span>
            )}
            
            {complaint.category && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold 
                             bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 
                             text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                {complaint.category.label}
              </span>
            )}
            
            {complaint.department && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold 
                            bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 
                            text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                 {complaint.department}
              </span>
            )}
          </div>
          
          {complaint.assignedTo && (
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl 
                          bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 
                          border border-green-200 dark:border-green-700">
              <User className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                Assigné à: {complaint.assignedTo.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};