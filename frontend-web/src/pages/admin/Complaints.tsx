import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useComplaints } from '../../hooks/useComplaints';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useComplaintsFilter } from '../../hooks/useComplaintsFilter';
import { useComplaintsModal } from '../../hooks/useComplaintsModal';
import { useComplaintsHandlers } from '../../hooks/useComplaintsHandlers';
import { ComplaintsFilter } from '../../components/complaints/ComplaintsFilter';
import { ComplaintsHeader } from '../../components/complaints/ComplaintsHeader';
import { ComplaintsList } from '../../components/complaints/ComplaintsList';
import { ComplaintsLoadingError } from '../../components/complaints/ComplaintsLoadingError';
import { ComplaintsModalsContainer } from '../../components/complaints/ComplaintsModalsContainer';

export const Complaints: React.FC = () => {
  const { user } = useAuth();
  const { 
    complaints, 
    loading, 
    error, 
    refetch: fetchComplaints,
    updateComplaintStatus,
    addComment,
    assignComplaint,
    validatePriority,
    deleteComment
  } = useComplaints(user);
  const { organizations } = useOrganizations();

  const {
    searchTerm,
    setSearchTerm,
    selectedPriority,
    setSelectedPriority,
    selectedDepartment,
    setSelectedDepartment,
    selectedVerificationStatus,
    setSelectedVerificationStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showFilters,
    setShowFilters,
    filterComplaints
  } = useComplaintsFilter();

  const {
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
  } = useComplaintsModal();

  const {
    handleComplaintClick,
    handleStatusUpdate,
    handleAddComment,
    handleDeleteComment,
    handlePriorityValidation
  } = useComplaintsHandlers({
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
  });

  const filteredComplaints = filterComplaints(complaints);
  const allDepartments = organizations.flatMap(org => org.departments || []);

  const loadingErrorComponent = (
    <ComplaintsLoadingError loading={loading} error={error} />
  );

  if (loading || error) {
    return loadingErrorComponent;
  }

  return (
    <div className="space-y-6">
      <ComplaintsHeader complaintsCount={filteredComplaints.length} />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-900/50">
        <ComplaintsFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedVerificationStatus={selectedVerificationStatus}
          setSelectedVerificationStatus={setSelectedVerificationStatus}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          allDepartments={allDepartments}
          userRole={user?.role}
        />
      </div>

      <ComplaintsList
        complaints={filteredComplaints}
        onComplaintClick={handleComplaintClick}
      />

      <ComplaintsModalsContainer
        showComplaintModal={showComplaintModal}
        selectedComplaint={selectedComplaint}
        showImageModal={showImageModal}
        showPriorityModal={showPriorityModal}
        selectedComplaintForPriority={selectedComplaintForPriority}
        userRole={user?.role || ''}
        onCloseComplaintModal={closeComplaintModal}
        onCloseImageModal={closeImageModal}
        onClosePriorityModal={closePriorityModal}
        onOpenImageModal={openImageModal}
        onStatusUpdate={handleStatusUpdate}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onPriorityValidation={handlePriorityValidation}
      />
    </div>
  );
};