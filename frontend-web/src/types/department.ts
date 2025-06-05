export interface Department {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
  phone: string;
  contactEmail: string;
  status: 'active' | 'inactive';
  description?: string;
  budget?: number;
  createdAt: string;
}

export interface OrganizationInfo {
  id: string;
  name: string;
  description: string;
  stats: {
    totalEmployees: number;
    activeDepartments: number;
    monthlyInterventions: number;
    avgSatisfaction: number;
  };
  createdBy: string;
  createdAt: string;
}

export interface DepartmentFormData {
  name: string;
  manager: string;
  employeeCount: number;
  phone: string;
  contactEmail: string;
  status: 'active' | 'inactive';
  description: string;
  budget: number;
}