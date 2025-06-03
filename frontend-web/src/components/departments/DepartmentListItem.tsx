import React from 'react';
import { Building2, MapPin, Phone, Mail, Users, FileText, Edit2 } from 'lucide-react';
import { Department } from '../../types/department';

interface DepartmentListItemProps {
  department: Department;
  index: number;
  onEdit: (department: Department) => void;
}

export function DepartmentListItem({ department, index, onEdit }: DepartmentListItemProps) {
  return (
    <div className={`p-6 hover:bg-gradient-to-r hover:from-primary-700/5 hover:to-primary-600/5 
                    transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-neutral-100/30 dark:bg-gray-700/50'}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-1">{department.name}</h3>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  department.status === 'active' 
                    ? 'bg-success-100 text-success-800 border border-success-200 dark:bg-success-900/50 dark:text-success-300'
                    : 'bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-gray-900/50 dark:text-gray-400'
                }`}>
                  {department.status === 'active' ? '✓ Actif' : '✗ Inactif'}
                </span>
                <span className="ml-3 text-sm text-neutral-500 dark:text-gray-400">
                  Géré par <strong className="text-primary-700 dark:text-primary-400">{department.manager}</strong>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(department)}
              className="p-3 text-primary-700 hover:bg-primary-700/10 rounded-xl transition-colors border border-primary-200/20 hover:border-primary-300"
              title="Modifier"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-neutral-800 dark:text-white uppercase tracking-wide">Coordonnées</h4>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-neutral-600 dark:text-gray-300 bg-neutral-100/50 dark:bg-gray-700/50 p-3 rounded-lg">
                <MapPin className="h-4 w-4 text-primary-600 mr-3 flex-shrink-0" />
                <span>{department.description || 'Aucune description'}</span>
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-gray-300 bg-neutral-100/50 dark:bg-gray-700/50 p-3 rounded-lg">
                <Phone className="h-4 w-4 text-primary-600 mr-3 flex-shrink-0" />
                <span>{department.phone}</span>
              </div>
              <div className="flex items-center text-sm text-neutral-600 dark:text-gray-300 bg-neutral-100/50 dark:bg-gray-700/50 p-3 rounded-lg">
                <Mail className="h-4 w-4 text-primary-600 mr-3 flex-shrink-0" />
                <span>{department.contactEmail}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-neutral-800 dark:text-white uppercase tracking-wide">Ressources</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm bg-neutral-100/50 dark:bg-gray-700/50 p-3 rounded-lg">
                <div className="flex items-center text-neutral-600 dark:text-gray-300">
                  <Users className="h-4 w-4 text-primary-600 mr-3" />
                  <span>Employés</span>
                </div>
                <span className="font-semibold text-neutral-800 dark:text-white">{department.employeeCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm bg-neutral-100/50 dark:bg-gray-700/50 p-3 rounded-lg">
                <div className="flex items-center text-neutral-600 dark:text-gray-300">
                  <FileText className="h-4 w-4 text-primary-600 mr-3" />
                  <span>Budget annuel</span>
                </div>
                <span className="font-semibold text-neutral-800 dark:text-white">
                  {department.budget ? `${department.budget.toLocaleString()} MAD` : 'Non défini'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}