import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Clock, CheckCircle, TrendingDown, AlertTriangle } from 'lucide-react';

interface ResolutionData {
  category: string;
  averageResolutionTime: number;
  minResolutionTime: number;
  maxResolutionTime: number;
  totalResolved: number;
}

interface ResolutionAnalysisProps {
  data: ResolutionData[];
}

export function ResolutionAnalysis({ data }: ResolutionAnalysisProps) {
  const globalStats = data.reduce(
    (acc, item) => {
      acc.totalResolved += item.totalResolved;
      acc.totalAvgTime += item.averageResolutionTime * item.totalResolved;
      return acc;
    },
    { totalResolved: 0, totalAvgTime: 0 }
  );

  const globalAverageTime = globalStats.totalResolved > 0 
    ? globalStats.totalAvgTime / globalStats.totalResolved 
    : 0;

  const sortedByTime = [...data].sort((a, b) => a.averageResolutionTime - b.averageResolutionTime);
  const fastestCategory = sortedByTime[0];
  const slowestCategory = sortedByTime[sortedByTime.length - 1];

  const getPerformanceLevel = (avgTime: number) => {
    if (avgTime <= 3) return { level: 'Excellent', color: 'success', icon: CheckCircle };
    if (avgTime <= 5) return { level: 'Bon', color: 'info', icon: Clock };
    if (avgTime <= 7) return { level: 'Moyen', color: 'warning', icon: AlertTriangle };
    return { level: 'À améliorer', color: 'error', icon: TrendingDown };
  };

  const getBarColor = (avgTime: number) => {
    if (avgTime <= 3) return '#16A34A'; // success
    if (avgTime <= 5) return '#0284C7'; // info  
    if (avgTime <= 7) return '#D97706'; // warning
    return '#DC2626'; // error
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary-200/20 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-brand-gradient rounded-xl mr-4 shadow-brand">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
              Temps de résolution
            </h3>
            <p className="text-sm text-neutral-500 dark:text-gray-400">
              Analyse des délais par catégorie
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
            {globalAverageTime.toFixed(1)}
          </div>
          <div className="text-sm text-neutral-500 dark:text-gray-400">
            jours (moyenne globale)
          </div>
        </div>
      </div>

      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="category" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12}
              label={{ value: 'Jours', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '12px',
                color: '#F9FAFB',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => [`${Number(value).toFixed(1)} jours`, 'Temps moyen']}
              labelFormatter={(label) => `Catégorie: ${label}`}
            />
            <Bar 
              dataKey="averageResolutionTime" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.averageResolutionTime)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => {
          const performance = getPerformanceLevel(item.averageResolutionTime);
          const IconComponent = performance.icon;
          
          return (
            <div
              key={item.category}
              className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-gray-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${performance.color}-100 dark:bg-${performance.color}-900/30`}>
                  <IconComponent className={`h-4 w-4 text-${performance.color}-600 dark:text-${performance.color}-400`} />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-800 dark:text-white">
                    {item.category}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-gray-400">
                    {item.totalResolved} plaintes résolues
                  </p>
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-neutral-800 dark:text-white">
                    {item.averageResolutionTime.toFixed(1)}j
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${performance.color}-100 text-${performance.color}-800 dark:bg-${performance.color}-900/30 dark:text-${performance.color}-300`}>
                    {performance.level}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-gray-500">
                  Min: {item.minResolutionTime}j | Max: {item.maxResolutionTime}j
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {fastestCategory && (
          <div className="p-4 bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-xl border border-success-200/30 dark:border-success-700/30">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 text-success-600 mr-2" />
              <span className="text-sm font-semibold text-success-800 dark:text-success-300">
                Meilleure performance
              </span>
            </div>
            <p className="text-sm text-success-700 dark:text-success-300">
              <strong>{fastestCategory.category}</strong> : {fastestCategory.averageResolutionTime.toFixed(1)} jours en moyenne
            </p>
          </div>
        )}

        {slowestCategory && slowestCategory.averageResolutionTime > 5 && (
          <div className="p-4 bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 rounded-xl border border-warning-200/30 dark:border-warning-700/30">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-warning-600 mr-2" />
              <span className="text-sm font-semibold text-warning-800 dark:text-warning-300">
                À Améliorer
              </span>
            </div>
            <p className="text-sm text-warning-700 dark:text-warning-300">
              <strong>{slowestCategory.category}</strong> : {slowestCategory.averageResolutionTime.toFixed(1)} jours (objectif &lt; 5j)
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-neutral-50 to-primary-50 dark:from-gray-700 dark:to-primary-900/20 rounded-xl border border-primary-200/30 dark:border-primary-700/30">
        <h4 className="font-semibold text-neutral-800 dark:text-white mb-2">
          Objectifs de performance
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-success-500 rounded-full mr-2" />
            <span className="text-neutral-600 dark:text-gray-400">≤ 3j : Excellent</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-info-500 rounded-full mr-2" />
            <span className="text-neutral-600 dark:text-gray-400">≤ 5j : Bon</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-warning-500 rounded-full mr-2" />
            <span className="text-neutral-600 dark:text-gray-400">≤ 7j : Moyen</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-error-500 rounded-full mr-2" />
            <span className="text-neutral-600 dark:text-gray-400">&gt; 7j : Critique</span>
          </div>
        </div>
      </div>
    </div>
  );
}