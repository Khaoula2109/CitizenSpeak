import { useState } from 'react';
import { convertPriorityToString } from '../constants/complaintConstants';

export const useComplaintsFilter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filterComplaints = (complaints: any[]) => {
    return complaints
      .filter(complaint => {
        const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const priorityString = convertPriorityToString(complaint.priorityLevel);
        const matchesPriority = selectedPriority === 'all' || priorityString === selectedPriority;
        const matchesDepartment = selectedDepartment === 'all' || complaint.department === selectedDepartment;
        
        const matchesVerification = selectedVerificationStatus === 'all' || 
                                  (selectedVerificationStatus === 'verified' && complaint.isVerified === 1) ||
                                  (selectedVerificationStatus === 'unverified' && complaint.isVerified === 0);
        
        const complaintDate = new Date(complaint.creationDate);
        const matchesStartDate = !startDate || complaintDate >= new Date(startDate);
        const matchesEndDate = !endDate || complaintDate <= new Date(endDate);

        return matchesSearch && matchesPriority && matchesDepartment && matchesVerification && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        const dateA = new Date(a.creationDate);
        const dateB = new Date(b.creationDate);
        return dateB.getTime() - dateA.getTime();
      });
  };

  return {
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
  };
};