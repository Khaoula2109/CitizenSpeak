import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageUrl,
  onClose
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
        
        <div className="relative max-w-4xl w-full">
          <div className="relative">
            <img 
              src={imageUrl} 
              alt="Détail de la plainte"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-3 bg-black/70 backdrop-blur-sm rounded-xl 
                       text-white hover:bg-black/80 transition-colors shadow-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};