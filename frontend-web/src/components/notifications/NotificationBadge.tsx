import React, { useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { NotificationsMenu } from './NotificationsMenu';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationBadge: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { unreadCount } = useNotifications();

  const handleClick = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuClose = () => {
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        type="button"
      >
        <Bell className="h-6 w-6" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center min-w-[20px] animate-pulse shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {unreadCount > 0 && (
          <span className="sr-only">{unreadCount} notifications non lues</span>
        )}
      </button>

      <NotificationsMenu 
        isOpen={showMenu}
        onClose={handleMenuClose}
        buttonRef={buttonRef}
      />
    </div>
  );
};