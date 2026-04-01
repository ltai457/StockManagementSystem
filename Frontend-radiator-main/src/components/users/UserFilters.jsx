// src/components/users/UserFilters.jsx
import React from 'react';
import { SearchInput } from '../common/ui/SearchInput';

const UserFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <SearchInput
            value={filters.search}
            onChange={(value) => onFilterChange({ ...filters, search: value })}
            onClear={() => onFilterChange({ ...filters, search: '' })}
            placeholder="Search users..."
          />
        </div>

        <div>
          <select
            value={filters.role}
            onChange={(e) => onFilterChange({ ...filters, role: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <div>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
