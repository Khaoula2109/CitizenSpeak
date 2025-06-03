import React, { useState } from 'react';
import { X, Save, Building2, Users, Phone, Mail, FileText } from 'lucide-react';
import { Department, DepartmentFormData } from '../../types/department';
import { EMPTY_DEPARTMENT_FORM } from '../../constants/departmentConstants';

interface DepartmentFormModalProps {
  isOpen: boolean;
  editingDepartment: Department | null;
  onClose: () => void;
  onSubmit: (formData: DepartmentFormData) => Promise<void>;
}

export function DepartmentFormModal({ isOpen, editingDepartment, onClose, onSubmit }: DepartmentFormModalProps) {
  const [formData, setFormData] = useState<DepartmentFormData>(
    editingDepartment ? {
      name: editingDepartment.name,
      manager: editingDepartment.manager,
      employeeCount: editingDepartment.employeeCount,
      phone: editingDepartment.phone,
      contactEmail: editingDepartment.contactEmail,
      status: editingDepartment.status,
      description: editingDepartment.description ?? '',
      budget: editingDepartment.budget ?? 0
    } : EMPTY_DEPARTMENT_FORM
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 border border-primary-200/20 dark:border-gray-700 overflow-hidden flex flex-col max-h-full">
          <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
            <div className="px-8 py-6 bg-gradient-to-r from-primary-700/5 to-primary-600/5 dark:from-gray-700 dark:to-gray-600 border-b border-primary-200/20 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-3 bg-brand-gradient rounded-xl mr-4 shadow-brand">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {editingDepartment ? 'Modifier le département' : 'Nouveau département'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6 overflow-y-auto flex-grow">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Nom du département</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                  placeholder="Nom du département"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all resize-none bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                  placeholder="Description du département"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Responsable</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.manager}
                    onChange={e => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                    placeholder="Nom du responsable"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      placeholder="07 23 45 67 89"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      placeholder="contact@gmail.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Nombre d'employés</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.employeeCount}
                      onChange={e => setFormData({ ...formData, employeeCount: +e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      placeholder="Nombre d'employés"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Budget annuel</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: +e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      placeholder="Budget en MAD"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Statut</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>

            <div className="px-8 py-6 bg-gradient-to-r from-neutral-100 to-white dark:from-gray-700 dark:to-gray-600 border-t border-primary-200/20 dark:border-gray-700 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl text-neutral-500 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-gray-700 hover:text-neutral-800 dark:hover:text-gray-300 font-semibold transition-all duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-brand-gradient hover:from-primary-800 hover:to-primary-700 text-white rounded-xl font-semibold shadow-brand hover:shadow-brand-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
              >
                <Save className="mr-2 h-5 w-5" />
                {editingDepartment ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}