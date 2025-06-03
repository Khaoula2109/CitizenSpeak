import React from 'react';
import { Search, Plus } from 'lucide-react';

interface SearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewOrganization: () => void;
}

export function SearchAndActions({ searchTerm, onSearchChange, onNewOrganization }: SearchAndActionsProps) {
  return (
    <div className="bg-gradient-to-r from-primary-700/5 to-primary-600/5 dark:from-gray-700 dark:to-gray-600 p-6 border-b border-primary-200/20 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400"/>
            <input
              type="text"
              placeholder="Rechercher un organisme…"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white placeholder-neutral-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-700 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
            />
          </div>
        </div>
        
        <button
          onClick={onNewOrganization}
          className="ml-6 px-6 py-3 bg-brand-gradient hover:from-primary-800 hover:to-primary-700 text-white rounded-xl font-semibold shadow-brand hover:shadow-brand-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2"/>
          <span>Nouvel organisme</span>
        </button>
      </div>
    </div>
  );
}