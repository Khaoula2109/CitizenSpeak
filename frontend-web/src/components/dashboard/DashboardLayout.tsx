import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  AlertCircle,
  ClipboardList,
  BarChart2,
  FileText,
  TrendingUp,
  Bell
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const DashboardLayout = () => {
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (user.role || '').toLowerCase();

  const isAgent   = role === 'agent';
  const isAnalyst = role === 'analyst';
  const isAdmin   = role === 'admin';

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord',     path: '/admin/dashboard' },
    { icon: Building2,       label: 'Organismes',          path: '/admin/dashboard/departments' },
    { icon: AlertCircle,     label: 'Plaintes',            path: '/admin/dashboard/complaints' },
    { icon: Users,           label: 'Gestion des comptes', path: '/admin/dashboard/accounts' },
    { icon: Bell,            label: 'Notifications',       path: '/notifications' }
  ];

  const agentMenuItems = [
    { icon: ClipboardList, label: 'Mes plaintes',     path: '/agent/complaints' },
    { icon: Bell,          label: 'Notifications',    path: '/notifications' }
  ];

  const analystMenuItems = [
    { icon: TrendingUp,  label: 'Tableau de bord',   path: '/analyst/dashboard' },
    { icon: Bell,        label: 'Notifications',     path: '/notifications' }
  ];

  const menuItems = isAnalyst
    ? analystMenuItems
    : isAgent
      ? agentMenuItems
      : adminMenuItems;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className={`${isMenuCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out`}>
        <Sidebar
          menuItems={menuItems}
          isCollapsed={isMenuCollapsed}
          onToggle={() => setIsMenuCollapsed(v => !v)}
          isAgent={isAgent}
          isAnalyst={isAnalyst}
          isAdmin={isAdmin}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar isAgent={isAgent} isAnalyst={isAnalyst} isAdmin={isAdmin} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};