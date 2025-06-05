import React from 'react';
import { ArrowLeft, MessageSquare, Building2, Calendar } from 'lucide-react';
import { OrganizationInfo } from '../../types/department';

interface OrganizationHeaderProps {
  organization: OrganizationInfo;
  onBack: () => void;
}

export function OrganizationHeader({ organization, onBack }: OrganizationHeaderProps) {
  return (
    <div className="flex items-center space-x-6">
      <button
        onClick={onBack}
        className="group p-3 bg-white dark:bg-gray-800 rounded-xl shadow-brand border border-primary-200/20 dark:border-gray-700 
                 hover:shadow-brand-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-200"
      >
        <ArrowLeft className="h-5 w-5 text-primary-600 dark:text-primary-400 group-hover:text-primary-700" />
      </button>
      
      <div className="flex-1">
        <div className="flex items-center mb-3">
          <div className="relative mr-4">
            <MessageSquare className="h-8 w-8 text-primary-600" />
            <Building2 className="h-5 w-5 text-primary-500 absolute -bottom-1 -right-1 animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent">
            {organization.name}
          </h1>
        </div>
        <p className="text-neutral-600 dark:text-gray-400 text-lg mb-2">{organization.description}</p>
        <div className="flex items-center text-sm text-neutral-500 dark:text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            Créé par <strong className="text-primary-700 dark:text-primary-400">{organization.createdBy}</strong> le {new Date(organization.createdAt).toLocaleString('fr-FR')}
          </span>
        </div>
      </div>
    </div>
  );
}