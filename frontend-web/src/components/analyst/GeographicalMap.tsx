import React, { useState } from 'react';
import { MapPin, Eye, BarChart3 } from 'lucide-react';

interface GeographicalData {
  zone: string;
  count: number;
  latitude: number;
  longitude: number;
  dominantCategory: string;
}

interface GeographicalMapProps {
  data: GeographicalData[];
}

const CATEGORY_COLORS = {
  'Voirie': '#8B5A2B',
  'Éclairage': '#D2691E', 
  'Propreté': '#CD853F',
  'Espaces verts': '#DEB887',
  'Autre': '#F4A460'
};

export function GeographicalMap({ data }: GeographicalMapProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const totalComplaints = data.reduce((sum, d) => sum + d.count, 0);

  const getZoneIntensity = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.8) return 'très élevée';
    if (intensity > 0.6) return 'élevée';
    if (intensity > 0.4) return 'modérée';
    if (intensity > 0.2) return 'faible';
    return 'très faible';
  };

  const getIntensityColor = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.8) return 'bg-error-500';
    if (intensity > 0.6) return 'bg-warning-500';
    if (intensity > 0.4) return 'bg-primary-500';
    if (intensity > 0.2) return 'bg-info-500';
    return 'bg-success-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-primary-200/20 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-brand-gradient rounded-xl mr-4 shadow-brand">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
              Distribution géographique
            </h3>
            <p className="text-sm text-neutral-500 dark:text-gray-400">
              Répartition des plaintes par zone
            </p>
          </div>
        </div>

        <div className="flex bg-neutral-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'map'
                ? 'bg-white dark:bg-gray-600 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-neutral-600 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-gray-200'
            }`}
          >
            <MapPin className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-primary-700 dark:text-primary-300 shadow-sm'
                : 'text-neutral-600 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-gray-200'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="space-y-6">
          <div className="relative bg-gradient-to-br from-neutral-50 to-primary-50 dark:from-gray-700 dark:to-primary-900/20 rounded-xl p-8 h-80">
            <div className="grid grid-cols-2 gap-4 h-full">
              {data.map((zone, index) => {
                const intensity = zone.count / maxCount;
                const isSelected = selectedZone === zone.zone;
                
                return (
                  <div
                    key={zone.zone}
                    onClick={() => setSelectedZone(isSelected ? null : zone.zone)}
                    className={`
                      relative cursor-pointer rounded-xl p-4 transition-all duration-300 transform hover:scale-105
                      ${isSelected 
                        ? 'ring-2 ring-primary-500 shadow-lg' 
                        : 'hover:shadow-md'
                      }
                    `}
                    style={{
                      backgroundColor: `rgba(139, 90, 43, ${0.1 + intensity * 0.6})`,
                      border: `2px solid rgba(139, 90, 43, ${0.2 + intensity * 0.5})`
                    }}
                  >
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getIntensityColor(zone.count)}`} />
                    
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <h4 className="font-bold text-neutral-800 dark:text-white mb-1">
                          {zone.zone}
                        </h4>
                        <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                          {zone.count}
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-gray-400">
                          plaintes
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-neutral-600 dark:text-gray-400">
                          Dominant: <span className="font-medium" style={{ color: CATEGORY_COLORS[zone.dominantCategory as keyof typeof CATEGORY_COLORS] || '#6B7280' }}>
                            {zone.dominantCategory}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-gray-500">
                          Intensité: {getZoneIntensity(zone.count)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-primary-200/30 dark:border-gray-600">
              <div className="text-xs font-semibold text-neutral-700 dark:text-gray-300 mb-2">
                Intensité des plaintes
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <span className="text-xs text-neutral-600 dark:text-gray-400">Faible</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-warning-500 rounded-full" />
                  <span className="text-xs text-neutral-600 dark:text-gray-400">Élevée</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-error-500 rounded-full" />
                  <span className="text-xs text-neutral-600 dark:text-gray-400">Critique</span>
                </div>
              </div>
            </div>
          </div>

          {selectedZone && (
            <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200/30 dark:border-primary-700/30">
              {(() => {
                const zone = data.find(d => d.zone === selectedZone);
                if (!zone) return null;
                
                const percentage = totalComplaints > 0 ? ((zone.count / totalComplaints) * 100).toFixed(1) : '0';
                
                return (
                  <div>
                    <h4 className="font-bold text-primary-800 dark:text-primary-300 mb-2">
                      Détails - {zone.zone}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600 dark:text-gray-400">Nombre de plaintes:</span>
                        <span className="ml-2 font-semibold text-neutral-800 dark:text-white">{zone.count}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-gray-400">Pourcentage du total:</span>
                        <span className="ml-2 font-semibold text-neutral-800 dark:text-white">{percentage}%</span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-gray-400">Catégorie dominante:</span>
                        <span className="ml-2 font-semibold" style={{ color: CATEGORY_COLORS[zone.dominantCategory as keyof typeof CATEGORY_COLORS] || '#6B7280' }}>
                          {zone.dominantCategory}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-600 dark:text-gray-400">Niveau d'intensité:</span>
                        <span className="ml-2 font-semibold text-neutral-800 dark:text-white">{getZoneIntensity(zone.count)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {data
            .sort((a, b) => b.count - a.count)
            .map((zone, index) => {
              const percentage = totalComplaints > 0 ? ((zone.count / totalComplaints) * 100) : 0;
              
              return (
                <div
                  key={zone.zone}
                  className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-gray-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800 dark:text-white">
                        {zone.zone}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-gray-400">
                        Catégorie dominante: <span style={{ color: CATEGORY_COLORS[zone.dominantCategory as keyof typeof CATEGORY_COLORS] || '#6B7280' }}>
                          {zone.dominantCategory}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-neutral-800 dark:text-white">
                        {zone.count}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="w-20 bg-neutral-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className={`w-3 h-3 rounded-full ${getIntensityColor(zone.count)}`} />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-xl">
          <div className="text-lg font-bold text-primary-700 dark:text-primary-300">
            {data.length}
          </div>
          <div className="text-xs text-neutral-600 dark:text-gray-400">
            Zones analysées
          </div>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-xl">
          <div className="text-lg font-bold text-secondary-700 dark:text-secondary-300">
            {totalComplaints}
          </div>
          <div className="text-xs text-neutral-600 dark:text-gray-400">
            Total plaintes
          </div>
        </div>
        <div className="p-3 bg-neutral-50 dark:bg-gray-700 rounded-xl">
          <div className="text-lg font-bold text-warning-700 dark:text-warning-300">
            {data.length > 0 ? Math.round(totalComplaints / data.length) : 0}
          </div>
          <div className="text-xs text-neutral-600 dark:text-gray-400">
            Moyenne par zone
          </div>
        </div>
      </div>
    </div>
  );
}