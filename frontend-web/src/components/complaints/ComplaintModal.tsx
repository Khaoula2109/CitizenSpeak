import React, { useState } from 'react';
import { X, Camera, ExternalLink, MapPin, Clock, User, MessageSquare, Send, Loader2 } from 'lucide-react';
import { StatusManagement } from './StatusManagement';
import { getLocation, openGoogleMaps, formatDate } from '../../constants/complaintConstants';

// Définition des types pour les commentaires
interface Comment {
  id: string;
  description: string;
  commentDate: string;
  authorType?: 'AGENT' | 'CITIZEN';
  agent?: {
    name: string;
    service?: string;
  };
  citizen?: {
    name: string;
    role?: string;
    type?: 'AGENT' | 'CITIZEN';
    service?: string;
  };
}

// Type pour la plainte
interface Complaint {
  complaintId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  creationDate: string;
  status: string;
  statusHistory?: any[];
  isVerified?: number;
  media?: Array<{
    url: string;
  }>;
  citizen?: {
    name: string;
  };
  assignedTo?: {
    name: string;
    role: string;
    service?: string;
    email?: string;
  };
  department?: string;
  comments?: Comment[];
}

interface ComplaintModalProps {
  complaint: Complaint;
  onClose: () => void;
  onStatusUpdate: (status: string, notes: string) => Promise<void>;
  onAddComment: (description: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  userRole: string;
  onImageClick: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  complaint,
  onClose,
  onStatusUpdate,
  onAddComment,
  onDeleteComment,
  userRole,
  onImageClick
}) => {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsAddingComment(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      await onDeleteComment(commentId);
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-black/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden 
                       shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full
                       border border-gray-200 dark:border-gray-700">
          <div className="px-6 pt-6 pb-4 sm:p-8">
            <div className="flex justify-between items-start mb-6 p-4 rounded-lg 
                          bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Plainte #{complaint.complaintId}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {complaint.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors
                         border border-gray-200 dark:border-gray-600"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {complaint.media && complaint.media.length > 0 && (
                  <div className="relative">
                    <div 
                      className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 
                               cursor-pointer border border-gray-200 dark:border-gray-600
                               hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
                      onClick={onImageClick}
                    >
                      <img 
                        src={complaint.media[0].url} 
                        alt={complaint.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={onImageClick}
                      className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 
                               text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center 
                               transition-colors shadow-sm"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Voir l'image
                    </button>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {complaint.description}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Localisation
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span>{getLocation(complaint.latitude, complaint.longitude)}</span>
                    </div>
                    <button
                      onClick={() => openGoogleMaps(complaint.latitude, complaint.longitude)}
                      className="flex items-center px-3 py-1.5 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 
                               hover:bg-gray-50 dark:hover:bg-gray-500 rounded-lg border border-gray-200 dark:border-gray-500
                               transition-colors text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir sur la carte
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date de création</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatDate(complaint.creationDate)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Soumis par</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {complaint.citizen?.name || 'Inconnu'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <StatusManagement
                    complaintId={complaint.complaintId}
                    currentStatus={complaint.status}
                    statusHistory={complaint.statusHistory || []}
                    onStatusUpdate={onStatusUpdate}
                    userRole={userRole}
                  />
                </div>

                {complaint.assignedTo && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Agent affecté</h4>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-600 
                                      flex items-center justify-center border border-gray-200 dark:border-gray-500">
                          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {complaint.assignedTo.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {complaint.assignedTo.role}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 
                                        border border-green-200 dark:border-green-600">
                            Affecté
                          </span>
                        </div>
                        
                        {complaint.assignedTo.service && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Service: {complaint.assignedTo.service}
                          </p>
                        )}
                        
                        {complaint.department && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Département: {complaint.department}
                          </p>
                        )}

                        {complaint.assignedTo.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            Contact: {complaint.assignedTo.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg 
                              bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Commentaires
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {complaint.comments?.length || 0} commentaire{(complaint.comments?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {complaint.comments?.length > 0 ? (
                    complaint.comments.map((comment: Comment) => {
                      let authorName = 'Anonyme';
                      let authorRole = '';
                      
                      if (comment.authorType === 'AGENT' && comment.agent) {
                        authorName = comment.agent.name;
                        authorRole = comment.agent.service ? `Agent - ${comment.agent.service}` : 'Agent Communal';
                      } else if (comment.authorType === 'CITIZEN' && comment.citizen) {
                        authorName = comment.citizen.name;
                        authorRole = comment.citizen.role || 'Citoyen';
                      } else if (comment.citizen) {
                        authorName = comment.citizen.name;
                        authorRole = comment.citizen.type === 'AGENT' ? 
                                     (comment.citizen.service ? `Agent - ${comment.citizen.service}` : 'Agent Communal') : 
                                     'Citoyen';
                      }

                      return (
                        <div key={comment.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 
                                                       border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-600 
                                              flex items-center justify-center border border-gray-200 dark:border-gray-500">
                                  <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {authorName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {authorRole}
                                    </p>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(comment.commentDate)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {comment.description}
                                </p>
                              </div>
                            </div>
                            
                            {userRole === 'Admin' && complaint.isVerified === 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(comment.id);
                                }}
                                className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 
                                         rounded-lg transition-colors"
                                title="Supprimer le commentaire"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 rounded-lg bg-gray-50 dark:bg-gray-700 
                                  border border-gray-200 dark:border-gray-600">
                      <MessageSquare className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aucun commentaire pour le moment
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <div className="flex space-x-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-600 
                               bg-white dark:bg-gray-800 px-3 py-2 text-sm 
                               focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                               dark:text-white"
                      rows={3}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isAddingComment}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                               disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg 
                               transition-colors text-sm font-medium"
                    >
                      {isAddingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};