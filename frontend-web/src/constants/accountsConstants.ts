import { Shield, UserCog, Building2 } from 'lucide-react';
import { RoleCard, NewUserForm } from '../types/accounts';

export const roleCards: RoleCard[] = [
  { 
    role: 'admin', 
    title: 'Administrateurs', 
    icon: Shield, 
    description: 'Gestion complète du système',
    colorClass: 'primary-800' 
  },
  { 
    role: 'analyst', 
    title: 'Analystes', 
    icon: UserCog, 
    description: 'Analyse des données et rapports',
    colorClass: 'primary-700' 
  },
  { 
    role: 'agent', 
    title: 'Agents Communaux', 
    icon: Building2, 
    description: 'Gestion des plaintes sur le terrain',
    colorClass: 'primary-600' 
  }
];

export const emptyUserForm: NewUserForm = {
  fullName: '', 
  email: '', 
  phone: '',
  role: 'agent', 
  service: '', 
  organizationId: '', 
  departmentId: '',
  password: '', 
  confirmPassword: ''
};