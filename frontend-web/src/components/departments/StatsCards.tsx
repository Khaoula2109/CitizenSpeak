import React from 'react';
import { Users, Building2, Activity, TrendingUp } from 'lucide-react';
import { Department, OrganizationInfo } from '../../types/department';

interface StatsCardsProps {
  organization: OrganizationInfo;
  departments: Department[];
}

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label?: string;
  value: number;
  text: string;
  trend?: string;
  trendColor?: string;
}

export function StatsCards({ organization, departments }: StatsCardsProps) {
  const stats: StatItem[] = [
    { 
      icon: Users,
      color: 'text-primary-700',
      bgColor: 'bg-gradient-to-br from-primary-100 to-primary-200',
      label: 'Personnel',
      value: departments.reduce((total, dept) => total + (dept.employeeCount || 0), 0),
      text: 'Employés au total',
      trendColor: 'text-green-600'
    },
    {
      icon: Building2,
      color: 'text-success-700',
      bgColor: 'bg-gradient-to-br from-success-100 to-success-200',
      value: departments.length,
      text: 'Départements',
      trendColor: 'text-green-600'
    },
    {
      icon: Activity,
      color: 'text-secondary-700',
      bgColor: 'bg-gradient-to-br from-secondary-100 to-secondary-200',
      value: organization.stats.monthlyInterventions,
      text: 'Interventions ce mois',
      trendColor: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {stats.map(({ icon: Icon, color, bgColor, label, value, text, trend, trendColor }, index) => (
        <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary-200/20 dark:border-gray-700 
                                  hover:shadow-brand-lg transform hover:scale-105 transition-all duration-300 
                                  hover:border-primary-500 dark:hover:border-primary-600 overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl
                        bg-gradient-to-br from-primary-600/5 to-primary-500/10" />
          
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${bgColor} p-3 rounded-xl shadow-brand group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              {trend && trendColor && (
                <div className="text-right">
                  <div className={`flex items-center text-sm font-semibold ${trendColor}`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {trend}
                  </div>
                  {label && (
                    <span className="text-xs text-neutral-500 dark:text-gray-400">{label}</span>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-3xl font-bold text-neutral-800 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors mb-1">
                {value}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-gray-400">{text}</p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-primary-500 
                        transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </div>
      ))}
    </div>
  );
}