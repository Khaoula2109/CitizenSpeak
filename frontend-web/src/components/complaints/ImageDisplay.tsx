import React, { useState } from 'react';
import { Loader2, Camera } from 'lucide-react';

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  className = '',
  onLoad,
  onError
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    if (onError) onError();
  };

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center 
                     bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600
                     rounded-2xl border-2 border-gray-200 dark:border-gray-600`}>
        <div className="flex flex-col items-center space-y-3">
          <div className="p-4 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                        border border-gray-200 dark:border-gray-600 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Chargement de l'image...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex flex-col items-center justify-center 
                     bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20
                     rounded-2xl border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400`}>
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="p-4 rounded-full bg-gradient-to-br from-red-100 to-orange-100 
                        dark:from-red-800 dark:to-orange-800 border border-red-200 dark:border-red-600">
            <Camera className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-center">
            <span className="text-sm font-semibold text-red-700 dark:text-red-300 block">
              Image non disponible
            </span>
            <span className="text-xs text-red-500 dark:text-red-400 mt-1 block">
              Impossible de charger l'image
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src}
      alt={alt}
      className={`${className} rounded-2xl border-2 border-gray-200 dark:border-gray-600 
                 shadow-lg hover:shadow-xl transition-all duration-200`}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};