import React, { useState } from 'react';
import { 
  X, FileText, Camera, MapPin, ExternalLink, Settings, Calendar,
  MessageSquare, Clock, User, Send, Eye, Wrench
} from 'lucide-react';
import { getStatusColor, getStatusLabel, formatDate } from '../../constants/complaintConstants';

interface Comment {
  id: string;
  description: string;
  commentDate: string;
  authorType: string; 
  citizen?: {  
    id: string;
    name: string;
    role: string;
    email?: string;
  };
  agent?: { 
    id: string;
    name: string;
    role: string;
    email?: string;
    service?: string;
  };
}

interface StatusHistory {
  id: string;
  status: string;
  statusDate: string;
  notes?: string;
  updatedBy: {
    id: string;
    name: string;
    role: string;
  };
}

interface Intervention {
  interventionId: string;
  startDate: string;
  endDate?: string;
  status: string;
  description: string;
  resourcesNeeded?: string[];
}

interface Complaint {
  complaintId: string;
  title: string;
  description: string;
  status: string;
  creationDate: string;
  latitude?: number;
  longitude?: number;
  priority: string;
  media?: Array<{
    id: string;
    url: string;
    filename: string;
    captureDate: string;
  }>;
  comments?: Comment[];
  statusHistory?: StatusHistory[];
  interventions?: Intervention[];
}

