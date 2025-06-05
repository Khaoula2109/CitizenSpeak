import { useState, useEffect } from 'react';
import api from '../utils/api';

interface Organization {
  organizationId: string;
  name: string;
  description: string;
  responsible: string;
  phone: string;
  email: string;
  annualBudget: number;
  headquartersAddress: string;
  active: boolean;
  id: string;
  slug: string;
  createdBy: string;
  createdAt: string;
}

interface OrganizationFormData {
  name: string;
  description: string;
  responsible: string;
  phone: string;
  email: string;
  annualBudget: number;
  headquartersAddress: string;
  active: boolean;
}

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/organizations');
      
      if (response.data) {
        const rawData = Array.isArray(response.data) ? response.data : [response.data];
        
        const data = rawData.map((org: any) => ({
          organizationId: org.organizationId,
          name: org.name,
          description: org.description,
          responsible: org.responsible,
          phone: org.phone,
          email: org.email,
          annualBudget: org.annualBudget,
          headquartersAddress: org.headquartersAddress,
          active: org.active,
          id: org.organizationId,
          slug: org.name.toLowerCase().replace(/\s+/g, '-'),
          createdBy: org.createdBy,
          createdAt: org.createdAt ? org.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        
        setOrganizations(data);
      } else {
        setOrganizations([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des organisations');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (formData: OrganizationFormData) => {
    try {
      const slug = formData.name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const res = await api.post('/organizations', formData);
      const newOrg: Organization = {
        ...res.data,
        id: res.data.organizationId,
        slug,
        createdAt: new Date().toISOString().split('T')[0],
        active: res.data.active ?? true
      };
      
      setOrganizations(prev => [...prev, newOrg]);
      return newOrg;
    } catch (err) {
      throw new Error('Erreur lors de la création de l\'organisme');
    }
  };

  const updateOrganization = async (id: string, formData: OrganizationFormData) => {
    try {
      const slug = formData.name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const res = await api.put(`/organizations/${id}`, formData);
      
      setOrganizations(prev =>
        prev.map(org => org.id === id
          ? { ...res.data, id: res.data.organizationId, slug, createdAt: org.createdAt }
          : org
        )
      );
      return res.data;
    } catch (err) {
      throw new Error('Erreur lors de la mise à jour de l\'organisme');
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    error,
    refetch: fetchOrganizations,
    createOrganization,
    updateOrganization
  };
};