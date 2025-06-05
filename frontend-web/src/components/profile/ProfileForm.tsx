import React from 'react';
import { UserIcon, Mail, Phone, Building2 } from 'lucide-react';
import { Profile } from '../../types/profile';

interface ProfileFormProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: () => void;
  onCancel: () => void;
  onOpenPasswordModal: () => void;
}

export function ProfileForm({
  profile,
  setProfile,
  isEditing,
  onSubmit,
  onEdit,
  onCancel,
  onOpenPasswordModal
}: ProfileFormProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-primary-200/20 p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">
          Informations personnelles
        </h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-neutral-500"/>
                </div>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                  disabled={!isEditing}
                  className="pl-12 w-full rounded-xl border-2 border-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-700/50 focus:border-primary-700 transition-all disabled:bg-neutral-100 dark:disabled:bg-gray-800 disabled:text-neutral-500 dark:disabled:text-gray-400 py-3"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500"/>
                </div>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="pl-12 w-full rounded-xl border-2 border-neutral-300 dark:border-gray-600 bg-neutral-100 dark:bg-gray-800 text-neutral-500 dark:text-gray-400 py-3"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-neutral-500"/>
                </div>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                  className="pl-12 w-full rounded-xl border-2 border-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-700/50 focus:border-primary-700 transition-all disabled:bg-neutral-100 dark:disabled:bg-gray-800 disabled:text-neutral-500 dark:disabled:text-gray-400 py-3"
                />
              </div>
            </div>
          </div>

          {profile.role.toLowerCase() === 'agent' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                  Département
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-neutral-500"/>
                  </div>
                  <input
                    type="text"
                    value={profile.departmentName}
                    disabled
                    className="pl-12 w-full rounded-xl border-2 border-neutral-300 dark:border-gray-600 bg-neutral-100 dark:bg-gray-800 text-neutral-500 dark:text-gray-400 py-3"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Le département ne peut pas être modifié
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                  Service
                </label>
                <input
                  type="text"
                  value={profile.service}
                  onChange={e => setProfile({ ...profile, service: e.target.value })}
                  disabled={!isEditing}
                  className="w-full rounded-xl border-2 border-neutral-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-700/50 focus:border-primary-700 transition-all disabled:bg-neutral-100 dark:disabled:bg-gray-800 disabled:text-neutral-500 dark:disabled:text-gray-400 py-3 px-4"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200 dark:border-gray-700">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border-2 border-neutral-300 dark:border-gray-600 text-neutral-700 dark:text-gray-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-brand-gradient text-white rounded-xl hover:from-primary-800 hover:to-primary-700 transition-all shadow-brand font-medium"
              >
                Enregistrer
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="px-6 py-3 bg-brand-gradient text-white rounded-xl hover:from-primary-800 hover:to-primary-700 transition-all shadow-brand font-medium"
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={onOpenPasswordModal}
                className="px-6 py-3 bg-neutral-200 dark:bg-gray-700 text-neutral-800 dark:text-gray-200 rounded-xl hover:bg-neutral-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Changer mot de passe
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}