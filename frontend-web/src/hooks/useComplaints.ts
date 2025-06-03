import { useState, useEffect } from 'react';
import api from '../utils/api';

// Interfaces pour typer les données
interface User {
  role?: string;
  id?: string;
  name?: string;
}

interface Agent {
  id: string;
  name: string;
  role?: string;
  service?: string;
  email?: string;
}

interface Comment {
  id: string;
  description: string;
  commentDate: string;
  authorType?: 'AGENT' | 'CITIZEN';
  agent?: Agent;
  citizen?: {
    name: string;
    role?: string;
    type?: 'AGENT' | 'CITIZEN';
    service?: string;
  };
}

interface StatusHistoryEntry {
  id: string;
  status: string;
  notes?: string;
  date: string;
  agent?: Agent;
}

interface Complaint {
  complaintId: string;
  title: string;
  description: string;
  status: string;
  priorityLevel?: string;
  isVerified?: number;
  latitude: number;
  longitude: number;
  creationDate: string;
  citizen?: {
    name: string;
  };
  assignedTo?: Agent;
  department?: string;
  comments?: Comment[];
  statusHistory?: StatusHistoryEntry[];
  media?: Array<{
    url: string;
  }>;
}

interface UseComplaintsReturn {
  complaints: Complaint[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateComplaintStatus: (complaintId: string, status: string, notes: string) => Promise<any>;
  addComment: (complaintId: string, description: string) => Promise<any>;
  assignComplaint: (complaintId: string, agentId: string, departmentId: string) => Promise<any>;
  validatePriority: (
    complaintId: string,
    priority: string,
    accepted: boolean,
    notes: string,
    agentId?: string | null,
    departmentId?: string | null
  ) => Promise<any>;
  deleteComment: (complaintId: string, commentId: string) => Promise<void>;
}

export const useComplaints = (user: User | null): UseComplaintsReturn => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = user?.role === 'Admin' ? '/complaints/admin-dashboard' : '/complaints/with-comments';
      const response = await api.get(endpoint);
      
      console.log('Raw API response:', response.data);
      
      response.data.forEach((complaint: Complaint, index: number) => {
        console.log(`Complaint ${index + 1}:`, {
          id: complaint.complaintId,
          title: complaint.title,
          priorityLevel: complaint.priorityLevel,
          isVerified: complaint.isVerified,
          status: complaint.status,
          rawData: complaint
        });
        
        if (complaint.priorityLevel === undefined) {
          console.warn(`Complaint ${complaint.complaintId}: priorityLevel is undefined`);
        }
        if (complaint.isVerified === undefined) {
          console.warn(`Complaint ${complaint.complaintId}: isVerified is undefined`);
        }
      });

      setComplaints(response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des plaintes');
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId: string, status: string, notes: string): Promise<any> => {
    try {
      const response = await api.post(`/complaints/${complaintId}/status`, {
        status,
        notes
      });
      
      setComplaints(prev => prev.map((complaint: Complaint) => 
        complaint.complaintId === complaintId 
          ? { ...complaint, status, statusHistory: [...(complaint.statusHistory || []), response.data] }
          : complaint
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error updating complaint status:', err);
      throw err;
    }
  };

  const addComment = async (complaintId: string, description: string): Promise<any> => {
    try {
      const response = await api.post(`/complaints/${complaintId}/comments`, {
        description
      });
      
      setComplaints(prev => prev.map((complaint: Complaint) => 
        complaint.complaintId === complaintId
          ? { ...complaint, comments: [...(complaint.comments || []), response.data] }
          : complaint
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const assignComplaint = async (complaintId: string, agentId: string, departmentId: string): Promise<any> => {
    try {
      const response = await api.post(`/complaints/${complaintId}/assign`, {
        agentId,
        departmentId
      });
      
      setComplaints(prev => prev.map((complaint: Complaint) => 
        complaint.complaintId === complaintId
          ? { 
              ...complaint, 
              status: 'Assigned',
              assignedTo: response.data.assignedTo,
              department: response.data.department
            }
          : complaint
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error assigning complaint:', err);
      throw err;
    }
  };

  const validatePriority = async (
    complaintId: string, 
    priority: string, 
    accepted: boolean, 
    notes: string, 
    agentId: string | null = null, 
    departmentId: string | null = null
  ): Promise<any> => {
    console.log('validatePriority function ENTERED');
    console.log('Parameters:', { complaintId, priority, accepted, notes, agentId, departmentId });
    
    try {
      const encodedComplaintId = encodeURIComponent(complaintId);
      
      const payload: any = {
        priority: priority,
        accepted: accepted,
        notes: notes || ''
      };

      if (agentId && departmentId) {
        payload.agentId = agentId;
        payload.departmentId = departmentId;
      }

      console.log('Payload:', payload);

      const response = await api.post(`/complaints/${encodedComplaintId}/validate-priority`, payload);
      
      console.log('API call SUCCESS, raw response:', response);
      
      setComplaints(prev => prev.map((complaint: Complaint) => {
        if (complaint.complaintId === complaintId) {
          const updatedComplaint: Complaint = { 
            ...complaint, 
            priorityLevel: response.data.priorityLevel,
            isVerified: response.data.isVerified,
            status: response.data.status
          };

          if (response.data.assignedTo) {
            updatedComplaint.assignedTo = response.data.assignedTo;
          }
          if (response.data.department) {
            updatedComplaint.department = response.data.department;
          }
          
          console.log('Updated complaint in state:', updatedComplaint);
          return updatedComplaint;
        }
        return complaint;
      }));
      
      setTimeout(() => {
        console.log('Refreshing complaints list...');
        fetchComplaints();
      }, 500);
      
      return response.data;
    } catch (err) {
      console.error('API call FAILED:', err);
      throw err;
    }
  };

  const deleteComment = async (complaintId: string, commentId: string): Promise<void> => {
    try {
      await api.delete(`/complaints/${complaintId}/comments/${commentId}`);
      
      setComplaints(prev => prev.map((complaint: Complaint) => 
        complaint.complaintId === complaintId
          ? { ...complaint, comments: complaint.comments?.filter((comment: Comment) => comment.id !== commentId) || [] }
          : complaint
      ));
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  return {
    complaints,
    loading,
    error,
    refetch: fetchComplaints,
    updateComplaintStatus,
    addComment,
    assignComplaint,
    validatePriority,
    deleteComment
  };
};