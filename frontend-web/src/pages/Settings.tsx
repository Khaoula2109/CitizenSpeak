import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Building2, Camera, Bell, Moon, Globe2 } from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  language: 'fr' | 'en';
  notifications: boolean;
  darkMode: boolean;
}

const initialProfile: UserProfile = {
  fullName: 'Admin User',
  email: 'admin@example.com',
  phone: '+33 6 12 34 56 78',
  department: 'Administration',
  role: 'Administrateur',
  language: 'fr',
  notifications: true,
  darkMode: false,
};

export function Settings() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="absolute -bottom-12 left-8 flex items-end space-x-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-white p-1">
                <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="pb-4">
              <h1 className="text-xl font-bold text-white">{profile.fullName}</h1>
              <p className="text-blue-100">{profile.role}</p>
            </div>
          </div>
        </div>

        <div className="mt-16 px-8 border-b border-gray-100">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'profile', label: 'Profil', icon: User },
              { id: 'security', label: 'Sécurité', icon: Lock },
              { id: 'preferences', label: 'Préférences', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`
                    flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors
                    ${isActive 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Nom complet</span>
                    <div className="mt-1 relative rounded-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        disabled={!isEditing}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                                 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    <div className="mt-1 relative rounded-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                                 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Téléphone</span>
                    <div className="mt-1 relative rounded-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg
                                 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                                 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700">Département</span>
                    <div className="mt-1 relative rounded-lg">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profile.department}
                        disabled
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                  </label>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Préférences rapides</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600">Notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.notifications}
                            onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Globe2 className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600">Langue</span>
                        </div>
                        <select
                          value={profile.language}
                          onChange={(e) => setProfile({ ...profile, language: e.target.value as 'fr' | 'en' })}
                          className="block rounded-lg border border-gray-200 text-sm"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Moon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600">Mode sombre</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={profile.darkMode}
                            onChange={(e) => setProfile({ ...profile, darkMode: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Enregistrer
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Modifier
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Sécurité du compte</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  Cette section sera bientôt disponible. Vous pourrez y gérer vos paramètres de sécurité.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Préférences</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  Cette section sera bientôt disponible. Vous pourrez y personnaliser votre expérience.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}