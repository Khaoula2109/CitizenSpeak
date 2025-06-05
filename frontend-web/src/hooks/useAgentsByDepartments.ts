import { useState, useEffect } from 'react';
import api from '../utils/api';

// Interface pour définir le type d'un agent
interface Agent {
  id: string;
  name: string;
  email?: string;
  role?: string;
  service?: string;
  departmentId?: string;
  // Ajoutez d'autres propriétés selon votre modèle d'agent
}

// Type de retour du hook
interface UseAgentsByDepartmentReturn {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAgentsByDepartment = (departmentId: string): UseAgentsByDepartmentReturn => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async (): Promise<void> => {
    if (!departmentId) {
      setAgents([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Reset l'erreur au début de la requête
      
      const response = await api.get(`/complaints/departments/${departmentId}/agents`);
      setAgents(response.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des agents');
      setAgents([]); // Reset les agents en cas d'erreur
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [departmentId]);

  return { agents, loading, error, refetch: fetchAgents };
};