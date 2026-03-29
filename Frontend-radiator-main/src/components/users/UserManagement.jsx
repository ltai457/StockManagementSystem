// src/components/users/UserManagement.jsx
import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { useUsers } from '../../hooks/useUsers';
import { useModal } from '../../hooks/useModal';
import { PageHeader } from '../common/layout/PageHeader';
import { LoadingSpinner } from '../common/ui/LoadingSpinner';
import { Button } from '../common/ui/Button';
import { EmptyState } from '../common/layout/EmptyState';
import AccessDeniedState from '../common/feedback/AccessDeniedState';
import UserStats from './UserStats';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import AddUserModal from './modals/AddUserModal';
import EditUserModal from './modals/EditUserModal';
import { isAdminRole, isAdminUser } from '../../utils/roles';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const addModal = useModal();
  const editModal = useModal();

  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  });

  // Check if current user is admin
  const isAdmin = isAdminUser(currentUser);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower);

    const matchesRole = 
      filters.role === 'all' ||
      (filters.role === 'admin' && isAdminRole(user.role)) ||
      (filters.role === 'staff' && !isAdminRole(user.role));

    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'active' && user.isActive) ||
      (filters.status === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = async (userData) => {
    const result = await createUser(userData);
    if (result.success) {
      addModal.closeModal();
      return true;
    }
    return false;
  };

  const handleEditUser = async (userData) => {
    const result = await updateUser(editModal.data.id, userData);
    if (result.success) {
      editModal.closeModal();
      return true;
    }
    return false;
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    const result = await deleteUser(user.id);
    if (!result.success) {
      alert('Failed to deactivate user: ' + result.error);
    }
  };

  if (!isAdmin) {
    return <AccessDeniedState message="You don't have permission to access user management." />;
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage system users and their roles"
        icon={Users}
        actions={
          <Button onClick={() => addModal.openModal()} icon={Plus}>
            Add New User
          </Button>
        }
      />

      <UserStats users={users} />

      <UserFilters filters={filters} onFilterChange={setFilters} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="No users match your current filters"
          action={filters.search || filters.role !== 'all' || filters.status !== 'all'}
          actionLabel="Clear filters"
          onAction={() => setFilters({ search: '', role: 'all', status: 'all' })}
        />
      ) : (
        <UserTable
          users={filteredUsers}
          currentUser={currentUser}
          onEdit={editModal.openModal}
          onDelete={handleDeleteUser}
        />
      )}

      <AddUserModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        onSuccess={handleAddUser}
      />

      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSuccess={handleEditUser}
        user={editModal.data}
      />
    </div>
  );
};

export default UserManagement;
