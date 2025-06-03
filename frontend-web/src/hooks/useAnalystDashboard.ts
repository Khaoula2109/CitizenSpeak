import { useState, useEffect } from 'react';
import { analystService } from '../utils/analystService';
import { authUtils } from '../utils/api';

interface DashboardStats {
  totalComplaints: number;
  newComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  resolutionRate: number;
}

interface CategoryData {
  categoryId: string;
  label: string;
  count: number;
  description: string;
}

interface MonthlyTrend {
  month: number;
  monthName: string;
  year: number;
  totalComplaints: number;
  categories: { [key: string]: number };
}

interface GeographicalData {
  zone: string;
  count: number;
  latitude: number;
  longitude: number;
  dominantCategory: string;
}

interface ResolutionData {
  category: string;
  averageResolutionTime: number;
  minResolutionTime: number;
  maxResolutionTime: number;
  totalResolved: number;
}

interface PriorityAnalysis {
  high: number;
  medium: number;
  low: number;
  categoryBreakdown: { [category: string]: { [priority: string]: number } };
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const useAnalystDashboard = (selectedYear: number) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [geographicalData, setGeographicalData] = useState<GeographicalData[]>([]);
  const [resolutionData, setResolutionData] = useState<ResolutionData[]>([]);
  const [priorityAnalysis, setPriorityAnalysis] = useState<PriorityAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Chargement des données pour l'année ${selectedYear}...`);
      
      const results = await Promise.allSettled([
        analystService.getDashboardStats(selectedYear), 
        analystService.getComplaintsByCategory(selectedYear), 
        analystService.getMonthlyTrends(selectedYear), 
        analystService.getGeographicalDistribution(selectedYear), 
        analystService.getResolutionTimeAnalysis(selectedYear), 
        analystService.getPriorityAnalysis(selectedYear), 
        analystService.getRecommendations(selectedYear), 
        analystService.getAllComplaintsWithDetails(selectedYear) 
      ]);

      const [
        statsResult,
        categoryResult,
        trendsResult,
        geoResult,
        resolutionResult,
        priorityResult,
        recommendationsResult,
        complaintsResult
      ] = results;

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data || {
          totalComplaints: 0,
          newComplaints: 0,
          resolvedComplaints: 0,
          inProgressComplaints: 0,
          resolutionRate: 0
        });
      } else {
        console.error('Erreur stats:', statsResult.reason);
      }

      if (categoryResult.status === 'fulfilled') {
        setCategoryData(Array.isArray(categoryResult.value.data) ? categoryResult.value.data : []);
      } else {
        console.error('Erreur catégories:', categoryResult.reason);
      }

      if (trendsResult.status === 'fulfilled') {
        setMonthlyTrends(Array.isArray(trendsResult.value.data) ? trendsResult.value.data : []);
      } else {
        console.error('Erreur tendances:', trendsResult.reason);
      }

      if (geoResult.status === 'fulfilled') {
        setGeographicalData(Array.isArray(geoResult.value.data) ? geoResult.value.data : []);
      } else {
        console.error('Erreur géographique:', geoResult.reason);
      }

      if (resolutionResult.status === 'fulfilled') {
        setResolutionData(Array.isArray(resolutionResult.value.data) ? resolutionResult.value.data : []);
      } else {
        console.error('Erreur résolution:', resolutionResult.reason);
      }

      if (priorityResult.status === 'fulfilled') {
        setPriorityAnalysis(priorityResult.value.data || { high: 0, medium: 0, low: 0, categoryBreakdown: {} });
      } else {
        console.error('Erreur priorités:', priorityResult.reason);
      }

      if (recommendationsResult.status === 'fulfilled') {
        setRecommendations(Array.isArray(recommendationsResult.value.data) ? recommendationsResult.value.data : []);
      } else {
        console.error('Erreur recommandations:', recommendationsResult.reason);
      }

      if (complaintsResult.status === 'fulfilled') {
        setComplaints(Array.isArray(complaintsResult.value.data) ? complaintsResult.value.data : []);
      } else {
        console.error('Erreur plaintes carte:', complaintsResult.reason);
        setComplaints([]);
      }

      const allFailed = results.every(result => result.status === 'rejected');
      if (allFailed) {
        setError('Impossible de charger les données. Vérifiez votre connexion.');
      }

    } catch (error) {
      console.error('Erreur générale lors du chargement des données:', error);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
      
      setStats({
        totalComplaints: 156,
        newComplaints: 23,
        resolvedComplaints: 89,
        inProgressComplaints: 44,
        resolutionRate: 57.1
      });
      setCategoryData([
        { categoryId: '1', label: 'Voirie', count: 45, description: 'Routes et infrastructures' },
        { categoryId: '2', label: 'Éclairage', count: 32, description: 'Éclairage public' },
        { categoryId: '3', label: 'Propreté', count: 28, description: 'Collecte des déchets' },
        { categoryId: '4', label: 'Espaces verts', count: 23, description: 'Parcs et jardins' },
        { categoryId: '5', label: 'Autre', count: 28, description: 'Autres problèmes' }
      ]);
      setMonthlyTrends([
        { month: 1, monthName: 'Jan', year: selectedYear, totalComplaints: 23, categories: {} },
        { month: 2, monthName: 'Fév', year: selectedYear, totalComplaints: 29, categories: {} },
        { month: 3, monthName: 'Mar', year: selectedYear, totalComplaints: 34, categories: {} },
        { month: 4, monthName: 'Avr', year: selectedYear, totalComplaints: 28, categories: {} },
        { month: 5, monthName: 'Mai', year: selectedYear, totalComplaints: 32, categories: {} },
        { month: 6, monthName: 'Jun', year: selectedYear, totalComplaints: 25, categories: {} }
      ]);
      setGeographicalData([
        { zone: 'Centre-ville', count: 45, latitude: 33.9716, longitude: -6.8498, dominantCategory: 'Voirie' },
        { zone: 'Nord', count: 32, latitude: 33.9553, longitude: -6.8353, dominantCategory: 'Éclairage' },
        { zone: 'Sud', count: 28, latitude: 33.9434, longitude: -6.8788, dominantCategory: 'Propreté' }
      ]);
      setResolutionData([
        { category: 'Voirie', averageResolutionTime: 5.2, minResolutionTime: 1, maxResolutionTime: 15, totalResolved: 34 },
        { category: 'Éclairage', averageResolutionTime: 3.8, minResolutionTime: 1, maxResolutionTime: 12, totalResolved: 28 },
        { category: 'Propreté', averageResolutionTime: 2.1, minResolutionTime: 1, maxResolutionTime: 7, totalResolved: 22 }
      ]);
      setPriorityAnalysis({ 
        high: 12, 
        medium: 45, 
        low: 99, 
        categoryBreakdown: {
          'Voirie': { high: 8, medium: 20, low: 17 },
          'Éclairage': { high: 2, medium: 15, low: 15 },
          'Propreté': { high: 2, medium: 10, low: 16 }
        }
      });
      setRecommendations([
        { type: 'OPTIMIZATION', title: 'Améliorer les temps de résolution', description: 'Focus sur la catégorie Voirie', priority: 'HIGH' },
        { type: 'PREVENTION', title: 'Maintenance préventive', description: 'Éclairage public', priority: 'MEDIUM' }
      ]);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    loadDashboardData();
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedYear]);

  return {
    stats,
    categoryData,
    monthlyTrends,
    geographicalData,
    resolutionData,
    priorityAnalysis,
    recommendations,
    complaints,
    loading,
    error,
    loadDashboardData,
    handleRetry
  };
};