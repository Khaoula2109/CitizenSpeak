import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { analystService } from '../../utils/analystService';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface ComplaintLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  category: string;
  count: number;
  zone?: string;
}

interface GeographicalData {
  zone: string;
  count: number;
  latitude: number;
  longitude: number;
  dominantCategory: string;
}

export function ComplaintMap() {
  const [locations, setLocations] = useState<ComplaintLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fix Leaflet default icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    loadGeographicalData();
  }, []);

  const loadGeographicalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analystService.getGeographicalDistribution();
      const geoData: GeographicalData[] = response.data;
      
      const mapLocations: ComplaintLocation[] = geoData.map((item, index) => ({
        id: `zone-${index}`,
        lat: item.latitude,
        lng: item.longitude,
        title: item.zone,
        category: item.dominantCategory,
        count: item.count,
        zone: item.zone
      }));

      setLocations(mapLocations);
    } catch (error) {
      console.error('Erreur lors du chargement des données géographiques:', error);
      setError('Impossible de charger les données géographiques');
      setLocations([]); // No mock data - show empty state instead
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Voirie': '#8B5A2B',
      'Éclairage': '#D2691E', 
      'Propreté': '#CD853F',
      'Espaces verts': '#DEB887',
      'Autre': '#F4A460'
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-[500px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-neutral-600 dark:text-gray-400">Chargement de la carte...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <button 
              onClick={loadGeographicalData}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Carte des Plaintes
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Distribution géographique des plaintes par zone
          </p>
        </div>
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Aucune donnée géographique disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Carte des Plaintes
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Distribution géographique des plaintes par zone
        </p>
      </div>
      
      <div className="h-[500px] rounded-lg overflow-hidden">
        <MapContainer
          center={[33.9716, -6.8498]} 
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {locations.map((location) => (
            <CircleMarker
              key={location.id}
              center={[location.lat, location.lng]}
              radius={Math.sqrt(location.count) * 3 + 8} 
              fillColor={getCategoryColor(location.category)}
              color={getCategoryColor(location.category)}
              weight={2}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h4 className="font-semibold text-gray-900 text-base mb-2">
                    {location.title}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plaintes:</span>
                      <span className="font-medium text-gray-900">{location.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Catégorie dominante:</span>
                      <span 
                        className="font-medium"
                        style={{ color: getCategoryColor(location.category) }}
                      >
                        {location.category}
                      </span>
                    </div>
                    {location.zone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Zone:</span>
                        <span className="font-medium text-gray-900">{location.zone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Légende:
        </div>
        {Array.from(new Set(locations.map(l => l.category))).map(category => (
          <div key={category} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: getCategoryColor(category) }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {category}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {locations.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Zones
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {locations.reduce((sum, l) => sum + l.count, 0)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total plaintes
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {locations.length > 0 ? Math.round(locations.reduce((sum, l) => sum + l.count, 0) / locations.length) : 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Moyenne/zone
          </div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {locations.length > 0 ? Math.max(...locations.map(l => l.count)) : 0}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Zone max
          </div>
        </div>
      </div>
    </div>
  );
}