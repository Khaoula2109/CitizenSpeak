import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Building2,
  Target,
  UserCheck,
  Activity
} from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalComplaints?: number;
    resolvedComplaints?: number;
    pendingComplaints?: number;
    activeAgents?: number;
    activeOrganizations?: number;
    resolutionRate?: number;
    activeInterventions?: number;
    totalCitizens?: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statsCards = [
    {
      title: 'Total des plaintes',
      value: stats.totalComplaints || 0,
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/50'
    },
    {
      title: 'Plaintes résolues',
      value: stats.resolvedComplaints || 0,
      icon: CheckCircle2,
      color: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-200 dark:bg-amber-800/50'
    },
    {
      title: 'En attente',
      value: stats.pendingComplaints || 0,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50'
    },
    {
      title: 'Agents actifs',
      value: stats.activeAgents || 0,
      icon: Users,
      color: 'text-amber-800 dark:text-amber-200',
      bgColor: 'bg-amber-50 dark:bg-amber-900/30'
    },
    {
      title: 'Organismes',
      value: stats.activeOrganizations || 0,
      icon: Building2,
      color: 'text-orange-700 dark:text-orange-300',
      bgColor: 'bg-orange-200 dark:bg-orange-800/50'
    },
    {
      title: 'Taux résolution',
      value: `${stats.resolutionRate || 0}%`,
      icon: Target,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/50'
    },
    {
      title: 'Interventions actives',
      value: stats.activeInterventions || 0,
      icon: Activity,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50'
    },
    {
      title: 'Citoyens inscrits',
      value: stats.totalCitizens || 0,
      icon: UserCheck,
      color: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-200 dark:bg-amber-800/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700
                     hover:shadow-lg dark:hover:shadow-gray-900/50 transform hover:-translate-y-1
                     transition-all duration-300 hover:border-amber-100 dark:hover:border-amber-900"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};