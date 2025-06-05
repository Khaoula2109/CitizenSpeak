import React from 'react';
import { X } from 'lucide-react';

interface PasswordModalProps {
  showPwdModal: boolean;
  currentPwd: string;
  setCurrentPwd: (pwd: string) => void;
  newPwd: string;
  setNewPwd: (pwd: string) => void;
  confirmNewPwd: string;
  setConfirmNewPwd: (pwd: string) => void;
  pwdError: string | null;
  pwdSuccess: boolean;
  pwdLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function PasswordModal({
  showPwdModal,
  currentPwd,
  setCurrentPwd,
  newPwd,
  setNewPwd,
  confirmNewPwd,
  setConfirmNewPwd,
  pwdError,
  pwdSuccess,
  pwdLoading,
  onSubmit,
  onClose
}: PasswordModalProps) {
  if (!showPwdModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-primary-200/20 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-700/5 to-primary-600/5 p-6 border-b border-primary-200/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-gray-100">
              Changer mon mot de passe
            </h2>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-gray-700"
              disabled={pwdLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            {pwdError && (
              <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl">
                <p className="text-sm text-error-600 dark:text-error-400 font-medium">{pwdError}</p>
              </div>
            )}
            {pwdSuccess && (
              <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl">
                <p className="text-sm text-success-600 dark:text-success-400 font-medium">
                  Mot de passe mis à jour avec succès !
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                Mot de passe actuel <span className="text-error-500">*</span>
              </label>
              <input
                type="password"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                required
                disabled={pwdLoading}
                className="w-full rounded-xl border-2 border-neutral-300 dark:border-gray-600 bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white py-3 px-4 focus:ring-2 focus:ring-primary-700/50 focus:border-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Entrez votre mot de passe actuel"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                Nouveau mot de passe <span className="text-error-500">*</span>
              </label>
              <input
                type="password"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                required
                disabled={pwdLoading}
                minLength={6}
                className="w-full rounded-xl border-2 border-neutral-300 dark:border-gray-600 bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white py-3 px-4 focus:ring-2 focus:ring-primary-700/50 focus:border-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Au moins 6 caractères"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-800 dark:text-gray-300 mb-2">
                Confirmer le nouveau mot de passe <span className="text-error-500">*</span>
              </label>
              <input
                type="password"
                value={confirmNewPwd}
                onChange={e => setConfirmNewPwd(e.target.value)}
                required
                disabled={pwdLoading}
                className="w-full rounded-xl border-2 border-neutral-300 dark:border-gray-600 bg-neutral-100 dark:bg-gray-700 text-neutral-800 dark:text-white py-3 px-4 focus:ring-2 focus:ring-primary-700/50 focus:border-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Répétez le nouveau mot de passe"
              />
            </div>
          </form>
        </div>

        <div className="bg-gradient-to-r from-neutral-100 to-white dark:from-gray-800 dark:to-gray-700 p-6 border-t border-neutral-200 dark:border-gray-700">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={pwdLoading}
              className="px-6 py-3 border-2 border-neutral-300 dark:border-gray-600 text-neutral-700 dark:text-gray-300 rounded-xl hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={onSubmit}
              disabled={pwdLoading}
              className="px-6 py-3 bg-brand-gradient text-white rounded-xl hover:from-primary-800 hover:to-primary-700 transition-all shadow-brand disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
            >
              {pwdLoading && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              )}
              <span>{pwdLoading ? 'Mise à jour...' : 'Mettre à jour'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}