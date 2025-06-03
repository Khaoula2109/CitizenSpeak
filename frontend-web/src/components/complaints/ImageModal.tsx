import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  alt: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageUrl,
  alt,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div 
          className="fixed inset-0 bg-gradient-to-br from-black/80 to-gray-900/90 backdrop-blur-md transition-opacity" 
          onClick={onClose}
        />
                
        <div className="relative max-w-6xl w-full">
          <div className="relative p-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
              <img 
                src={imageUrl}
                alt={alt}
                className="w-full h-auto max-h-[85vh] object-contain bg-gradient-to-br from-gray-100 to-gray-200 
                         dark:from-gray-800 dark:to-gray-700"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
            </div>
            
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 p-3 bg-gradient-to-r from-red-500 to-pink-500 
                       hover:from-red-600 hover:to-pink-600 rounded-2xl text-white 
                       shadow-2xl hover:shadow-red-500/25 transition-all duration-200 
                       border-2 border-white/20 backdrop-blur-sm transform hover:scale-105"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl 
                          border border-white/20 text-white text-sm font-medium shadow-lg">
              <span className="block">📷 Cliquez à l'extérieur pour fermer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};