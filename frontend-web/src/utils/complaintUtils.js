import { 
  COMPLAINT_STATUS_COLORS, 
  COMPLAINT_STATUS_LABELS, 
  PRIORITY_COLORS, 
  PRIORITY_LABELS 
} from '../constants/complaintConstants';

export const getStatusColor = (status) => COMPLAINT_STATUS_COLORS[status] || COMPLAINT_STATUS_COLORS['New'];
export const getStatusLabel = (status) => COMPLAINT_STATUS_LABELS[status] || status;

export const getPriorityColor = (level) => PRIORITY_COLORS[level] || PRIORITY_COLORS[1];
export const getPriorityLabel = (level) => PRIORITY_LABELS[level] || PRIORITY_LABELS[1];

export const convertPriorityToString = (level) => {
  switch (level) {
    case 3: return 'high';
    case 2: return 'medium';
    case 1:
    default: return 'low';
  }
};

export const convertStringToPriority = (priority) => {
  switch (priority.toLowerCase()) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low':
    default: return 1;
  }
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatShortDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getLocation = (latitude, longitude) => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

export const openGoogleMaps = (latitude, longitude) => {
  window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
};

export const filterComplaints = (complaints, filters) => {
  const {
    searchTerm,
    selectedPriority,
    selectedDepartment,
    selectedVerificationStatus,
    startDate,
    endDate
  } = filters;

  return complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const priorityString = convertPriorityToString(complaint.priorityLevel);
    const matchesPriority = selectedPriority === 'all' || priorityString === selectedPriority;
    const matchesDepartment = selectedDepartment === 'all' || complaint.department === selectedDepartment;
    
    const matchesVerification = selectedVerificationStatus === 'all' || 
                              (selectedVerificationStatus === 'verified' && complaint.isVerified === 1) ||
                              (selectedVerificationStatus === 'unverified' && complaint.isVerified === 0);
    
    const complaintDate = new Date(complaint.creationDate);
    const matchesStartDate = !startDate || complaintDate >= new Date(startDate);
    const matchesEndDate = !endDate || complaintDate <= new Date(endDate);

    return matchesSearch && matchesPriority && matchesDepartment && matchesVerification && matchesStartDate && matchesEndDate;
  });
};

export const sortComplaints = (complaints, sortBy = 'date') => {
  switch (sortBy) {
    case 'priority':
      return [...complaints].sort((a, b) => {
        if (a.isVerified !== b.isVerified) {
          return a.isVerified - b.isVerified; 
        }
        return b.priorityLevel - a.priorityLevel; 
      });
    case 'status':
      return [...complaints].sort((a, b) => a.status.localeCompare(b.status));
    case 'date':
    default:
      return [...complaints].sort((a, b) => {
        if (a.isVerified !== b.isVerified) {
          return a.isVerified - b.isVerified; 
        }
        return new Date(b.creationDate) - new Date(a.creationDate); 
      });
  }
};

export const validateComplaintData = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Le titre doit contenir au moins 5 caractères';
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères';
  }

  if (!data.categoryId) {
    errors.categoryId = 'Veuillez sélectionner une catégorie';
  }

  if (!data.latitude || !data.longitude) {
    errors.location = 'La localisation est requise';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 403) {
    return 'Vous n\'avez pas les permissions nécessaires pour cette action';
  }
  
  if (error.response?.status === 404) {
    return 'Ressource non trouvée';
  }
  
  if (error.response?.status === 500) {
    return 'Erreur serveur. Veuillez réessayer plus tard';
  }
  
  return 'Une erreur inattendue s\'est produite';
};