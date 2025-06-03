import { useState, useEffect } from 'react';
import api from '../utils/api';

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
  isFromCurrentUser?: boolean; 
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

export const useAssignedComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignedComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get<Complaint[]>('/agent/complaints/assigned');
      const sortedComplaints = response.data.sort((a, b) => 
        new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
      );
      setComplaints(sortedComplaints);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des plaintes');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintDetails = async (complaintId: string): Promise<Complaint | null> => {
    try {
      const encodedId = encodeURIComponent(complaintId);
      const response = await api.get<Complaint>(`/agent/complaints/${encodedId}`);
      return response.data;
    } catch (err: any) {
      return null;
    }
  };

  const updateComplaintStatus = async (complaintId: string, newStatus: string, notes?: string) => {
    try {
      const encodedId = encodeURIComponent(complaintId);
      await api.post(`/agent/complaints/${encodedId}/status`, {
        status: newStatus,
        notes: notes || ''
      });
      await fetchAssignedComplaints();
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const addComment = async (complaintId: string, description: string) => {
    try {
      const encodedId = encodeURIComponent(complaintId);
      await api.post(`/agent/complaints/${encodedId}/comments`, {
        description
      });
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de l\'ajout du commentaire');
    }
  };

  const createIntervention = async (complaintId: string, interventionData: any) => {
    try {
      const formatDateForServer = (dateString: string) => {
        if (!dateString) return '';
        return dateString.includes(':') && dateString.split(':').length === 2 
          ? `${dateString}:00` 
          : dateString;
      };

      const encodedId = encodeURIComponent(complaintId);
      await api.post(`/agent/complaints/${encodedId}/interventions`, {
        ...interventionData,
        startDate: formatDateForServer(interventionData.startDate),
        endDate: interventionData.endDate ? formatDateForServer(interventionData.endDate) : null,
        resourcesNeeded: interventionData.resourcesNeeded.filter((r: string) => r.trim() !== '')
      });
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erreur lors de la création de l\'intervention');
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  return {
    complaints,
    loading,
    error,
    fetchAssignedComplaints,
    fetchComplaintDetails,
    updateComplaintStatus,
    addComment,
    createIntervention
  };
};