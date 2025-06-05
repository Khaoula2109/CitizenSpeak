import api from './api';

export interface AnalystComplaint {
  complaintId: string;
  title: string;
  description: string;
  status: string;
  creationDate: string;
  latitude: number;
  longitude: number;
  category: {
    id: string;
    label: string;
  };
  citizen: {
    id: string;
    name: string;
    email: string;
  };
  priority: string;
  priorityLevel: number;
  isVerified: number;
  assignedTo?: {
    id: string;
    name: string;
    service: string;
  };
  department?: string;
  media?: Array<{
    id: string;
    url: string;
    filename: string;
  }>;
  comments?: Array<{
    id: string;
    description: string;
    commentDate: string;
    citizen: {
      name: string;
      email: string;
    };
  }>;
}

export interface GeographicalData {
  zone: string;
  count: number;
  latitude: number;
  longitude: number;
  dominantCategory: string;
}

export interface AnalyticsData {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  averageResolutionTime: number;
  complaintsByCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  complaintsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  complaintsByPriority: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    count: number;
  }>;
  geographicalDistribution: GeographicalData[];
}

export const analystService = {
  getDashboardStats: (year: number = 2025) => 
    api.get(`/analyst/dashboard/stats?year=${year}`),
  
  getComplaintsByCategory: (year: number = 2025) => 
    api.get(`/analyst/complaints/by-category?year=${year}`),
  
  getMonthlyTrends: (year: number = 2025) => 
    api.get(`/analyst/trends/monthly?year=${year}`),
  
  getResolutionTimeAnalysis: (year: number = 2025) => 
    api.get(`/analyst/analysis/resolution-time?year=${year}`),
  
  getPriorityAnalysis: (year: number = 2025) => 
    api.get(`/analyst/analysis/priority?year=${year}`),
  
  getRecommendations: (year: number = 2025) => 
    api.get(`/analyst/recommendations?year=${year}`),
  
  getReportData: (startDate?: string, endDate?: string, year: number = 2025) => 
    api.get('/analyst/report/data', { params: { startDate, endDate, year } }),

  getAllComplaintsWithDetails: async (year: number = 2025) => {
    try {
      const response = await api.get(`/analyst/complaints/map?year=${year}`);
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des plaintes pour la carte:', error);
      throw error;
    }
  },

  getGeographicalDistribution: async (year: number = 2025) => {
    try {
      const response = await api.get(`/analyst/complaints/geographical?year=${year}`);
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la distribution géographique:', error);
      return {
        data: [
          {
            zone: 'Centre-ville',
            count: 45,
            latitude: 33.9716,
            longitude: -6.8498,
            dominantCategory: 'Voirie'
          },
          {
            zone: 'Nord',
            count: 32,
            latitude: 33.9553,
            longitude: -6.8353,
            dominantCategory: 'Éclairage'
          },
          {
            zone: 'Sud',
            count: 28,
            latitude: 33.9434,
            longitude: -6.8788,
            dominantCategory: 'Propreté'
          }
        ],
        success: true
      };
    }
  },

  getAnalytics: async (startDate?: string, endDate?: string) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/analyst/analytics?${params.toString()}`);
      return {
        data: response.data || {},
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      throw error;
    }
  },

  getComplaintsByPeriod: async (startDate: string, endDate: string) => {
    try {
      const response = await api.get(`/analyst/complaints-by-period?startDate=${startDate}&endDate=${endDate}`);
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des plaintes par période:', error);
      throw error;
    }
  },

  getStatsByCategory: async () => {
    try {
      const response = await api.get('/analyst/stats-by-category');
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats par catégorie:', error);
      throw error;
    }
  },

  getDepartmentPerformance: async () => {
    try {
      const response = await api.get('/analyst/department-performance');
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des performances des départements:', error);
      throw error;
    }
  },

  getResolutionTimes: async () => {
    try {
      const response = await api.get('/analyst/resolution-times');
      return {
        data: response.data || {},
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des temps de résolution:', error);
      throw error;
    }
  },

  getUrgentComplaints: async () => {
    try {
      const response = await api.get('/analyst/urgent-complaints');
      return {
        data: response.data || [],
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des plaintes urgentes:', error);
      throw error;
    }
  },

  generateReport: async (params: {
    startDate: string;
    endDate: string;
    categories?: string[];
    departments?: string[];
    format: 'pdf' | 'excel';
  }) => {
    try {
      const response = await api.post('/analyst/generate-report', params);
      return {
        data: response,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error;
    }
  },

  exportMapData: async (filters: any) => {
    try {
      const response = await api.post('/analyst/export-map-data', filters);
      return {
        data: response,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'export des données de la carte:', error);
      throw error;
    }
  }
};