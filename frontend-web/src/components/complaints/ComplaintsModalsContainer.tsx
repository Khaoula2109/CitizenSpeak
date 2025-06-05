import React from 'react';
import { ComplaintModal } from './ComplaintModal';
import { ImageModal } from './ImageModal';
import { PriorityAnalysisModal } from './PriorityAnalysisModal';
interface ComplaintsModalsContainerProps {
  showComplaintModal: boolean;
  selectedComplaint: any;
  showImageModal: boolean;
  showPriorityModal: boolean;
  selectedComplaintForPriority: any;
  userRole: string;
  onCloseComplaintModal: () => void;
  onCloseImageModal: () => void;
  onClosePriorityModal: () => void;
  onOpenImageModal: () => void;
  onStatusUpdate: (status: string, notes: string) => Promise<void>;
  onAddComment: (description: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onPriorityValidation: (priority: string, accepted: boolean, notes: string, agentId?: string | null, departmentId?: string | null) => Promise<void>;
}

export const ComplaintsModalsContainer: React.FC<ComplaintsModalsContainerProps> = ({
  showComplaintModal,
  selectedComplaint,
  showImageModal,
  showPriorityModal,
  selectedComplaintForPriority,
  userRole,
  onCloseComplaintModal,
  onCloseImageModal,
  onClosePriorityModal,
  onOpenImageModal,
  onStatusUpdate,
  onAddComment,
  onDeleteComment,
  onPriorityValidation
}) => {
  return (
    <>
      {showComplaintModal && selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={onCloseComplaintModal}
          onStatusUpdate={onStatusUpdate}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          userRole={userRole}
          onImageClick={onOpenImageModal}
        />
      )}

      <ImageModal
        isOpen={showImageModal}
        imageUrl={selectedComplaint?.media?.[0]?.url || ''}
        alt="Détail de la plainte"
        onClose={onCloseImageModal}
      />

      {showPriorityModal && selectedComplaintForPriority && (
        <PriorityAnalysisModal
          complaint={selectedComplaintForPriority}
          onClose={onClosePriorityModal}
          onValidate={onPriorityValidation}
        />
      )}
    </>
  );
};