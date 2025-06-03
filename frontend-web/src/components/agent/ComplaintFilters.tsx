import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

interface ComplaintFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export const ComplaintFilters: React.FC<ComplaintFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showFilters,
  setShowFilters
}) => {
  return (
    <div className="bg-gradient-to-r from-primary-700/5 to-primary-600/5 p-6 border-b border-primary-200/20">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une plainte…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                       bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                       placeholder-neutral-500 dark:placeholder-gray-400 
                       focus:outline-none focus:border-primary-700 focus:bg-white dark:focus:bg-gray-600 
                       transition-all duration-200"
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 bg-white dark:bg-gray-700 border-2 border-neutral-300 dark:border-gray-600 
                     text-neutral-700 dark:text-gray-200 rounded-xl font-semibold 
                     hover:bg-neutral-50 dark:hover:bg-gray-600 hover:border-primary-500 
                     transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
          >
            <Filter className="h-5 w-5 mr-2 text-neutral-500 dark:text-gray-400" />
            Filtres
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 animate-in slide-in-from-top duration-300">
            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                         bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                         focus:border-primary-700 transition-all"
              >
                <option value="all">Tous les statuts</option>
                <option value="assigned">Assignée</option>
                <option value="in progress">En cours</option>
                <option value="intervention_scheduled">Intervention Planifiée</option>
                <option value="resolved">Résolue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                         bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                         focus:border-primary-700 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl 
                         bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white 
                         focus:border-primary-700 transition-all"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};