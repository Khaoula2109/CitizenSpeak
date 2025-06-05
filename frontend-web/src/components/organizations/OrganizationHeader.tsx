import React from 'react';
import { Building2, MessageSquare } from 'lucide-react';

export function OrganizationHeader() {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="relative mr-3">
          <MessageSquare className="h-8 w-8 text-primary-600" />
          <Building2 className="h-5 w-5 text-primary-500 absolute -bottom-1 -right-1 animate-bounce" />
        </div>
        <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent">
          Gestion des organismes
        </h1>
      </div>
      <p className="text-neutral-500 dark:text-gray-400 text-lg">
        Liste des organismes et leurs départements
      </p>
    </div>
  );
}