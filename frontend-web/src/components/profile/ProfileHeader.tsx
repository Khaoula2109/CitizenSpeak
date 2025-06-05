import React from 'react';
import { MessageSquare, MapPin } from 'lucide-react';

export function ProfileHeader() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="relative mr-3">
          <MessageSquare className="h-8 w-8 text-primary-600" />
          <MapPin className="h-5 w-5 text-primary-500 absolute -bottom-1 -right-1" />
        </div>
        <h1 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent">
          Mon profil
        </h1>
      </div>
      <p className="text-neutral-500">Gérez vos informations personnelles</p>
    </div>
  );
}