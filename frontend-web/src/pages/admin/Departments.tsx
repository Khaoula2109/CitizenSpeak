import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganizationHeader } from '../../components/organizations/OrganizationHeader';
import { SearchAndActions } from '../../components/organizations/SearchAndActions';
import { OrganizationList } from '../../components/organizations/OrganizationList';
import { OrganizationFormModal } from '../../components/organizations/OrganizationFormModal';
import { useOrganizations } from '../../hooks/useOrganizations';

interface Organization {
  organizationId: string;
  name: string;
  description: string;
  responsible: string;
  phone: string;
  email: string;
  annualBudget: number;
  headquartersAddress: string;
  active: boolean;
  id: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}

interface OrganizationFormData {
  name: string;
  description: string;
  responsible: string;
  phone: string;
  email: string;
  annualBudget: number;
  headquartersAddress: string;
  active: boolean;
}

const emptyOrganizationForm: OrganizationFormData = {
  name: '',
  description: '',
  responsible: '',
  phone: '',
  email: '',
  annualBudget: 0,
  headquartersAddress: '',
  active: true, 
};

export function Departments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState<OrganizationFormData>(emptyOrganizationForm);
  const navigate = useNavigate();

  const { organizations, createOrganization, updateOrganization } = useOrganizations();

  const filteredOrganizations = organizations.filter(o =>
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.responsible.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNew = () => {
    setEditingOrg(null);
    setForm(emptyOrganizationForm);
    setShowModal(true);
  };

  const openEdit = (org: Organization) => {
    setEditingOrg(org);
    setForm({
      name: org.name,
      description: org.description,
      responsible: org.responsible,
      phone: org.phone,
      email: org.email,
      annualBudget: org.annualBudget,
      headquartersAddress: org.headquartersAddress,
      active: org.active,  
    });
    setShowModal(true);
  };

  const handleView = (org: Organization) => {
    navigate(`/admin/dashboard/departments/${org.id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.id, form);
      } else {
        await createOrganization(form);
      }
      setShowModal(false);
      setEditingOrg(null);
      setForm(emptyOrganizationForm);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingOrg(null);
    setForm(emptyOrganizationForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <OrganizationHeader />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-primary-200/20 dark:border-gray-700 overflow-hidden">
          <SearchAndActions
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onNewOrganization={openNew}
          />

          <OrganizationList
            organizations={filteredOrganizations}
            searchTerm={searchTerm}
            onView={handleView}
            onEdit={openEdit}
            onNewOrganization={openNew}
          />
        </div>

        <OrganizationFormModal
          show={showModal}
          editingOrg={editingOrg}
          form={form}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          onFormChange={setForm}
        />
      </div>
    </div>
  );
}