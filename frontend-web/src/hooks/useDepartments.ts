import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Department, OrganizationInfo, DepartmentFormData } from '../types/department';

export function useDepartments(organizationId: string | undefined) {
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const orgRes = await api.get(`/organizations/${organizationId}`);
        const orgRaw = orgRes.data;

        const orgInfo: OrganizationInfo = {
          id: orgRaw.organizationId ?? organizationId,
          name: orgRaw.name ?? '(sans nom)',
          description: orgRaw.description ?? '',
          stats: {
            totalEmployees: orgRaw.totalEmployees ?? 0,
            activeDepartments: orgRaw.activeDepartments ?? 0,
            monthlyInterventions: orgRaw.monthlyInterventions ?? 0,
            avgSatisfaction: orgRaw.avgSatisfaction ?? 0
          },
          createdBy: orgRaw.createdBy,
          createdAt: orgRaw.createdAt
        };
        setOrganization(orgInfo);

        const deptRes = await api.get(`/organizations/${organizationId}/departments`);
        const depts: Department[] = (deptRes.data as any[]).map(d => ({
          id: d.departmentId,
          name: d.name,
          manager: d.manager,
          employeeCount: d.employeeCount,
          phone: d.phone,
          contactEmail: d.contactEmail,
          status: d.status,
          description: d.description,
          budget: d.budget,
          createdAt: d.createdAt || new Date().toISOString()
        }));
        setDepartments(depts);
      } catch (err) {
        console.error('[useDepartments] fetch error:', err);
        setError('Impossible de récupérer les données du serveur.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizationId]);

  const createDepartment = async (formData: DepartmentFormData) => {
    const payload = {
      ...formData,
      organizationId
    };

    const response = await api.post<Department>(
      `/organizations/${organizationId}/departments`,
      payload
    );
    setDepartments([...departments, response.data]);
  };

  const updateDepartment = async (departmentId: string, formData: DepartmentFormData) => {
    const payload = {
      ...formData,
      organizationId
    };

    const response = await api.put(`/organizations/${organizationId}/departments/${departmentId}`, payload);
    setDepartments(depts => 
      depts.map(d => d.id === departmentId ? response.data : d)
    );
  };

  const deleteDepartment = async (departmentId: string) => {
    await api.delete(`/organizations/${organizationId}/departments/${departmentId}`);
    setDepartments(depts => depts.filter(d => d.id !== departmentId));
  };

  return {
    organization,
    departments,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment
  };
}