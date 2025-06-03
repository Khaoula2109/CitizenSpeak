import { useState } from 'react';
import api from '../utils/api';

interface DashboardStats {
  totalComplaints: number;
  newComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  resolutionRate: number;
}

export const useReportActions = () => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateYearlyReport = async (selectedYear: number, stats: DashboardStats | null) => {
    if (!stats || stats.totalComplaints === 0) {
      alert(`Aucune donnée disponible pour l'année ${selectedYear}`);
      return;
    }

    try {
      setIsGeneratingReport(true);
      
      const reportPayload = {
        year: selectedYear,
        includeStats: true,
        includeCategories: true,
        includeTrends: true,
        includeGeographical: true,
        includeResolution: true,
        includePriority: true,
        includeRecommendations: true,
        format: 'pdf' 
      };

      const response = await api.post('/analyst/report/generate', reportPayload, {
        responseType: 'blob' 
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapport_Analyse_Plaintes_${selectedYear}.pdf`; 
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport PDF. Veuillez réessayer.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return {
    isGeneratingReport,
    generateYearlyReport
  };
};