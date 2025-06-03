import React from 'react';
import { 
  FileText, AlertTriangle, CheckCircle, Clock, 
  TrendingUp, TrendingDown 
} from 'lucide-react';

interface DashboardStats {
  totalComplaints: number;
  newComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  resolutionRate: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards: StatCard[] = [
    {
      title: 'Total des plaintes',
      value: stats.totalComplaints,
      icon: FileText,
      color: 'text-primary-700',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30'
    },
    {
      title: 'Nouvelles plaintes',
      value: stats.newComplaints,
      icon: AlertTriangle,
      color: 'text-warning-700',
      bgColor: 'bg-warning-100 dark:bg-warning-900/30'
    },
    {
      title: 'Plaintes résolues',
      value: stats.resolvedComplaints,
      icon: CheckCircle,
      color: 'text-success-700',
      bgColor: 'bg-success-100 dark:bg-success-900/30'
    },
    {
      title: 'En cours de traitement',
      value: stats.inProgressComplaints,
      icon: Clock,
      color: 'text-info-700',
      bgColor: 'bg-info-100 dark:bg-info-900/30'
    },
    {
      title: 'Taux de résolution',
      value: `${stats.resolutionRate}%`,
      icon: TrendingUp,
      color: 'text-secondary-700',
      bgColor: 'bg-secondary-100 dark:bg-secondary-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary-200/20 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-gradient-to-br from-primary-600/5 to-primary-500/10" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              {card.trend && (
                <div className={`flex items-center text-sm font-medium ${
                  card.trend.isPositive ? 'text-success-600' : 'text-error-600'
                }`}>
                  {card.trend.isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>{card.trend.value}%</span>
                </div>
              )}
            </div>

            <div className="mb-2">
              <div className="text-3xl font-bold text-neutral-800 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                {card.value}
              </div>
            </div>

            <div className="text-sm font-medium text-neutral-500 dark:text-gray-400 group-hover:text-neutral-700 dark:group-hover:text-gray-300 transition-colors">
              {card.title}
            </div>

            {card.title === 'Taux de Résolution' && (
              <div className="mt-3">
                <div className="w-full bg-neutral-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-secondary-600 to-primary-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(stats.resolutionRate, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}