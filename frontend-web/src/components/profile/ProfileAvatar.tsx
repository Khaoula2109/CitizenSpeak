import React from 'react';
import { Camera } from 'lucide-react';

interface ProfileAvatarProps {
  photo?: string;
  initials: string;
  uploadingPhoto: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileAvatar({ photo, initials, uploadingPhoto, onPhotoUpload }: ProfileAvatarProps) {
  return (
    <div className="relative">
      <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-brand">
        <div className="h-full w-full rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
          {uploadingPhoto
            ? <div className="h-12 w-12 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"/>
            : photo
              ? <img src={photo} alt="Avatar" className="h-full w-full rounded-xl object-cover" />
              : <span className="text-2xl font-bold text-primary-700">{initials}</span>
          }
        </div>
      </div>
      <input
        type="file"
        id="photo-upload"
        accept="image/*"
        onChange={onPhotoUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => document.getElementById('photo-upload')?.click()}
        disabled={uploadingPhoto}
        className="absolute bottom-0 right-0 p-1.5 rounded-lg bg-primary-700 text-white hover:bg-primary-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        title="Changer la photo de profil"
      >
        <Camera className="h-4 w-4"/>
      </button>
    </div>
  );
}