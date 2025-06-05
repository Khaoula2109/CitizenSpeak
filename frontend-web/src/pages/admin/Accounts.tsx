import React from 'react';
import { useAccounts } from '../../hooks/useAccounts';
import { roleCards, emptyUserForm } from '../../constants/accountsConstants';
import { AccountsHeader } from '../../components/accounts/AccountsHeader';
import { RoleCard } from '../../components/accounts/RoleCard';
import { UsersTableHeader } from '../../components/accounts/UsersTableHeader';
import { UsersTable } from '../../components/accounts/UsersTable';
import { NewUserModal } from '../../components/accounts/NewUserModal';

export function Accounts() {
  const {
    users,
    filteredUsers,
    selectedRole,
    searchTerm,
    showNewUserModal,
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
    loadDepartments
  } = useAccounts();

  const handleCloseModal = () => {
    setShowNewUserModal(false);
    if (selectedRole) {
      setNewUser({ ...emptyUserForm, role: selectedRole });
    }
  };

  const handleUserFormChange = (updates: Partial<typeof newUser>) => {
    setNewUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <AccountsHeader />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roleCards.map(card => {
            const count = users.filter(u => u.role === card.role).length;
            const isSelected = selectedRole === card.role;
            return (
              <RoleCard
                key={card.role}
                card={card}
                count={count}
                isSelected={isSelected}
                onSelect={handleRoleSelect}
              />
            );
          })}
        </div>

        {selectedRole && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-primary-200/20 dark:border-gray-700 overflow-hidden">
            <UsersTableHeader
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedRole={selectedRole}
              onNewUser={handleNewUser}
            />
            <UsersTable
              users={filteredUsers}
              selectedRole={selectedRole}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        )}

        <NewUserModal
          show={showNewUserModal}
          selectedRole={selectedRole}
          newUser={newUser}
          formErrors={formErrors}
          organizations={organizations}
          departments={departments}
          onClose={handleCloseModal}
          onSubmit={handleSubmitNewUser}
          onChange={handleUserFormChange}
          onLoadDepartments={loadDepartments}
        />
      </div>
    </div>
  );
}