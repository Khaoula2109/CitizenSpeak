import React from 'react';
import { X, User, Mail, Phone, Lock, Save } from 'lucide-react';
import { NewUserForm, Organization, Department } from '../../types/accounts';

interface NewUserModalProps {
  show: boolean;
  selectedRole: 'admin' | 'analyst' | 'agent' | null;
  newUser: NewUserForm;
  formErrors: Partial<NewUserForm>;
  organizations: Organization[];
  departments: Department[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (updates: Partial<NewUserForm>) => void;
  onLoadDepartments: (orgId: string) => void;
}

export function NewUserModal({
  show,
  selectedRole,
  newUser,
  formErrors,
  organizations,
  departments,
  onClose,
  onSubmit,
  onChange,
  onLoadDepartments
}: NewUserModalProps) {
  if (!show || !selectedRole) return null;

  const getRoleTitle = () => {
    switch (selectedRole) {
      case 'admin': return 'Nouvel Administrateur';
      case 'analyst': return 'Nouvel Analyste';
      case 'agent': return 'Nouvel Agent Communal';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 border border-primary-200/20 dark:border-gray-700">
          <form onSubmit={onSubmit} className="divide-y divide-primary-200/10">
            <div className="px-8 py-6 bg-gradient-to-r from-primary-700/5 to-primary-600/5 dark:from-gray-700 dark:to-gray-600 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-3 bg-brand-gradient rounded-xl mr-4 shadow-brand">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {getRoleTitle()}
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={onClose}
                  className="text-neutral-500 hover:text-neutral-800 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-8 py-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Nom Complet</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={e => onChange({ fullName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                />
                {formErrors.fullName && <p className="text-error-600 dark:text-error-400 text-sm mt-1">{formErrors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={e => onChange({ email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                    />
                  </div>
                  {formErrors.email && <p className="text-error-600 dark:text-error-400 text-sm mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                    <input
                      type="tel"
                      value={newUser.phone}
                      onChange={e => onChange({ phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                    />
                  </div>
                  {formErrors.phone && <p className="text-error-600 dark:text-error-400 text-sm mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              {newUser.role === 'agent' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Service</label>
                    <input
                      type="text"
                      value={newUser.service}
                      onChange={e => onChange({ service: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                    />
                    {formErrors.service && <p className="text-error-600 dark:text-error-400 text-sm mt-1">{formErrors.service}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Organisme</label>
                      <select
                        value={newUser.organizationId}
                        onChange={e => {
                          const orgId = e.target.value;
                          onChange({ organizationId: orgId, departmentId: '' });
                          onLoadDepartments(orgId);
                        }}
                        className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                      >
                        <option value="">— Sélectionner un organisme —</option>
                        {organizations.map(o => (
                          <option key={o.organizationId || o.departmentId} value={o.organizationId || o.departmentId}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.organizationId && <p className="text-error-600 dark:text-error-400 text-sm mt-1">{formErrors.organizationId}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Département</label>
                      <select
                        value={newUser.departmentId}
                        onChange={e => onChange({ departmentId: e.target.value })}
                        disabled={!newUser.organizationId}
                        className="w-full px-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">— Sélectionner un département —</option>
                        {departments.map(d => (
                          <option key={d.organizationId } value={d.organizationId }>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.departmentId && <p className="text-error-600 dark:text-error-400 text-sm mt-1">{formErrors.departmentId}</p>}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={e => onChange({ password: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                    />
                  </div>
                  {formErrors.password && <p className="text-error-600 dark:text-error-400 text-sm mt-1">{formErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">Confirmation</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500 dark:text-gray-400" />
                    <input
                      type="password"
                      value={newUser.confirmPassword}
                      onChange={e => onChange({ confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-neutral-300 dark:border-gray-600 rounded-xl focus:border-primary-700 focus:bg-white dark:focus:bg-gray-700 transition-all bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white"
                    />
                  </div>
                  {formErrors.confirmPassword && <p className="text-error-600 dark:text-error-400 text-sm mt-1">{formErrors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-gradient-to-r from-neutral-100 to-white dark:from-gray-700 dark:to-gray-600 rounded-b-2xl flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-3 border-2 border-neutral-300 rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 font-semibold transition-all duration-200"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-brand-gradient hover:from-primary-800 hover:to-primary-700 text-white rounded-xl font-semibold shadow-brand hover:shadow-brand-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
              >
                <Save className="mr-2 h-5 w-5" /> 
                Créer l'utilisateur
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}