export const COMPLAINT_STATUS_COLORS = {
  'New': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  'Assigned': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'In_Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  'Closed': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
};

export const COMPLAINT_STATUS_LABELS = {
  'New': 'Nouvelle',
  'Assigned': 'Assignée',
  'In_Progress': 'En cours',
  'Intervention Scheduled': 'Intervention Planifiée',
  'Resolved': 'Résolue',
  'Closed': 'Fermée',

};

export const PRIORITY_COLORS = {
  1: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',  
  2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  3: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'    
} as const;

export const PRIORITY_LABELS = {
  1: 'Haute', 
  2: 'Moyenne',
  3: 'Basse' 
} as const;

export const PRIORITY_OPTIONS = [
  { 
    value: 'high', 
    label: 'Haute priorité', 
    desc: 'Problème urgent nécessitant une intervention immédiate', 
    color: 'text-red-600' 
  },
  { 
    value: 'medium', 
    label: 'Priorité moyenne', 
    desc: 'Problème important à traiter dans les plus brefs délais', 
    color: 'text-yellow-600' 
  },
  { 
    value: 'low', 
    label: 'Priorité faible', 
    desc: 'Problème pouvant être traité selon la planification normale', 
    color: 'text-green-600' 
  }
] as const;

export const STATUS_OPTIONS = [
  { value: 'New', label: 'Nouvelle' },
  { value: 'Assigned', label: 'Assignée' },
  { value: 'In_Progress', label: 'En cours' },
  { value: 'Resolved', label: 'Résolue' },
  { value: 'Intervention_Scheduled', label: 'Intervention Planifiée' },
  { value: 'Closed', label: 'Fermée' }
] as const;

export const getStatusColor = (status: string): string => {
  return COMPLAINT_STATUS_COLORS[status as keyof typeof COMPLAINT_STATUS_COLORS] || COMPLAINT_STATUS_COLORS['New'];
};

export const getStatusLabel = (status: string): string => {
  return COMPLAINT_STATUS_LABELS[status as keyof typeof COMPLAINT_STATUS_LABELS] || status;
};

export const getPriorityColor = (level: number): string => {
  return PRIORITY_COLORS[level as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS[3];
};

export const getPriorityLabel = (level: number): string => {
  return PRIORITY_LABELS[level as keyof typeof PRIORITY_LABELS] || PRIORITY_LABELS[3];
};

export const convertPriorityToString = (level: number): string => {
  switch (level) {
    case 1: return 'high';
    case 2: return 'medium';
    case 3:
    default: return 'low';
  }
};

export const convertStringToPriorityLevel = (priority: string): number => {
  switch (priority) {
    case 'high': return 1;
    case 'medium': return 2;
    case 'low':
    default: return 3;
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getLocation = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

export const openGoogleMaps = (latitude: number, longitude: number): void => {
  window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
};

export const debugComplaint = (complaint: any): void => {
  console.log('=== DEBUG COMPLAINT ===');
  console.log('ID:', complaint.complaintId);
  console.log('Title:', complaint.title);
  console.log('PriorityLevel (raw):', complaint.priorityLevel, typeof complaint.priorityLevel);
  console.log('IsVerified (raw):', complaint.isVerified, typeof complaint.isVerified);
  console.log('Status:', complaint.status);
  console.log('Full object:', complaint);
  console.log('========================');
};