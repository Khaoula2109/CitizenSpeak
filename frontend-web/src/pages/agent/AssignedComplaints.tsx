import React, { useState } from 'react';
import { useAssignedComplaints } from '../../hooks/useAssignedComplaints';
import { PageHeader } from '../../components/agent/PageHeader';
import { ComplaintStats } from '../../components/agent/ComplaintStats';
import { ComplaintFilters } from '../../components/agent/ComplaintFilters';
import { ComplaintList } from '../../components/agent/ComplaintList';
import { ComplaintDetailModal } from '../../components/agent/ComplaintDetailModal';
import { InterventionModal } from '../../components/agent/InterventionModal';
import { ImageModal } from '../../components/agent/ImageModal';

export default function AssignedComplaints() {
  const {
    complaints,
    loading,
    error,
    fetchAssignedComplaints,
    fetchComplaintDetails,
    updateComplaintStatus,
    addComment,
    createIntervention
  } = useAssignedComplaints();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [interventionData, setInterventionData] = useState({
    startDate: '',
    endDate: '',
    status: 'Planned',
    description: '',
    resourcesNeeded: ['']
  });

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || complaint.status.toLowerCase() === selectedStatus.toLowerCase();
    
    const complaintDate = new Date(complaint.creationDate);
    const matchesStartDate = !startDate || complaintDate >= new Date(startDate);
    const matchesEndDate = !endDate || complaintDate <= new Date(endDate);

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const handleComplaintClick = async (complaint: any) => {
    setSelectedComplaint(complaint);
    const detailedComplaint = await fetchComplaintDetails(complaint.complaintId);
    if (detailedComplaint) {
      setSelectedComplaint(detailedComplaint);
    }
    setShowComplaintModal(true);
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      if (selectedComplaint && selectedComplaint.complaintId === complaintId) {
        const updatedComplaint = await fetchComplaintDetails(complaintId);
        if (updatedComplaint) {
          setSelectedComplaint(updatedComplaint);
        }
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddComment = async (description: string) => {
    if (!selectedComplaint || !description.trim()) return;

    try {
      await addComment(selectedComplaint.complaintId, description);
      const updatedComplaint = await fetchComplaintDetails(selectedComplaint.complaintId);
      if (updatedComplaint) {
        setSelectedComplaint(updatedComplaint);
      }
      setNewComment('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateIntervention = async () => {
    if (!selectedComplaint) return;

    try {
      await createIntervention(selectedComplaint.complaintId, interventionData);
      const updatedComplaint = await fetchComplaintDetails(selectedComplaint.complaintId);
      if (updatedComplaint) {
        setSelectedComplaint(updatedComplaint);
      }
      
      setInterventionData({
        startDate: '',
        endDate: '',
        status: 'Planned',
        description: '',
        resourcesNeeded: ['']
      });
      setShowInterventionModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const totalComplaints = complaints.length;
  const completedComplaints = complaints.filter(c => c.status.toLowerCase() === 'resolved').length;
  const inProgressComplaints = complaints.filter(c => c.status.toLowerCase() === 'in progress').length;
  const pendingComplaints = totalComplaints - completedComplaints - inProgressComplaints;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader />

        <ComplaintStats
          totalComplaints={totalComplaints}
          inProgressComplaints={inProgressComplaints}
          pendingComplaints={pendingComplaints}
          completedComplaints={completedComplaints}
        />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-primary-200/20 dark:border-gray-700 overflow-hidden">
          <ComplaintFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />

          <ComplaintList
            complaints={filteredComplaints}
            loading={loading}
            error={error}
            onComplaintClick={handleComplaintClick}
            onRetry={fetchAssignedComplaints}
          />
        </div>

        {selectedComplaint && (
          <ComplaintDetailModal
            complaint={selectedComplaint}
            isOpen={showComplaintModal}
            onClose={() => setShowComplaintModal(false)}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
            onPlanIntervention={() => setShowInterventionModal(true)}
            newComment={newComment}
            setNewComment={setNewComment}
            setShowImageModal={setShowImageModal}
            setSelectedImageUrl={setSelectedImageUrl}
          />
        )}

        <InterventionModal
          isOpen={showInterventionModal}
          onClose={() => setShowInterventionModal(false)}
          onSubmit={handleCreateIntervention}
          interventionData={interventionData}
          setInterventionData={setInterventionData}
        />

        <ImageModal
          isOpen={showImageModal}
          imageUrl={selectedImageUrl}
          onClose={() => setShowImageModal(false)}
        />
      </div>
    </div>
  );
}