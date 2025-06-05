import React from 'react';
import {
  Building2, User, Phone, Mail, MapPin, FileText,
  X, Save
} from 'lucide-react';

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

interface OrganizationFormData {
  name: string;
  description: string;
  responsible: string;
  phone: string;
  email: string;
  annualBudget: number;
  headquartersAddress: string;
  active: boolean;
}

interface OrganizationFormModalProps {
  show: boolean;
  editingOrg: Organization | null;
  form: OrganizationFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFormChange: (form: OrganizationFormData) => void;
}

export function OrganizationFormModal({
  show,
  editingOrg,
  form,
  onClose,
  onSubmit,
  onFormChange
}: OrganizationFormModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 border border-primary-200/20 dark:border-gray-700 overflow-hidden flex flex-col max-h-full">
          <form onSubmit={onSubmit} className="flex flex-col h-full min-h-0">
            <div className="px-8 py-6 bg-gradient-to-r from-primary-700/5 to-primary-600/5 dark:from-gray-700 dark:to-gray-600 border-b border-primary-200/20 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-3 bg-brand-gradient rounded-xl mr-4 shadow-brand">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {editingOrg ? 'Modifier l\'organisme' : 'Nouvel organisme'}
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
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Nom de l'organisme</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => onFormChange({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                  placeholder="Nom de l'organisme"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => onFormChange({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all resize-none bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                  placeholder="Description de l'organisme"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Responsable</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.responsible}
                    onChange={e => onFormChange({ ...form, responsible: e.target.value })}
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
                      value={form.phone}
                      onChange={e => onFormChange({ ...form, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      placeholder="06 23 45 67 89"
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
                      value={form.email}
                      onChange={e => onFormChange({ ...form, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      placeholder="contact@gmail.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Adresse du siège</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.headquartersAddress}
                    onChange={e => onFormChange({ ...form, headquartersAddress: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                    placeholder="Adresse complète du siège"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Budget annuel</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                    <input
                      type="number"
                      required
                      value={form.annualBudget}
                      onChange={e => onFormChange({ ...form, annualBudget: +e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      placeholder="Budget en MAD"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Statut</label>
                  <select
                    value={form.active ? 'active' : 'inactive'}
                    onChange={e => onFormChange({ ...form, active: e.target.value === 'active' })}
                    className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
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
                {editingOrg ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}