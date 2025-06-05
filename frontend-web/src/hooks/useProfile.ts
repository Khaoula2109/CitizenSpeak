import { useState, useEffect, useMemo } from 'react';
import { Profile, emptyProfile } from '../types/profile';
import api from '../utils/api';

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    api.get<Profile>('/user/profile')
      .then(res => setProfile(res.data))
      .catch(err => console.error('Erreur chargement profil :', err))
      .finally(() => setLoading(false));
  }, []);

  const initials = useMemo(() => {
    const parts = profile.fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase();
  }, [profile.fullName]);

  const updateProfile = (payload: any) => {
    api.put('/user/update-profile', payload)
      .then(() => setProfile(prev => ({ ...prev, ...payload })))
      .catch(err => console.error('Erreur mise à jour profil :', err));
  };

  const uploadPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 5MB.');
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.post('/user/upload-profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      let url: string = response.data.photoUrl;
      if (!url.startsWith('/')) url = '/' + url;
      setProfile(prev => ({ ...prev, photo: url }));
    } catch (err: any) {
      console.error('Erreur upload photo :', err);
      alert('Erreur lors du téléchargement de la photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return {
    profile,
    setProfile,
    loading,
    isEditing,
    setIsEditing,
    uploadingPhoto,
    initials,
    updateProfile,
    uploadPhoto
  };
}