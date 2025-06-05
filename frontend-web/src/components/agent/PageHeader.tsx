import React from 'react';
import { MessageSquare, MapPin } from 'lucide-react';

export const PageHeader: React.FC = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="relative mr-3">
          <MessageSquare className="h-8 w-8 text-primary-600" />
          <MapPin className="h-5 w-5 text-primary-500 absolute -bottom-1 -right-1 animate-bounce" />
        </div>
        <h1 className="text-4xl font-bold bg-brand-gradient bg-clip-text text-transparent">
          Mes plaintes assignées
        </h1>
      </div>
      <p className="text-neutral-500 text-lg">Gestion et suivi des plaintes qui vous sont attribuées</p>
    </div>
  );
};