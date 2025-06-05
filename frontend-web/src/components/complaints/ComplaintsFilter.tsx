import React from 'react';
import { Search, Filter } from 'lucide-react';

interface ComplaintsFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  selectedVerificationStatus: string;
  setSelectedVerificationStatus: (status: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  allDepartments: any[];
  userRole?: string;
}

export const ComplaintsFilter: React.FC<ComplaintsFilterProps> = ({
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
  allDepartments,
  userRole
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-amber-600 dark:border-amber-900/50 overflow-hidden">
      <div className="bg-gradient-to-r from-amber-800 to-amber-600 dark:from-amber-900/30 dark:to-orange-900/30 p-6 border-b border-amber-200 dark:border-amber-900/50">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-amber-500 dark:text-amber-400"/>
              </div>
              <input
                type="text"
                placeholder="Rechercher une plainte par titre ou description…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-grey-300 dark:border-amber-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-amber-400 focus:border-amber-600 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 transition-all duration-200 shadow-sm hover:border-amber-400 dark:hover:border-amber-600"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                showFilters 
                  ? 'bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-amber-300 dark:shadow-amber-900' 
                  : 'bg-white dark:bg-gray-700 text-amber-800 dark:text-amber-200 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-600 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'
              }`}
            >
              <Filter className={`h-5 w-5 mr-2 ${showFilters ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-amber-200 dark:border-amber-800">
              <div>
                <label className="block text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  Priorité
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-600 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 p-3 transition-all duration-200 hover:border-amber-400 dark:hover:border-amber-600"
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="high">🔴 Haute</option>
                  <option value="medium">🟡 Moyenne</option>
                  <option value="low">🟢 Basse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  Département
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-600 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 p-3 transition-all duration-200 hover:border-amber-400 dark:hover:border-amber-600"
                >
                  <option value="all">Tous les départements</option>
                  {allDepartments.map(dept => (
                    <option key={dept.id} value={dept.name}>
                      🏢 {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {userRole === 'Admin' && (
                <div>
                  <label className="block text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    Statut de vérification
                  </label>
                  <select
                    value={selectedVerificationStatus}
                    onChange={(e) => setSelectedVerificationStatus(e.target.value)}
                    className="w-full rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-600 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 p-3 transition-all duration-200 hover:border-amber-400 dark:hover:border-amber-600"
                  >
                    <option value="all">Toutes les plaintes</option>
                    <option value="unverified">⏳ À prioriser</option>
                    <option value="verified">✅ Vérifiées</option>
                  </select>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    📅 Date de début
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-600 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 p-3 transition-all duration-200 hover:border-amber-400 dark:hover:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                    📅 Date de fin
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-600 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:focus:ring-amber-400/20 p-3 transition-all duration-200 hover:border-amber-400 dark:hover:border-amber-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};