import React from 'react';
import { RoleCard as RoleCardType, UserAccount } from '../../types/accounts';

interface RoleCardProps {
  card: RoleCardType;
  count: number;
  isSelected: boolean;
  onSelect: (role: 'admin' | 'analyst' | 'agent') => void;
}

export function RoleCard({ card, count, isSelected, onSelect }: RoleCardProps) {
  return (
    <div 
      onClick={() => onSelect(card.role)}
      className={`
        group relative cursor-pointer rounded-2xl border-2 transition-all duration-300 transform hover:scale-105
        ${isSelected
          ? 'bg-white dark:bg-gray-800 border-primary-700 shadow-brand-lg' 
          : 'bg-white dark:bg-gray-800 border-neutral-300 dark:border-gray-700 hover:border-primary-500 shadow-lg hover:shadow-xl'
        }
      `}
    >
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl
        ${isSelected 
          ? 'bg-gradient-to-br from-primary-700/5 to-primary-600/10' 
          : 'bg-gradient-to-br from-primary-600/5 to-primary-500/10'
        }
      `} />
      
      <div className="relative p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="p-4 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 bg-brand-gradient">
            <card.icon className="h-8 w-8 text-white" />
          </div>
          <div className="text-right">
            <div className={`
              text-3xl font-bold transition-colors
              ${isSelected ? 'text-primary-700' : 'text-neutral-500 group-hover:text-primary-700'}
            `}>
              {count}
            </div>
            <div className="text-sm text-neutral-500">
              utilisateur{count > 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        <h3 className={`
          text-xl font-bold mb-2 transition-colors
          ${isSelected ? 'text-primary-800 dark:text-primary-300' : 'text-neutral-800 dark:text-white group-hover:text-primary-800'}
        `}>
          {card.title}
        </h3>
        
        <p className={`
          text-sm transition-colors
          ${isSelected ? 'text-primary-700' : 'text-neutral-500 group-hover:text-primary-700'}
        `}>
          {card.description}
        </p>
      </div>

      {isSelected && (
        <div className="absolute top-4 right-4 w-4 h-4 bg-primary-700 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
}