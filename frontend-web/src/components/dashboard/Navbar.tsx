import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { NotificationsMenu } from './NotificationsMenu';
import { useTheme } from '../../context/ThemeContext';

import { useNotifications } from '../../context/NotificationContext';

interface NavbarProps {
  isAgent?: boolean;
  isAnalyst?: boolean;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAgent = false,
  isAnalyst = false,
  isAdmin = false
}) => {
  const [showProfileMenu, setShowProfileMenu]     = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef      = useRef<HTMLButtonElement>(null);
  const profileMenuRef        = useRef<HTMLDivElement>(null);
  const navigate              = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      navigate('/login', { replace: true });

      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', () => {
        window.history.pushState(null, '', window.location.href);
      });
    } catch (err) {
      console.error('Erreur lors du logout :', err);
    }
  };

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : {};
  });

  useEffect(() => {
    if (!user.fullName) {
      api.get<{
        fullName:       string;
        email:          string;
        phone:          string;
        role:           string;
        photo?:         string;
        departmentName: string;
      }>('/user/profile')
        .then(res => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(console.error);
    }
  }, [user.fullName]);

  const userName = user.fullName || 'Utilisateur';

  const roleSubtext = isAnalyst
    ? 'Analyste'
    : isAgent
      ? 'Agent Communal'
      : isAdmin
        ? 'Admin'
        : '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-[#d6a861]/20 dark:border-gray-700 shadow-sm relative z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          

          <div className="flex items-center ml-auto space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-colors group">
              <div className="bg-gradient-to-br from-[#F5F5F5] to-white dark:from-gray-700 dark:to-gray-600
                               rounded-lg p-2 shadow-sm group-hover:shadow-md transition-all duration-300">
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 text-[#844c2c]"/>
                ) : (
                  <Sun className="h-4 w-4 text-[#d6a861]"/>
                )}
              </div>
            </button>

            <div className="relative">
              <button
                ref={notificationButtonRef}
                onClick={() => setShowNotifications(v => !v)}
                className="p-2 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-colors group"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
              >
                <div className="bg-gradient-to-br from-[#F5F5F5] to-white dark:from-gray-700 dark:to-gray-600
                                 rounded-lg p-2 shadow-sm group-hover:shadow-md transition-all duration-300 relative">
                  <Bell className="h-4 w-4 text-[#844c2c] dark:text-[#d6a861]"/>
                  
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-[#bc7404] 
                                       ring-2 ring-white dark:ring-gray-800"/>
                      
                      <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold 
                                       rounded-full flex items-center justify-center min-w-[20px] animate-pulse shadow-lg
                                       ring-2 ring-white dark:ring-gray-800">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    </>
                  )}
                  
                  
                </div>
              </button>
              
              <NotificationsMenu
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                buttonRef={notificationButtonRef}
              />
            </div>

            <div className="relative z-[9999]">
              <button
                ref={profileButtonRef}
                onClick={() => setShowProfileMenu(v => !v)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="relative">
                  <div className="bg-gradient-to-br from-[#844c2c] to-[#bc7404] h-8 w-8 rounded-lg flex items-center justify-center
                                   shadow-sm group-hover:shadow-md transition-all duration-300">
                    <User className="h-4 w-4 text-white"/>
                  </div>
                </div>
                <span className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-[#333333] dark:text-white">
                    {userName}
                  </span>
                  <span className="text-xs text-[#757575] dark:text-gray-400">
                    {roleSubtext}
                  </span>
                </span>
              </button>

              {showProfileMenu && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 mt-2 w-48 rounded-xl py-2 bg-white dark:bg-gray-800 
                            border border-[#d6a861]/20 dark:border-gray-700 backdrop-blur-sm
                            shadow-2xl z-[99999] ring-1 ring-black ring-opacity-5"
                  style={{ 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                    zIndex: 99999 
                  }}
                >
                  
                  <hr className="my-1 border-[#d6a861]/20 dark:border-gray-700" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-[#333333] dark:text-white
                              hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors relative z-[99999]
                              font-medium group"
                    style={{ zIndex: 99999 }}
                  >
                    <LogOut className="h-4 w-4 mr-2 text-red-500 group-hover:text-red-600 transition-colors"/>
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};