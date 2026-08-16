// @ts-nocheck
// src/components/users/UserFilters.jsx
import React from 'react';
import { SearchInput } from '../common/ui/SearchInput';
import { MenuItem, Paper, TextField } from '@mui/material';

const UserFilters = ({ filters, onFilterChange }) => {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <div>
          <SearchInput
            value={filters.search}
            onChange={(value) => onFilterChange({ ...filters, search: value })}
            onClear={() => onFilterChange({ ...filters, search: '' })}
            placeholder="Search users..."
          />
        </div>

        <div>
          <TextField select size="small" label="Role" fullWidth
            value={filters.role}
            onChange={(e) => onFilterChange({ ...filters, role: e.target.value })}
          >
            <MenuItem value="all">All Roles</MenuItem><MenuItem value="admin">Administrators</MenuItem><MenuItem value="staff">Staff</MenuItem>
          </TextField>
        </div>

        <div>
          <TextField select size="small" label="Status" fullWidth
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          >
            <MenuItem value="all">All Status</MenuItem><MenuItem value="active">Active</MenuItem><MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </div>
    </Paper>
  );
};

export default UserFilters;
