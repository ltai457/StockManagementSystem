// @ts-nocheck
// src/components/users/UserTable.jsx
import React from 'react';
import { Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '../common/ui/Button';
import { isAdminRole } from '../../utils/roles';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';

const UserTable = ({ users, currentUser, onEdit, onDelete }) => {
  const getRoleBadge = (role) => {
    const isAdmin = isAdminRole(role);

    if (isAdmin) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <UserIcon className="w-3 h-3 mr-1" />
        Staff
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getUserInitials = (user) =>
    `${user.firstName?.[0] || user.username?.[0]?.toUpperCase() || ''}${user.lastName?.[0] || user.username?.[1]?.toUpperCase() || ''}`;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="md:hidden divide-y divide-gray-200">
        {users.map((user) => {
          const isCurrentUser = currentUser.id === user.id;

          return (
            <div key={user.id} className={`p-4 space-y-3 ${isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {getUserInitials(user)}
                    </span>
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-blue-600">(You)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Username:</span>
                  <div className="font-medium text-gray-900">{user.username}</div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <div>
                    {user.isActive ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <div className="text-gray-900">{formatDate(user.createdAt)}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(user)}
                  icon={Edit}
                  className="text-yellow-600 hover:text-yellow-800 min-w-[44px] min-h-[44px]"
                  title="Edit user"
                  disabled={isCurrentUser}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(user)}
                  icon={Trash2}
                  className="text-red-600 hover:text-red-800 min-w-[44px] min-h-[44px]"
                  title="Deactivate user"
                  disabled={isCurrentUser}
                />
              </div>
            </div>
          );
        })}
      </div>

      <TableContainer component={Paper} className="hidden md:block" sx={{ boxShadow: 'none' }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.50' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const isCurrentUser = currentUser.id === user.id;

              return (
                <TableRow
                  key={user.id}
                  hover
                  selected={isCurrentUser}
                  sx={{ '&.Mui-selected': { bgcolor: 'rgba(59, 130, 246, 0.08)' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: 'grey.300', color: 'text.primary', fontSize: 14 }}>
                        {getUserInitials(user)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.username}
                          {isCurrentUser && (
                            <Typography component="span" variant="caption" sx={{ ml: 1, color: 'primary.main' }}>
                              (You)
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.username}</Typography>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      variant={user.isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit user">
                      <span>
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => onEdit(user)}
                          disabled={isCurrentUser}
                        >
                          <Edit size={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Deactivate user">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(user)}
                          disabled={isCurrentUser}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default UserTable;
