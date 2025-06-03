import { useState } from 'react';

export const useComplaintsModal = () => {
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedComplaintForPriority, setSelectedComplaintForPriority] = useState(null);

  const openComplaintModal = (complaint: any) => {
    setSelectedComplaint(complaint);
    setShowComplaintModal(true);
  };

  const closeComplaintModal = () => {
    setShowComplaintModal(false);
    setSelectedComplaint(null);
  };

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const openPriorityModal = (complaint: any) => {
    setSelectedComplaintForPriority(complaint);
    setShowPriorityModal(true);
  };

  const closePriorityModal = () => {
    setShowPriorityModal(false);
    setSelectedComplaintForPriority(null);
  };

  return {
    showComplaintModal,
    selectedComplaint,
    setSelectedComplaint,
    showImageModal,
    showPriorityModal,
    selectedComplaintForPriority,
    openComplaintModal,
    closeComplaintModal,
    openImageModal,
    closeImageModal,
    openPriorityModal,
    closePriorityModal
  };
};