import React, { useState } from 'react';
import { Clock, User, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { getStatusColor, getStatusLabel, formatDate } from '../../constants/complaintConstants';

interface StatusManagementProps {
  complaintId: string;
  currentStatus: string;
  statusHistory: any[];
  onStatusUpdate: (status: string, notes: string) => Promise<void>;
  userRole: string;
}

const getPriorityLabel = (priority: string): string => {
  const priorityLabels: { [key: string]: string } = {
    'high': 'Haute',
    'medium': 'Moyenne',
    'low': 'Basse',
    'urgent': 'Urgente',
    'normal': 'Normale'
  };
  
  return priorityLabels[priority?.toLowerCase()] || priority;
};

export const StatusManagement: React.FC<StatusManagementProps> = ({
  complaintId,
  currentStatus,
  statusHistory,
  onStatusUpdate,
  userRole
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  const statusOptions = [
    { value: 'New', label: 'Nouvelle' },
    { value: 'Assigned', label: 'Assignée' },
    { value: 'In_Progress', label: 'En cours' },
    { value: 'Intervention Scheduled', label: 'Intervention Planifiée' },
    { value: 'Resolved', label: 'Résolue' },
    { value: 'Closed', label: 'Fermée' }
  ];

  const handleStatusUpdate = async () => {
    if (!newStatus || !notes.trim()) return;

    try {
      await onStatusUpdate(newStatus, notes);
      setIsUpdating(false);
      setNewStatus('');
      setNotes('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const formatNotes = (noteText: string): string => {
    if (!noteText) return noteText;
    
    return noteText
      .replace(/Priorité acceptée : high/gi, 'Priorité acceptée : Haute')
      .replace(/Priorité acceptée : medium/gi, 'Priorité acceptée : Moyenne')
      .replace(/Priorité acceptée : low/gi, 'Priorité acceptée : Basse')
      .replace(/Priority accepted: high/gi, 'Priorité acceptée : Haute')
      .replace(/Priority accepted: medium/gi, 'Priorité acceptée : Moyenne')
      .replace(/Priority accepted: low/gi, 'Priorité acceptée : Basse');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mr-3">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Gestion des Statuts
        </h4>
      </div>


      <div className="bg-gradient-to-r to-indigo-50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl p-6 border dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Statut actuel</h5>
            <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${getStatusColor(currentStatus)}`}>
              {getStatusLabel(currentStatus)}
            </span>
          </div>
          
          {(userRole === 'Admin' || userRole === 'Agent') && (
            <button
              onClick={() => setIsUpdating(!isUpdating)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Mettre à jour
            </button>
          )}
        </div>
      </div>

      {isUpdating && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-blue-200 dark:border-gray-600 shadow-lg">
          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Nouvelle mise à jour de statut
          </h5>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nouveau statut
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 p-3"
              >
                <option value="">Sélectionner un statut</option>
                {statusOptions
                  .filter(option => option.value !== currentStatus)
                  .map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notes de justification
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ajoutez des notes sur cette mise à jour..."
                className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 p-3"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setIsUpdating(false);
                  setNewStatus('');
                  setNotes('');
                }}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || !notes.trim()}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <h5 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-500" />
            Historique des statuts ({statusHistory?.length || 0})
          </h5>
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700">
            {showHistory ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </button>

        {showHistory && statusHistory && statusHistory.length > 0 && (
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {statusHistory.map((entry, index) => (
                <div key={entry.id || index} className="relative">
                  {index < statusHistory.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-blue-200 to-indigo-200 dark:from-gray-600 dark:to-gray-500"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold shadow-lg ${getStatusColor(entry.status)}`}>
                          {getStatusLabel(entry.status)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {formatDate(entry.statusDate)}
                        </span>
                      </div>
                      
                      {entry.notes && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
                          {formatNotes(entry.notes)}
                        </p>
                      )}
                      
                      {entry.updatedBy && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <User className="h-3 w-3 mr-1" />
                          <span className="font-medium">{entry.updatedBy.name}</span>
                          <span className="mx-1">•</span>
                          <span>{entry.updatedBy.role}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showHistory && (!statusHistory || statusHistory.length === 0) && (
          <div className="p-6 text-center">
            <div className="h-16 w-16 mx-auto rounded-xl bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Aucun historique de statut disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );
};