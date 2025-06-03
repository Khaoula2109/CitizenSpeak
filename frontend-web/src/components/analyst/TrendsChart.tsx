import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

interface MonthlyTrend {
  month: number;
  monthName: string;
  year: number;
  totalComplaints: number;
  categories: { [key: string]: number };
}

interface TrendsChartProps {
  data: MonthlyTrend[];
}

const CATEGORY_COLORS = {
  'Voirie': '#8B5A2B',
  'Éclairage': '#D2691E', 
  'Propreté': '#CD853F',
  'Espaces verts': '#DEB887',
  'Autre': '#F4A460'
};

export function TrendsChart({ data }: TrendsChartProps) {
  const [viewMode, setViewMode] = useState<'total' | 'categories'>('total');

  const chartData = data.map(item => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return {
      month: monthNames[item.month - 1] || item.monthName,
      total: item.totalComplaints,
      ...item.categories
    };
  });

  const calculateTrend = () => {
    if (data.length < 2) return { value: 0, isPositive: true };
    
    const recent = data.slice(-3).reduce((sum, item) => sum + item.totalComplaints, 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + item.totalComplaints, 0) / 3;
    
    if (previous === 0) return { value: 0, isPositive: true };
    
    const change = ((recent - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const trend = calculateTrend();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary-200/20 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-brand-gradient rounded-xl mr-4 shadow-brand">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
              Évolution mensuelle
            </h3>
            <p className="text-sm text-neutral-500 dark:text-gray-400">
              Tendances des plaintes sur l'année
            </p>
          </div>
        </div>

        <div className="flex bg-neutral-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'total'
                ? 'bg-white dark:bg-gray-600 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-neutral-600 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-gray-200'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setViewMode('categories')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'categories'
                ? 'bg-white dark:bg-gray-600 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-neutral-600 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-gray-200'
            }`}
          >
            Catégories
          </button>
        </div>
      </div>



      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'total' ? (
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5A2B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5A2B" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#F9FAFB',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [value, 'Plaintes']}
                labelFormatter={(label) => `Mois: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#8B5A2B"
                strokeWidth={3}
                fill="url(#totalGradient)"
                animationDuration={1500}
                dot={{ fill: '#8B5A2B', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, fill: '#D2691E' }}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#F9FAFB',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              {Object.keys(CATEGORY_COLORS).map((category) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-neutral-50 dark:bg-gray-700 rounded-xl">
          <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
            {chartData.reduce((sum, item) => sum + item.total, 0)}
          </div>
          <div className="text-sm text-neutral-600 dark:text-gray-400">
            Total annuel
          </div>
        </div>
        <div className="text-center p-3 bg-neutral-50 dark:bg-gray-700 rounded-xl">
          <div className="text-2xl font-bold text-secondary-700 dark:text-secondary-300">
            {chartData.length > 0 ? Math.round(chartData.reduce((sum, item) => sum + item.total, 0) / chartData.length) : 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-gray-400">
            Moyenne mensuelle
          </div>
        </div>
      </div>
    </div>
  );
}