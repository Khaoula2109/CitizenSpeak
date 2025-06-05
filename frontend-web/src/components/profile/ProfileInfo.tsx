import React from 'react';
import { Building2, UserIcon } from 'lucide-react';
import { Profile } from '../../types/profile';

interface ProfileInfoProps {
  profile: Profile;
}

export function ProfileInfo({ profile }: ProfileInfoProps) {
  return (
    <div className="pt-8">
      <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">{profile.fullName}</h2>
      <div className="flex items-center space-x-2 mt-1">
        <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize">
          {profile.role}
        </span>
      </div>
      {profile.role.toLowerCase() === 'agent' && (
        <div className="mt-3 space-y-1">
          <p className="text-sm text-neutral-600 dark:text-gray-400 flex items-center">
            <Building2 className="h-4 w-4 mr-2 text-primary-600" />
            <span className="font-medium">Département :</span>
            <span className="ml-1">{profile.departmentName}</span>
          </p>
          <p className="text-sm text-neutral-600 dark:text-gray-400 flex items-center">
            <UserIcon className="h-4 w-4 mr-2 text-primary-600" />
            <span className="font-medium">Service :</span>
            <span className="ml-1">{profile.service}</span>
          </p>
        </div>
      )}
    </div>
  );
}