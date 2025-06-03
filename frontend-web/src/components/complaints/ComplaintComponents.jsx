import React, { useState } from 'react';
import { 
  AlertCircle, Clock, ChevronDown, ChevronUp, User, MapPin, 
  MessageSquare, ExternalLink, Camera, X 
} from 'lucide-react';
import { 
  getPriorityColor, 
  getPriorityLabel, 
  getStatusColor, 
  getStatusLabel,
  formatDate,
  formatShortDate,
  getLocation,
  openGoogleMaps
} from '../../utils/complaintUtils';

export const ComplaintPriorityBadge = ({ priorityLevel, isVerified }) => {
  if (isVerified === 0) {
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

export const ComplaintCard = ({ complaint, onClick, userRole }) => {
  return (
    <div 
      className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer
                 ${complaint.isVerified === 0 ? 'border-l-4 border-l-orange-400 bg-orange-50/30 dark:bg-orange-900/10' : ''}`}
      onClick={() => onClick(complaint)}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">#{complaint.complaintId}</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{complaint.title}</h3>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {complaint.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
              {getLocation(complaint.latitude, complaint.longitude)}
            </div>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
              {formatShortDate(complaint.creationDate)}
            </div>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <User className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
              {complaint.citizen?.name || 'Inconnu'}
            </div>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
              {complaint.comments?.length || 0} commentaire{(complaint.comments?.length || 0) > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
              {getStatusLabel(complaint.status)}
            </span>
            <ComplaintPriorityBadge priorityLevel={complaint.priorityLevel} isVerified={complaint.isVerified} />
            {complaint.isVerified === 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                             bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                À prioriser
              </span>
            )}
            {complaint.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                             bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                {complaint.category.label}
              </span>
            )}
            {complaint.department && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                             bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300">
                {complaint.department}
              </span>
            )}
          </div>
          {complaint.assignedTo && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-2">Assigné à:</span>
              <span className="font-medium text-gray-900 dark:text-white">{complaint.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ComplaintMediaSection = ({ media, title, onImageClick }) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="relative">
      <div 
        className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
        onClick={onImageClick}
      >
        <img 
          src={media[0].url} 
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      <button
        onClick={onImageClick}
        className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg
                 text-sm font-medium flex items-center hover:bg-black/60 transition-colors"
      >
        <Camera className="h-4 w-4 mr-2" />
        Voir l'image
      </button>
    </div>
  );
};

export const LocationInfo = ({ latitude, longitude }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Localisation</h4>
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
          {getLocation(latitude, longitude)}
        </div>
        <button
          onClick={() => openGoogleMaps(latitude, longitude)}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          <span className="text-sm">Voir sur la carte</span>
        </button>
      </div>
    </div>
  );
};

export const GeneralInfo = ({ creationDate, citizenName }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date de création</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-400" />
          {formatDate(creationDate)}
        </p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Soumis par</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          {citizenName || 'Inconnu'}
        </p>
      </div>
    </div>
  );
};

export const AssignedAgentInfo = ({ assignedTo, department }) => {
  if (!assignedTo) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Agent assigné</h4>
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {assignedTo.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {assignedTo.role}
            </p>
            {department && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Département: {department}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ImageModal = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />
        
        <div className="relative max-w-4xl w-full">
          <div className="relative">
            <img 
              src={imageUrl} 
              alt={title || "Détail de la plainte"}
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                e.target.alt = "Image non disponible";
                e.target.className = "w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500";
              }}
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-lg 
                       text-white hover:bg-black/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ComplaintFilters = ({ 
  filters, 
  onFiltersChange, 
  showFilters, 
  onToggleFilters,
  allDepartments,
  userRole 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une plainte..."
                className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white
                         focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
              />
            </div>
            <button 
              onClick={onToggleFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 
                       bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                       dark:focus:ring-blue-400 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priorité
                </label>
                <select
                  value={filters.selectedPriority}
                  onChange={(e) => onFiltersChange({ ...filters, selectedPriority: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="high">Haute</option>
                  <option value="medium">Moyenne</option>
                  <option value="low">Basse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Département
                </label>
                <select
                  value={filters.selectedDepartment}
                  onChange={(e) => onFiltersChange({ ...filters, selectedDepartment: e.target.value })}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Tous les départements</option>
                  {allDepartments.map(dept => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>

              {userRole === 'Admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statut de vérification
                  </label>
                  <select
                    value={filters.selectedVerificationStatus}
                    onChange={(e) => onFiltersChange({ ...filters, selectedVerificationStatus: e.target.value })}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">Toutes les plaintes</option>
                    <option value="unverified">À prioriser</option>
                    <option value="verified">Vérifiées</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};