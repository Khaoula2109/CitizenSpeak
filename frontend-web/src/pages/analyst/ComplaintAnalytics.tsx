import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Filter, Download, Calendar, MapPin, BarChart2, PieChart as PieChartIcon,
  TrendingUp, FileText, Map as MapIcon
} from 'lucide-react';
import { ComplaintMap } from './ComplaintMap';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export function ComplaintAnalytics() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMap, setShowMap] = useState(false);

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analyse des Plaintes</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Visualisation et analyse des tendances des plaintes citoyennes
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 
                    dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                    flex items-center space-x-2"
          >
            <MapIcon className="h-4 w-4" />
            <span>{showMap ? 'Masquer la carte' : 'Afficher la carte'}</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 
                     dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                     flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exporter PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 
                    dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                    flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Exporter Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Période
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Zone géographique
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Toutes les zones</option>
                <option value="north">Zone Nord</option>
                <option value="south">Zone Sud</option>
                <option value="east">Zone Est</option>
                <option value="west">Zone Ouest</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Toutes les catégories</option>
                <option value="voirie">Voirie</option>
                <option value="eclairage">Éclairage</option>
                <option value="proprete">Propreté</option>
                <option value="espaces_verts">Espaces verts</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {showMap && <ComplaintMap />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
              Répartition par catégorie
            </h3>
          </div>
          <div className="h-80">
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Aucune donnée disponible
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2 text-green-500" />
              Distribution des catégories
            </h3>
          </div>
          <div className="h-80">
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Aucune donnée disponible
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Temps de résolution moyen (jours)
            </h3>
          </div>
          <div className="h-80">
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Aucune donnée disponible
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <PieChartIcon className="h-5 w-5 mr-2 text-purple-500" />
              Satisfaction citoyenne (%)
            </h3>
          </div>
          <div className="h-80">
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Aucune donnée disponible
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}