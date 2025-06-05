import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { OrganizationListItem } from './OrganizationListItem';

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

interface OrganizationListProps {
  organizations: Organization[];
  searchTerm: string;
  onView: (org: Organization) => void;
  onEdit: (org: Organization) => void;
  onNewOrganization: () => void;
}

export function OrganizationList({ 
  organizations, 
  searchTerm, 
  onView, 
  onEdit, 
  onNewOrganization 
}: OrganizationListProps) {
  if (organizations.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-neutral-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-neutral-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
          {searchTerm ? 'Aucun résultat trouvé' : 'Aucun organisme'}
        </h3>
        <p className="text-neutral-500 dark:text-gray-400 mb-6">
          {searchTerm 
            ? 'Aucun résultat ne correspond à votre recherche'
            : 'Aucun organisme n\'est actuellement enregistré dans le système'
          }
        </p>
        {!searchTerm && (
          <button
            onClick={onNewOrganization}
            className="px-6 py-3 bg-brand-gradient hover:from-primary-800 hover:to-primary-700 text-white rounded-xl font-semibold shadow-brand hover:shadow-brand-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center mx-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Créer le premier organisme
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-primary-200/10 dark:divide-gray-700">
      {organizations.map((organization, index) => (
        <OrganizationListItem
          key={organization.id}
          organization={organization}
          index={index}
          onView={onView}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}