interface ComplaintDetailModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (complaintId: string, newStatus: string) => void;
  onAddComment: (description: string) => void;
  onPlanIntervention: () => void;
  newComment: string;
  setNewComment: (comment: string) => void;
  setShowImageModal: (show: boolean) => void;
  setSelectedImageUrl: (url: string) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onStatusChange,
  onAddComment,
  onPlanIntervention,
  newComment,
  setNewComment,
  setShowImageModal,
  setSelectedImageUrl
}) => {
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');

  if (!isOpen) return null;

  const openGoogleMaps = (latitude: number, longitude: number) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden 
                      shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full 
                      border border-primary-200/20 dark:border-gray-700">
          <div className="px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand mr-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Plainte #{complaint.complaintId}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-gray-400">
                    {complaint.title}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-3 hover:bg-neutral-100 dark:hover:bg-gray-700 
                         transition-colors text-neutral-500 hover:text-neutral-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {complaint.media && complaint.media.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-neutral-800 dark:text-gray-300 flex items-center">
                      <Camera className="h-4 w-4 mr-2 text-primary-600" />
                      Images ({complaint.media.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {complaint.media.map((media) => (
                        <div key={media.id} className="relative group">
                          <div 
                            className="aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-gray-700 
                                     cursor-pointer border-2 border-neutral-200 hover:border-primary-500 
                                     transition-all duration-300 transform group-hover:scale-105"
                            onClick={() => {
                              setSelectedImageUrl(media.url);
                              setShowImageModal(true);
                            }}
                          >
                            <img 
                              src={media.url} 
                              alt="Plainte"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => {
                              setSelectedImageUrl(media.url);
                              setShowImageModal(true);
                            }}
                            className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg
                                     text-xs font-semibold flex items-center hover:bg-black/80 transition-colors 
                                     opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-neutral-50 to-white dark:from-gray-700/50 dark:to-gray-600/50 
                              rounded-xl p-6 border border-neutral-200/50 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary-600" />
                    Description
                  </h4>
                  <p className="text-sm text-neutral-700 dark:text-gray-300 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 
                              rounded-xl p-6 border border-blue-200/50 dark:border-blue-700">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    Localisation
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-mono">
                        {complaint.latitude && complaint.longitude ? 
                          `${complaint.latitude.toFixed(6)}, ${complaint.longitude.toFixed(6)}` : 
                          'Coordonnées non disponibles'
                        }
                      </span>
                    </div>
                    {complaint.latitude && complaint.longitude && (
                      <button
                        onClick={() => openGoogleMaps(complaint.latitude!, complaint.longitude!)}
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 
                                 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <span className="text-sm">Voir sur la carte</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onPlanIntervention}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl 
                             font-semibold hover:from-purple-700 hover:to-purple-600 shadow-lg hover:shadow-xl
                             transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Planifier intervention
                  </button>
                </div>

                {complaint.interventions && complaint.interventions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-4 flex items-center">
                      <Wrench className="h-4 w-4 mr-2 text-purple-600" />
                      Interventions planifiées ({complaint.interventions.length})
                    </h4>
                    <div className="space-y-3">
                      {complaint.interventions.map((intervention) => (
                        <div key={intervention.interventionId} 
                           className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 
                                    border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-purple-800 dark:text-purple-200">
                                {intervention.description}
                              </p>
                              <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                                Du {formatDate(intervention.startDate)} 
                                {intervention.endDate && ` au ${formatDate(intervention.endDate)}`}
                              </p>
                              {intervention.resourcesNeeded && intervention.resourcesNeeded.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold mb-1">
                                    Ressources nécessaires:
                                  </p>
                                  <ul className="text-xs text-purple-600 dark:text-purple-300 list-disc list-inside space-y-1">
                                    {intervention.resourcesNeeded.map((resource, index) => (
                                      <li key={index}>{resource}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                                             bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                                {intervention.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-neutral-50 to-white dark:from-gray-700/50 dark:to-gray-600/50 
                              rounded-xl p-6 border border-neutral-200/50 dark:border-gray-600">
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-3 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-primary-600" />
                    Mettre à jour le statut
                  </h4>
                  <select
                    value={complaint.status}
                    onChange={(e) => onStatusChange(complaint.complaintId, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                             bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                             focus:border-primary-700 transition-all"
                  >
                    <option value="Assigned">Assignée</option>
                    <option value="In_Progress">En cours</option>
                    <option value="Intervention_Scheduled">Intervention Planifiée</option>
                    <option value="Resolved">Résolue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-b border-neutral-200 dark:border-gray-700">
                  <nav className="-mb-px flex">
                    <button 
                      onClick={() => setActiveTab('comments')}
                      className={`py-3 px-6 border-b-2 text-sm font-semibold transition-colors ${
                        activeTab === 'comments'
                          ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                          : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 inline" />
                      Commentaires
                    </button>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className={`py-3 px-6 border-b-2 text-sm font-semibold ml-4 transition-colors ${
                        activeTab === 'history'
                          ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                          : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Clock className="h-4 w-4 mr-2 inline" />
                      Historique
                    </button>
                  </nav>
                </div>

                {activeTab === 'comments' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-neutral-800 dark:text-gray-300">Commentaires</h4>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold 
                                     bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300">
                        {complaint.comments?.length || 0} commentaire{(complaint.comments?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {complaint.comments?.map((comment) => {
                        const isAgent = comment.authorType === 'AGENT';
                        const author = isAgent ? comment.agent : comment.citizen;
                        
                        return (
                          <div key={comment.id} className={`rounded-xl p-4 transition-all duration-200 ${
                            isAgent 
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 ml-8 border border-blue-200/50 dark:border-blue-700' 
                              : 'bg-gradient-to-r from-neutral-50 to-white dark:from-gray-700/50 dark:to-gray-600/50 border border-neutral-200/50 dark:border-gray-600'
                          }`}>
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${
                                  isAgent 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500' 
                                    : 'bg-gradient-to-r from-neutral-600 to-neutral-500'
                                }`}>
                                  <User className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    {author?.name || 'Utilisateur inconnu'}
                                  </p>
                                  <span className="text-xs text-neutral-500 dark:text-gray-400">
                                    {formatDate(comment.commentDate)}
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-600 dark:text-gray-400 mb-2">
                                  {isAgent ? `Agent - ${comment.agent?.service || ''}` : comment.citizen?.role || 'Citoyen'}
                                </p>
                                <p className="text-sm text-neutral-700 dark:text-gray-300 leading-relaxed">
                                  {comment.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 
                                  rounded-xl p-4 border border-blue-200/50 dark:border-blue-700">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 
                                        flex items-center justify-center shadow-sm">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Ajouter un commentaire..."
                              rows={3}
                              className="w-full rounded-xl border-2 border-blue-200 dark:border-blue-600 
                                       bg-white dark:bg-gray-700 text-neutral-800 dark:text-white
                                       focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400
                                       resize-none px-4 py-3 pr-12"
                            />
                            <button
                              onClick={() => onAddComment(newComment)}
                              disabled={!newComment.trim()}
                              className="absolute bottom-3 right-3 p-2 text-blue-600 dark:text-blue-400 
                                       hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-neutral-800 dark:text-gray-300">Historique des statuts</h4>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold 
                                     bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-gray-300">
                        {complaint.statusHistory?.length || 0} événement{(complaint.statusHistory?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {complaint.statusHistory?.map((history) => (
                        <div key={history.id} 
                           className="bg-gradient-to-r from-neutral-50 to-white dark:from-gray-700/50 dark:to-gray-600/50 
                                    rounded-xl p-4 border border-neutral-200/50 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(history.status)}`}>
                              {getStatusLabel(history.status)}
                            </span>
                            <span className="text-xs text-neutral-500 dark:text-gray-400 font-mono">
                              {formatDate(history.statusDate)}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-neutral-700 dark:text-gray-300 mb-3 bg-neutral-100 dark:bg-gray-700 
                                         rounded-lg p-3 leading-relaxed">
                              {formatNotes(history.notes)}
                            </p>
                          )}
                          <p className="text-xs text-neutral-600 dark:text-gray-400 flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            Par: {history.updatedBy.name} ({history.updatedBy.role})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};