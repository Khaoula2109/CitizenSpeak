import { useState, useEffect } from 'react';
import api from '../utils/api';
import { UserAccount, BackendUser, Organization, Department, NewUserForm } from '../types/accounts';
import { emptyUserForm } from '../constants/accountsConstants';

export function useAccounts() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [selectedRole, setSelectedRole] = useState<'admin'|'analyst'|'agent'|null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount|null>(null);
  const [newUser, setNewUser] = useState<NewUserForm>(emptyUserForm);
  const [formErrors, setFormErrors] = useState<Partial<NewUserForm>>({});
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    api.get<BackendUser[]>('/user/all')
      .then(res => {
        const list = res.data.map(u => {
          const fullName = u.name || '';
          const parts = fullName.trim().split(/\s+/);
          const initials = (
            (parts[0]?.[0] || '') +
            (parts[1]?.[0] || '')
          ).toUpperCase();
          return {
            id: u.userId ?? '',
            fullName: u.name ?? '',
            email: u.email ?? '',
            phone: u.phone ?? '',
            role: u.role.toLowerCase() as 'admin'|'analyst'|'agent',
            service: u.service ?? '',
            departmentName: u.department?.name ?? '',
            departmentId: u.department?.id ?? '',
            active: u.active ?? false,
            photo: u.photoUrl || undefined,
            initials
          } as UserAccount;
        });
        setUsers(list);
      })
      .catch(console.error);

    api.get<Organization[]>('/organizations')
      .then(res => { setOrganizations(res.data); })
      .catch(console.error);
  }, []);

  const filteredUsers = users.filter(u =>
    (!selectedRole || u.role === selectedRole) &&
    (
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleToggleStatus = async (user: UserAccount) => {
    const newStatus = !user.active;
    try {
      await api.put('/user/update', {
        email: user.email,
        name: user.fullName,
        phone: user.phone,
        role: user.role,
        active: newStatus,
        extra: user.role === 'agent' ? user.service : ''
      });
      setUsers(us =>
        us.map(u =>
          u.id === user.id ? { ...u, active: newStatus } : u
        )
      );
    } catch {
      alert('Impossible de changer le statut');
    }
  };

  const validateForm = () => {
    const errors: Partial<NewUserForm> = {};
    if (!newUser.fullName) errors.fullName = 'Le nom complet est requis';
    if (!newUser.email) errors.email = 'L\'email est requis';
    if (!newUser.phone) errors.phone = 'Le téléphone est requis';
    if (!newUser.password) errors.password = 'Le mot de passe est requis';
    if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (newUser.role === 'agent') {
      if (!newUser.service) errors.service = 'Le service est requis';
      if (!newUser.organizationId) errors.organizationId = 'L\'organisme est requis';
      if (!newUser.departmentId) errors.departmentId = 'Le département est requis';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      password: newUser.password,
      extra: newUser.service,
      organizationId: newUser.organizationId,
      departmentId: newUser.departmentId
    };

    try {
      const res = await api.post<BackendUser>('/user/create', payload);
      const u = res.data;

      setUsers(us => [
        ...us,
        {
          id: u.userId ?? '',
          fullName: u.name || '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          role: (u.role.toLowerCase() as 'admin'|'analyst'|'agent'),
          service: u.service ?? '',
          departmentName: u.department?.name ?? '',
          departmentId: u.department?.id ?? '',
          active: u.active ?? false
        }
      ]);

      setShowNewUserModal(false);
      setNewUser({ ...emptyUserForm, role: newUser.role });
      setFormErrors({});
    } catch {
      alert('Erreur lors de la création');
    }
  };

  const handleRoleSelect = (r: 'admin'|'analyst'|'agent') => {
    setSelectedRole(r);
    setNewUser({ ...emptyUserForm, role: r });
  };

  const handleNewUser = () => { 
    if (selectedRole) {
      setNewUser({ ...emptyUserForm, role: selectedRole }); 
      setShowNewUserModal(true); 
    }  
  };

  const handleViewUser = (u: UserAccount) => { 
    setSelectedUser(u); 
    setShowUserInfoModal(true); 
  };

  const handleEditPassword = (u: UserAccount) => { 
    setSelectedUser(u); 
    setShowPasswordModal(true); 
  };

  const handleCloseUserInfo = () => { 
    setShowUserInfoModal(false); 
    setSelectedUser(null); 
  };

  const loadDepartments = (orgId: string) => {
    if (orgId) {
      api.get<Department[]>(`/organizations/${orgId}/departments`)
        .then(res => { setDepartments(res.data); })
        .catch(console.error);
    }
  };

  return {
    users,
    filteredUsers,
    selectedRole,
    searchTerm,
    showNewUserModal,
    showPasswordModal,
    showUserInfoModal,
    selectedUser,
    newUser,
    formErrors,
    organizations,
    departments,
    setSearchTerm,
    setShowNewUserModal,
    setNewUser,
    handleToggleStatus,
    handleSubmitNewUser,
    handleRoleSelect,
    handleNewUser,
    handleViewUser,
    handleEditPassword,
    handleCloseUserInfo,
    loadDepartments
  };
}