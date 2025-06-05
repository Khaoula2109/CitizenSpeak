export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'analyst' | 'agent';
  service?: string;
  departmentName?: string;
  departmentId?: string;
  active: boolean;
  photo?: string;        
  initials?: string;
}

export interface BackendUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  service?: string;
  department?: { id: string; name: string };
  active?: boolean;
  photoUrl?: string;  
}

export interface Department {
  organizationId: string;
  name: string;
}

export interface Organization {
  departmentId: string;
  name: string;
}

export interface RoleCard {
  role: 'admin' | 'analyst' | 'agent';
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  colorClass: string;
}

export interface NewUserForm {
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'analyst' | 'agent';
  service?: string;
  organizationId?: string;
  departmentId?: string;
  password: string;
  confirmPassword: string;
}