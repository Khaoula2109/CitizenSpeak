import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CategoryData {
  categoryId: string;
  label: string;
  count: number;
  description: string;
}

interface CategoryChartProps {
  data: CategoryData[];
  isLoading?: boolean;
}

const CATEGORY_COLORS = [
  '#8B4513', 
  '#FF8C00', 
  '#DAA520', 
  '#CD853F',
  '#D2691E',
  '#B8860B',
  '#A0522D',
  '#DEB887'
];

export function CategoryChart({ data, isLoading = false }: CategoryChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl mr-4 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Répartition par catégorie
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Distribution des plaintes par type
            </p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl mr-4 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Répartition par catégorie
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Distribution des plaintes par type
            </p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    ...item,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl mr-4 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Répartition par catégorie
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Distribution des plaintes par type
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {total}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total plaintes
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="label" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={12}
                stroke="#6b7280"
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fill: '#6b7280' }}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
                formatter={(value: any, name: any) => [
                  `${value} plainte${value > 1 ? 's' : ''}`, 
                  'Nombre'
                ]}
                labelFormatter={(label) => `Catégorie: ${label}`}
              />
              <Bar 
                dataKey="count" 
                radius={[6, 6, 0, 0]}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-4 text-center">
            Distribution Proportionnelle
          </h4>
          
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  dataKey="count"
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px'
                  }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value} plainte${value > 1 ? 's' : ''} (${((value / total) * 100).toFixed(1)}%)`,
                    props.payload.label
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {chartData
              .sort((a, b) => b.count - a.count)
              .map((item, index) => {
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={item.categoryId} className="flex items-center text-sm">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.label} ({percentage}%)
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}