import { useState } from 'react';
import api from '../utils/api';

export function usePasswordChange() {
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const resetPasswordModal = () => {
    setCurrentPwd('');
    setNewPwd('');
    setConfirmNewPwd('');
    setPwdError(null);
    setPwdSuccess(false);
    setPwdLoading(false);
  };

  const closePasswordModal = () => {
    setShowPwdModal(false);
    setTimeout(resetPasswordModal, 300);
  };

  const handlePasswordChange = async (email: string) => {
    setPwdError(null);
    setPwdSuccess(false);
    setPwdLoading(true);

    if (!currentPwd.trim()) {
      setPwdError('Le mot de passe actuel est requis.');
      setPwdLoading(false);
      return;
    }

    if (!newPwd.trim()) {
      setPwdError('Le nouveau mot de passe est requis.');
      setPwdLoading(false);
      return;
    }

    if (newPwd.length < 6) {
      setPwdError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      setPwdLoading(false);
      return;
    }

    if (newPwd !== confirmNewPwd) {
      setPwdError('Les nouveaux mots de passe ne correspondent pas.');
      setPwdLoading(false);
      return;
    }

    if (currentPwd === newPwd) {
      setPwdError('Le nouveau mot de passe doit être différent de l\'actuel.');
      setPwdLoading(false);
      return;
    }

    try {
      await api.post('/user/change-password', {
        email: email,
        currentPassword: currentPwd,
        newPassword: newPwd
      });

      setPwdSuccess(true);
      setTimeout(() => {
        closePasswordModal();
      }, 1500);

    } catch (err: any) {
      console.error('Erreur changement mot de passe:', err);

      const errorMessage = err.response?.data?.message || err.response?.data || '';
      const errorString = typeof errorMessage === 'string' ? errorMessage.toLowerCase() : '';

      if (err.response?.status === 400 ||
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          errorString.includes('incorrect') ||
          errorString.includes('invalid') ||
          errorString.includes('wrong') ||
          errorString.includes('mauvais') ||
          errorString.includes('password') ||
          errorString.includes('mot de passe') ||
          errorString.includes('unauthorized') ||
          errorString.includes('authentication') ||
          errorString.includes('authentification')) {
        setPwdError('Le mot de passe actuel est incorrect.');
      } else if (err.response?.status === 422) {
        setPwdError('Les données fournies ne sont pas valides.');
      } else if (err.response?.status >= 500) {
        setPwdError('Erreur serveur. Veuillez réessayer plus tard.');
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setPwdError('Erreur de connexion. Vérifiez votre connexion internet.');
      } else {
        setPwdError('Le mot de passe actuel est incorrect.');
      }
    } finally {
      setPwdLoading(false);
    }
  };

  return {
    showPwdModal,
    setShowPwdModal,
    currentPwd,
    setCurrentPwd,
    newPwd,
    setNewPwd,
    confirmNewPwd,
    setConfirmNewPwd,
    pwdError,
    pwdSuccess,
    pwdLoading,
    resetPasswordModal,
    closePasswordModal,
    handlePasswordChange
  };
}