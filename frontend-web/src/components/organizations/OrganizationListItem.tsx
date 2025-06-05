import React from 'react';
import { Building2, User, Phone, MapPin, Edit2, Eye } from 'lucide-react';

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

interface OrganizationListItemProps {
  organization: Organization;
  index: number;
  onView: (org: Organization) => void;
  onEdit: (org: Organization) => void;
}

export function OrganizationListItem({ organization, index, onView, onEdit }: OrganizationListItemProps) {
  return (
    <div
      className={`p-6 hover:bg-gradient-to-r hover:from-primary-700/5 hover:to-primary-600/5 
                transition-all duration-200 cursor-pointer group ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-neutral-100/30 dark:bg-gray-700/50'}`}
      onClick={() => onView(organization)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-1">
          <div className="h-16 w-16 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand group-hover:scale-110 transition-transform duration-300">
            <Building2 className="h-8 w-8 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                {organization.name}
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                organization.active 
                  ? 'bg-success-100 text-success-800 border border-success-200 dark:bg-success-900/50 dark:text-success-300'
                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-gray-900/50 dark:text-gray-400'
              }`}>
                {organization.active ? '✓ Actif' : '✗ Inactif'}
              </span>
            </div>
            
            <p className="text-neutral-600 dark:text-gray-400 mb-3 line-clamp-2">
              {organization.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-sm bg-neutral-100/50 dark:bg-gray-700/50 p-3 rounded-lg">
                <User className="h-4 w-4 text-primary-600 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-neutral-800 dark:text-white">{organization.responsible}</div>
                  <div className="text-neutral-500 dark:text-gray-400">Responsable</div>
                </div>
              </div>

              <div className="flex items-center text-sm bg-neutral-100/50 dark:bg-gray-700/50 p-3 rounded-lg">
                <Phone className="h-4 w-4 text-primary-600 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-neutral-800 dark:text-white">{organization.phone}</div>
                  <div className="text-neutral-500 dark:text-gray-400">{organization.email}</div>
                </div>
              </div>

              <div className="flex items-center text-sm bg-neutral-100/50 dark:bg-gray-700/50 p-3 rounded-lg">
                <MapPin className="h-4 w-4 text-primary-600 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-neutral-800 dark:text-white">
                    {(organization.annualBudget / 1000000).toFixed(1)}M MAD
                  </div>
                  <div className="text-neutral-500 dark:text-gray-400 truncate">
                    {organization.headquartersAddress}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={(e) => { e.stopPropagation(); onView(organization); }}
            className="p-3 text-primary-700 hover:bg-primary-700/10 rounded-xl transition-colors border border-primary-200/20 hover:border-primary-300"
            title="Voir les détails"
          >
            <Eye className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(organization); }}
            className="p-3 text-primary-600 hover:bg-primary-600/10 rounded-xl transition-colors border border-primary-200/20 hover:border-primary-300"
            title="Modifier"
          >
            <Edit2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}