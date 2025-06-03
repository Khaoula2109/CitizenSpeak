import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDepartments } from '../../hooks/useDepartments';
import { Department, DepartmentFormData } from '../../types/department';
import { EMPTY_DEPARTMENT_FORM } from '../../constants/departmentConstants';
import { OrganizationHeader } from '../../components/departments/OrganizationHeader';
import { StatsCards } from '../../components/departments/StatsCards';
import { DepartmentList } from '../../components/departments/DepartmentList';
import { DepartmentFormModal } from '../../components/departments/DepartmentFormModal';
import { LoadingState } from '../../components/departments/LoadingState';
import { ErrorState } from '../../components/departments/ErrorState';

export function DepartmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    organization,
    departments,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment
  } = useDepartments(id);

  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const handleBack = () => {
    navigate('/admin/dashboard/departments');
  };

  const handleAddNew = () => {
    setEditingDepartment(null);
    setShowModal(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setShowModal(true);
  };

  const handleSubmit = async (formData: DepartmentFormData) => {
    if (editingDepartment) {
      await updateDepartment(editingDepartment.id, formData);
    } else {
      await createDepartment(formData);
    }
    setShowModal(false);
  };

  const handleDelete = async (deptId: string) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await deleteDepartment(deptId);
      } catch (err) {
        console.error('Erreur:', err);
        alert('Échec de la suppression');
      }
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!organization) return <ErrorState type="not-found" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <OrganizationHeader organization={organization} onBack={handleBack} />
        
        <StatsCards organization={organization} departments={departments} />
        
        <DepartmentList 
          departments={departments} 
          onEdit={handleEdit} 
          onAddNew={handleAddNew} 
        />

        <DepartmentFormModal
          isOpen={showModal}
          editingDepartment={editingDepartment}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}