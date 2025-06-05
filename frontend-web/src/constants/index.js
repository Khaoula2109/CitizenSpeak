export const COMPLAINT_STATUS = {
  NEW: 'New',
  ASSIGNED: 'Assigned', 
  IN_PROGRESS: 'In_Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

export const COMPLAINT_STATUS_LABELS = {
  [COMPLAINT_STATUS.NEW]: 'Nouvelle',
  [COMPLAINT_STATUS.ASSIGNED]: 'Assignée',
  [COMPLAINT_STATUS.IN_PROGRESS]: 'En cours',
  [COMPLAINT_STATUS.RESOLVED]: 'Résolue',
  [COMPLAINT_STATUS.CLOSED]: 'Fermée'
};

export const COMPLAINT_STATUS_COLORS = {
  [COMPLAINT_STATUS.NEW]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  [COMPLAINT_STATUS.ASSIGNED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  [COMPLAINT_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [COMPLAINT_STATUS.RESOLVED]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [COMPLAINT_STATUS.CLOSED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
};

export const PRIORITY_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3
};

export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'Basse',
  [PRIORITY_LEVELS.MEDIUM]: 'Moyenne',
  [PRIORITY_LEVELS.HIGH]: 'Haute'
};

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [PRIORITY_LEVELS.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [PRIORITY_LEVELS.HIGH]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
};

export const USER_ROLES = {
  ADMIN: 'Admin',
  AGENT: 'Agent',
  ANALYST: 'Analyst',
  CITIZEN: 'Citizen'
};

export const API_ENDPOINTS = {
  COMPLAINTS: '/complaints',
  COMPLAINTS_WITH_COMMENTS: '/complaints/with-comments',
  ORGANIZATIONS: '/organizations',
  DEPARTMENTS: '/departments',
  CATEGORIES: '/categories',
  MEDIA: '/media',
  AUTH: '/auth',
  USERS: '/user'
};

export const getStatusLabel = (status) => {
  return COMPLAINT_STATUS_LABELS[status] || status;
};

export const getStatusColor = (status) => {
  return COMPLAINT_STATUS_COLORS[status] || COMPLAINT_STATUS_COLORS[COMPLAINT_STATUS.NEW];
};

export const getPriorityLabel = (level) => {
  return PRIORITY_LABELS[level] || PRIORITY_LABELS[PRIORITY_LEVELS.LOW];
};

export const getPriorityColor = (level) => {
  return PRIORITY_COLORS[level] || PRIORITY_COLORS[PRIORITY_LEVELS.LOW];
};

export const convertPriorityToString = (level) => {
  switch (level) {
    case PRIORITY_LEVELS.HIGH: return 'high';
    case PRIORITY_LEVELS.MEDIUM: return 'medium';
    case PRIORITY_LEVELS.LOW:
    default: return 'low';
  }
};

export const convertStringToPriority = (priority) => {
  switch (priority.toLowerCase()) {
    case 'high': return PRIORITY_LEVELS.HIGH;
    case 'medium': return PRIORITY_LEVELS.MEDIUM;
    case 'low':
    default: return PRIORITY_LEVELS.LOW;
  }
};