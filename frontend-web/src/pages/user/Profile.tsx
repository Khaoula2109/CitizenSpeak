import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { usePasswordChange } from '../../hooks/usePasswordChange';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileAvatar } from '../../components/profile/ProfileAvatar';
import { ProfileInfo } from '../../components/profile/ProfileInfo';
import { ProfileForm } from '../../components/profile/ProfileForm';
import { PasswordModal } from '../../components/profile/PasswordModal';
import { LoadingSpinner } from '../../components/profile/LoadingSpinner';

export function Profile() {
  const {
    profile,
    setProfile,
    loading,
    isEditing,
    setIsEditing,
    uploadingPhoto,
    initials,
    updateProfile,
    uploadPhoto
  } = useProfile();

  const {
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
    closePasswordModal,
    handlePasswordChange
  } = usePasswordChange();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    const payload: any = {
      fullName: profile.fullName,
      phone: profile.phone,
      service: profile.service,
      departmentId: profile.departmentId
    };
    if (profile.photo) payload.photo = profile.photo;
    updateProfile(payload);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePasswordChange(profile.email);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <ProfileHeader />

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-primary-200/20 overflow-hidden">
        <div className="relative h-32 bg-brand-gradient" />
        <div className="px-8 pb-6 pt-4">
          <div className="flex items-start space-x-4 -mt-14">
            <ProfileAvatar
              photo={profile.photo}
              initials={initials}
              uploadingPhoto={uploadingPhoto}
              onPhotoUpload={handlePhotoUpload}
            />
            <ProfileInfo profile={profile} />
          </div>
        </div>
      </div>

      <ProfileForm
        profile={profile}
        setProfile={setProfile}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onOpenPasswordModal={() => setShowPwdModal(true)}
      />

      <PasswordModal
        showPwdModal={showPwdModal}
        currentPwd={currentPwd}
        setCurrentPwd={setCurrentPwd}
        newPwd={newPwd}
        setNewPwd={setNewPwd}
        confirmNewPwd={confirmNewPwd}
        setConfirmNewPwd={setConfirmNewPwd}
        pwdError={pwdError}
        pwdSuccess={pwdSuccess}
        pwdLoading={pwdLoading}
        onSubmit={handlePasswordSubmit}
        onClose={closePasswordModal}
      />
    </div>
  );
}