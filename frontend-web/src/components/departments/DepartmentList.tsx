import React from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Department } from '../../types/department';
import { DepartmentListItem } from './DepartmentListItem';

interface DepartmentListProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onAddNew: () => void;
}

export function DepartmentList({ departments, onEdit, onAddNew }: DepartmentListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-primary-200/20 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-primary-700/5 to-primary-600/5 dark:from-gray-700 dark:to-gray-600 p-6 border-b border-primary-200/20 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
              Départements ({departments.length})
            </h2>
            <p className="text-neutral-500 dark:text-gray-400">Liste des départements rattachés à l'organisme</p>
          </div>
          <button 
            onClick={onAddNew}
            className="px-6 py-3 bg-brand-gradient hover:from-primary-800 hover:to-primary-700 text-white rounded-xl 
                     font-semibold shadow-brand hover:shadow-brand-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un département
          </button>
        </div>
      </div>

      <div className="divide-y divide-primary-200/10 dark:divide-gray-700">
        {departments.map((department, index) => (
          <DepartmentListItem
            key={department.id}
            department={department}
            index={index}
            onEdit={onEdit}
          />
        ))}

        {departments.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-neutral-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">Aucun département</h3>
            <p className="text-neutral-500 dark:text-gray-400 mb-6">
              Aucun département n'est actuellement rattaché à cette organisation.
            </p>
            <button 
              onClick={onAddNew}
              className="px-6 py-3 bg-brand-gradient hover:from-primary-800 hover:to-primary-700 text-white rounded-xl 
                       font-semibold shadow-brand hover:shadow-brand-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer le premier département
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
