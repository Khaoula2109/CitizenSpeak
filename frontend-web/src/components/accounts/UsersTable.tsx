import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { UserAccount } from '../../types/accounts';

interface UsersTableProps {
  users: UserAccount[];
  selectedRole: 'admin' | 'analyst' | 'agent' | null;
  onToggleStatus: (user: UserAccount) => void;
}

export function UsersTable({ users, selectedRole, onToggleStatus }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-neutral-100 to-white dark:from-gray-800 dark:to-gray-700">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
            {selectedRole === 'agent' && (
              <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 dark:text-gray-400 uppercase tracking-wider">Service / Département</th>
            )}
            <th className="px-6 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-neutral-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-primary-200/10 dark:divide-gray-700">
          {users.map((u, index) => (
            <tr key={u.id} className={`hover:bg-gradient-to-r hover:from-primary-700/5 hover:to-primary-600/5 transition-all duration-200 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-neutral-100/30 dark:bg-gray-700/50'}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
                    {u.photo
                      ? <img
                          src={u.photo}
                          alt={`Avatar de ${u.fullName}`}
                          className="h-full w-full object-cover rounded-xl"
                        />
                      : <span className="text-sm font-bold text-white">
                          {u.initials}
                        </span>
                    }
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-semibold text-neutral-800 dark:text-white">
                      {u.fullName}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-neutral-800 dark:text-white space-y-1">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-neutral-500 dark:text-gray-400 mr-2"/>  
                    <span>{u.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-neutral-500 dark:text-gray-400 mr-2"/>
                    <span>{u.phone}</span>
                  </div>
                </div>
              </td>
              {selectedRole === 'agent' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-800 dark:text-white font-medium">
                    <div>{u.service}</div>
                    <div className="text-neutral-500 dark:text-gray-400 text-xs">{u.departmentName}</div>
                  </div>
                </td>
              )}
              <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  u.active 
                    ? 'bg-success-100 text-success-800 border border-success-200' 
                    : 'bg-error-100 text-error-800 border border-error-200'
                }`}>
                  {u.active ? '✓ Actif' : '✗ Inactif'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={u.active}
                      onChange={() => onToggleStatus(u)}
                      className="sr-only peer"
                    />
                    <div className={`
                      relative w-11 h-6 rounded-full transition-colors duration-200 peer
                      ${u.active 
                        ? 'bg-gradient-to-r from-secondary-600 to-primary-600' 
                        : 'bg-neutral-300'
                      }
                    `}>
                      <div className={`
                        absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-200
                        ${u.active ? 'translate-x-5' : 'translate-x-0'}
                      `} />
                    </div>
                  </label>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}