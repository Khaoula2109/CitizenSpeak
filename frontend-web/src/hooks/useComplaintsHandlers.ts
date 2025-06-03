import { debugComplaint } from '../constants/complaintConstants';

interface UseComplaintsHandlersProps {
  updateComplaintStatus: (id: string, status: string, notes: string) => Promise<void>;
  addComment: (id: string, description: string) => Promise<void>;
  deleteComment: (complaintId: string, commentId: string) => Promise<void>;
  validatePriority: (id: string, priority: string, accepted: boolean, notes: string, agentId?: string | null, departmentId?: string | null) => Promise<any>;
  fetchComplaints: () => Promise<void>;
  selectedComplaint: any;
  setSelectedComplaint: (complaint: any) => void;
  selectedComplaintForPriority: any;
  openComplaintModal: (complaint: any) => void;
  openPriorityModal: (complaint: any) => void;
  closePriorityModal: () => void;
}

export const useComplaintsHandlers = ({
  updateComplaintStatus,
  addComment,
  deleteComment,
  validatePriority,
  fetchComplaints,
  selectedComplaint,
  setSelectedComplaint,
  selectedComplaintForPriority,
  openComplaintModal,
  openPriorityModal,
  closePriorityModal
}: UseComplaintsHandlersProps) => {

  const handleComplaintClick = (complaint: any) => {
    debugComplaint(complaint);
    if (complaint.isVerified === 0) {
      openPriorityModal(complaint);
    } else {
      openComplaintModal(complaint);
    }
  };

  const handleStatusUpdate = async (status: string, notes: string) => {
    if (!selectedComplaint) return;
    
    try {
      await updateComplaintStatus(selectedComplaint.complaintId, status, notes);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }  
  };

  const handleAddComment = async (description: string) => {
    if (!selectedComplaint) return;

    try {
      await addComment(selectedComplaint.complaintId, description);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedComplaint) return;

    try {
      await deleteComment(selectedComplaint.complaintId, commentId);
      setSelectedComplaint((prev: any) => ({
        ...prev,
        comments: prev.comments?.filter((comment: any) => comment.id !== commentId) || []
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      throw error;
    }
  };

  const handlePriorityValidation = async (
    priority: string, 
    accepted: boolean, 
    notes: string, 
    agentId: string | null = null, 
    departmentId: string | null = null
  ) => {
    if (!selectedComplaintForPriority) {
      return;
    }

    try {
      const response = await validatePriority(
        selectedComplaintForPriority.complaintId, 
        priority,
        accepted, 
        notes,
        agentId,
        departmentId
      );

      const updatedComplaint = {
        ...selectedComplaintForPriority,
        priorityLevel: response.priorityLevel,
        isVerified: response.isVerified,
        status: response.status,
        assignedTo: response.assignedTo,
        department: response.department
      };

      closePriorityModal();
      openComplaintModal(updatedComplaint);
      
      await fetchComplaints();
      
    } catch (error) {
      console.error('Error in handlePriorityValidation:', error);
    }
  };

  return {
    handleComplaintClick,
    handleStatusUpdate,
    handleAddComment,
    handleDeleteComment,
    handlePriorityValidation
  };
};