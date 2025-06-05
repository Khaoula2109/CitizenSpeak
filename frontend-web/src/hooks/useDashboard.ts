import { useState, useEffect } from 'react';
import api from '../utils/api';

// Types pour une meilleure sécurité de typage
interface DashboardStats {
  [key: string]: any;
}

interface DepartmentData {
  department: string;
  count: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface ApiTimelineItem {
  date: string;
  count: number;
}

interface TimelineData {
  month: string;
  nouvelles: number;
  resolues: number;
}

interface CategoryData {
  category: string;
  count: number;
}

interface LocationData {
  location: string;
  count: number;
}

interface ResolutionTimeData {
  department: string;
  averageTime: number;
}

interface InterventionsStats {
  [key: string]: any;
}

interface RecentActivity {
  [key: string]: any;
}

interface StatusItem {
  status: string;
  count: number;
}

interface ApiEndpoint {
  url: string;
  setter: (data: any) => void;
  name: string;
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({});
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [resolutionTimeData, setResolutionTimeData] = useState<ResolutionTimeData[]>([]);
  const [interventionsStats, setInterventionsStats] = useState<InterventionsStats>({});
  const [recentActivity, setRecentActivity] = useState<RecentActivity>({});

  const loadDefaultData = (): void => {
    console.log('Initialisation des données vides...');
    
    setStats({});
    setDepartmentData([]);
    setStatusData([]);
    setTimelineData([]);
    setCategoriesData([]);
    setLocationData([]);
    setResolutionTimeData([]);
    setInterventionsStats({});
    setRecentActivity({});
  };

  const fetchDashboardData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Début du chargement des données dashboard...');
      
      const endpoints: ApiEndpoint[] = [
        { url: '/dashboard/overview', setter: setStats, name: 'overview' },
        { url: '/dashboard/complaints-by-department', setter: setDepartmentData, name: 'departments' },
        { url: '/dashboard/complaints-by-status', setter: setStatusData, name: 'status' },
        { url: '/dashboard/complaints-timeline', setter: setTimelineData, name: 'timeline' },
        { url: '/dashboard/top-categories', setter: setCategoriesData, name: 'categories' },
        { url: '/dashboard/complaints-by-location', setter: setLocationData, name: 'location' },
        { url: '/dashboard/resolution-time-by-department', setter: setResolutionTimeData, name: 'resolution' },
        { url: '/dashboard/interventions-stats', setter: setInterventionsStats, name: 'interventions' },
        { url: '/dashboard/recent-activity', setter: setRecentActivity, name: 'activity' }
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Chargement: ${endpoint.name} depuis ${endpoint.url}`);
          
          const response = await api.get(endpoint.url);
          const data = response.data;
          
          console.log(`${endpoint.name} chargé:`, data);
          
          if (endpoint.name === 'status') {
            const statusColors: Record<string, string> = {
              'Resolved': '#d97706',   
              'Pending': '#f59e0b',  
              'In Progress': '#b45309',
              'Escalated': '#92400e'
            };
            
            const transformedData: StatusData[] = (data as StatusItem[]).map((item: StatusItem) => ({
              name: item.status,
              value: item.count,
              color: statusColors[item.status] || '#6b7280'
            }));
            
            endpoint.setter(transformedData);
          } else if (endpoint.name === 'timeline') {
            // Transformation des données timeline si nécessaire
            // Si l'API retourne un format différent, transformez ici
            const transformedTimelineData: TimelineData[] = (data as ApiTimelineItem[]).map((item: ApiTimelineItem) => ({
              month: item.date,
              nouvelles: item.count,
              resolues: Math.floor(item.count * 0.8) // Exemple de transformation
            }));
            
            endpoint.setter(transformedTimelineData);
          } else {
            endpoint.setter(data);
          }
          
        } catch (endpointError: any) {
          console.error(`Erreur lors du chargement de ${endpoint.name}:`, endpointError);
          
          if (endpointError.response?.status === 404) {
            console.warn(`Endpoint ${endpoint.url} non trouvé - utilisation de données par défaut`);
          }
          
          endpoint.setter(endpoint.name === 'overview' ? {} : []);
        }
      }

      console.log('Chargement terminé');
      
    } catch (error: any) {
      console.error('Erreur globale lors de la récupération des données:', error);
      
      if (error.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 403) {
        setError('Accès non autorisé au tableau de bord.');
      } else {
        setError(`Erreur de connexion: ${error.message}`);
      }
      
      loadDefaultData();
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = (): void => {
    fetchDashboardData();
  };

  const continueDemoMode = (): void => {
    setError(null);
    loadDefaultData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    loading,
    error,
    stats,
    departmentData,
    statusData,
    timelineData,
    categoriesData,
    locationData,
    resolutionTimeData,
    interventionsStats,
    recentActivity,
    retryFetch,
    continueDemoMode
  };
};