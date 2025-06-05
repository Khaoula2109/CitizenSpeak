import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, MessageSquare, MapPin } from 'lucide-react';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface SidebarProps {
  menuItems:   MenuItem[];
  isCollapsed: boolean;
  onToggle:    () => void;
  isAgent?:    boolean;
  isAnalyst?:  boolean;
  isAdmin?:    boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  menuItems,
  isCollapsed,
  onToggle,
  isAgent,
  isAnalyst,
  isAdmin
}) => {
  const location = useLocation();
  const showProfile = isAgent || isAnalyst || isAdmin;

  return (
    <div className={`h-full bg-white dark:bg-gray-800 shadow-lg border-r border-[#d6a861]/20 dark:border-gray-700 relative ${
      isCollapsed ? 'w-20' : 'w-64'
    } transition-all duration-300 ease-in-out`}>
      <button
        onClick={onToggle}
        className="absolute -right-3 top-12 bg-white dark:bg-gray-800 rounded-full p-1.5 
                   border border-[#d6a861]/30 dark:border-gray-600
                   hover:bg-[#F5F5F5] dark:hover:bg-gray-700 transition-colors shadow-sm z-50"
      >
        {isCollapsed
          ? <ChevronRight className="h-4 w-4 text-[#757575] dark:text-gray-400" />
          : <ChevronLeft  className="h-4 w-4 text-[#757575] dark:text-gray-400" />
        }
      </button>

<div className="h-16 flex items-center justify-center border-b border-[#d6a861]/20 dark:border-gray-700">
  {!isCollapsed ? (
    <div className="flex items-center space-x-3 cursor-default"> 
      <div className="relative">
        <MessageSquare className="h-6 w-6 text-[#bc7404]" />
        <MapPin className="h-4 w-4 text-[#d6a861] absolute -bottom-1 -right-1" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-[#6a2202] via-[#844c2c] to-[#bc7404] 
                      bg-clip-text text-transparent">
        CitizenSpeak
      </span>
    </div>
  ) : (
    <div className="relative">
      <MessageSquare className="h-6 w-6 text-[#bc7404]" />
      <MapPin className="h-3 w-3 text-[#d6a861] absolute -bottom-1 -right-1" />
    </div>
  )}
</div>

      <nav className="mt-6 px-3">
        {showProfile && (
          <Link
            to="/user/profile"
            className={`
              flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-xl transition-all duration-200
              ${location.pathname === '/user/profile'
                ? 'bg-gradient-to-r from-[#844c2c]/10 to-[#bc7404]/10 text-[#844c2c] dark:text-[#d6a861] border border-[#d6a861]/20 dark:border-[#844c2c]/30'
                : 'text-[#757575] dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-gray-700/50 hover:text-[#333333] dark:hover:text-white'}
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Profil' : undefined}
          >
            <User className={`h-5 w-5 ${!isCollapsed && 'mr-3'} ${
              location.pathname === '/user/profile' ? 'text-[#844c2c] dark:text-[#d6a861]' : 'text-[#757575] dark:text-gray-400'
            }`} />
            <span className={`transition-all duration-200 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              Profil
            </span>
          </Link>
        )}

        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={idx}
              to={item.path}
              className={`
                flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-xl transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-[#844c2c]/10 to-[#bc7404]/10 text-[#844c2c] dark:text-[#d6a861] border border-[#d6a861]/20 dark:border-[#844c2c]/30'
                  : 'text-[#757575] dark:text-gray-300 hover:bg-[#F5F5F5] dark:hover:bg-gray-700/50 hover:text-[#333333] dark:hover:text-white'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 ${!isCollapsed && 'mr-3'} ${
                isActive ? 'text-[#844c2c] dark:text-[#d6a861]' : 'text-[#757575] dark:text-gray-400'
              }`} />
              <span className={`transition-all duration-200 ${
                isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};