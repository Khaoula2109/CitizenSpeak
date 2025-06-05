import React, { useState } from 'react';
import { 
  Lightbulb, AlertTriangle, CheckCircle, Clock, Target,
  TrendingUp, Users, Settings, ChevronRight, Eye
} from 'lucide-react';

interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface PriorityAnalysis {
  high: number;
  medium: number;
  low: number;
  categoryBreakdown: { [category: string]: { [priority: string]: number } };
}

interface RecommendationsProps {
  recommendations: Recommendation[];
  priorityAnalysis: PriorityAnalysis | null;
}

const RECOMMENDATION_ICONS = {
  'PRIORITY_FOCUS': Target,
  'RESOLUTION_TIME': Clock,
  'RESOURCE_ALLOCATION': Users,
  'PROCESS_OPTIMIZATION': Settings,
  'TREND_ANALYSIS': TrendingUp,
  'DEFAULT': Lightbulb
};

const PRIORITY_COLORS = {
  'HIGH': {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700/30',
    text: 'text-red-800 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  },
  'MEDIUM': {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-700/30',
    text: 'text-yellow-800 dark:text-yellow-300',
    icon: 'text-yellow-600 dark:text-yellow-400',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  },
  'LOW': {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700/30',
    text: 'text-blue-800 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  }
};

export function Recommendations({ recommendations, priorityAnalysis }: RecommendationsProps) {
  const [selectedPriority, setSelectedPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW' | 'ALL'>('ALL');

  const priorityStats = priorityAnalysis ? {
    total: priorityAnalysis.high + priorityAnalysis.medium + priorityAnalysis.low,
    high: priorityAnalysis.high,
    medium: priorityAnalysis.medium,
    low: priorityAnalysis.low
  } : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl mr-4 shadow-lg">
            <Lightbulb className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Analyse des priorités
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Répartition des plaintes par niveau de priorité
            </p>
          </div>
        </div>
      </div>

      {priorityStats && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4">
            Répartition des priorités
          </h4>
          
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              {priorityStats.total > 0 && (
                <>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="8"
                    strokeDasharray={`${(priorityStats.high / priorityStats.total) * 251.2} 251.2`}
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="8"
                    strokeDasharray={`${(priorityStats.medium / priorityStats.total) * 251.2} 251.2`}
                    strokeDashoffset={`-${(priorityStats.high / priorityStats.total) * 251.2}`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="8"
                    strokeDasharray={`${(priorityStats.low / priorityStats.total) * 251.2} 251.2`}
                    strokeDashoffset={`-${((priorityStats.high + priorityStats.medium) / priorityStats.total) * 251.2}`}
                  />
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {priorityStats.total}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                <span className="text-sm font-medium text-red-800 dark:text-red-300">Haute</span>
              </div>
              <span className="text-sm font-bold text-red-800 dark:text-red-300">
                {priorityStats.high}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Moyenne</span>
              </div>
              <span className="text-sm font-bold text-yellow-800 dark:text-yellow-300">
                {priorityStats.medium}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Basse</span>
              </div>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                {priorityStats.low}
              </span>
            </div>
          </div>

        </div>
      )}

      {!priorityStats && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Aucune donnée de priorité disponible
          </p>
        </div>
      )}
    </div>
  );
}