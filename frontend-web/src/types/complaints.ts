export interface ComplaintAction {
  id: string;
  type: 'status_change' | 'comment' | 'assignment' | 'update';
  description: string;
  timestamp: string;
  agent: {
    id: string;
    name: string;
    department?: string;
  };
  previousStatus?: string;
  newStatus?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  submittedBy: {
    name: string;
    id: string;
  };
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'assigned' | 'in_progress' | 'resolved';
  department?: string;
  comments: number;
  category: string;
  assignedTo?: {
    name: string;
    id: string;
  };
  similarReports?: number;
  imageUrl?: string;
  actions?: ComplaintAction[];
  autoAssignment?: {
    score: number;
    suggestedDepartment: string;
    confidence: number;
    reasons: string[];
  };
}

export interface Department {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  responsibles: string[];
}