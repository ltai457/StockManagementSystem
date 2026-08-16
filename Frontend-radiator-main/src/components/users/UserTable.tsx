// @ts-nocheck
import React from 'react';
import { Edit, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { Avatar, Box, Card, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { isAdminRole } from '../../utils/roles';

const UserTable = ({ users, currentUser, onEdit, onDelete }) => {
  const roleBadge = (role) => <Chip size="small" icon={isAdminRole(role) ? <Shield size={14} /> : <UserIcon size={14} />} label={isAdminRole(role) ? 'Admin' : 'Staff'} color={isAdminRole(role) ? 'secondary' : 'primary'} variant="outlined" />;
  const formatDate = (value) => value ? new Date(value).toLocaleDateString() : 'N/A';
  const initials = (user) => `${user.firstName?.[0] || user.username?.[0]?.toUpperCase() || ''}${user.lastName?.[0] || user.username?.[1]?.toUpperCase() || ''}`;
  const name = (user) => user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
  const actions = (user, current) => <Stack direction="row" justifyContent="flex-end" spacing={0.5}><Tooltip title="Edit user"><span><IconButton color="warning" onClick={() => onEdit(user)} disabled={current}><Edit size={18} /></IconButton></span></Tooltip><Tooltip title="Deactivate user"><span><IconButton color="error" onClick={() => onDelete(user)} disabled={current}><Trash2 size={18} /></IconButton></span></Tooltip></Stack>;

  return <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
    <Stack divider={<Box borderTop={1} borderColor="divider" />} sx={{ display: { xs: 'flex', md: 'none' } }}>
      {users.map((user) => { const current = currentUser.id === user.id; return <Card key={user.id} square elevation={0} sx={{ p: 2, bgcolor: current ? 'action.selected' : 'background.paper' }}>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}><Stack direction="row" alignItems="center" spacing={1.5} minWidth={0}><Avatar>{initials(user)}</Avatar><Box minWidth={0}><Typography variant="body2" fontWeight={600} noWrap>{name(user)}{current && <Typography component="span" variant="caption" color="primary.main" ml={1}>(You)</Typography>}</Typography><Typography variant="caption" color="text.secondary" noWrap display="block">{user.email}</Typography></Box></Stack>{roleBadge(user.role)}</Stack>
          <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1.5}><Detail label="Username" value={user.username} /><Box><Typography variant="caption" color="text.secondary">Status</Typography><Box mt={0.5}><Chip size="small" label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'default'} /></Box></Box><Detail label="Created" value={formatDate(user.createdAt)} /></Box>
          <Box pt={1} borderTop={1} borderColor="divider">{actions(user, current)}</Box>
        </Stack>
      </Card>; })}
    </Stack>
    <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}><Table sx={{ minWidth: 900 }}><TableHead><TableRow>{['Name','Email','Username','Role','Status','Created'].map((label) => <TableCell key={label} sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>{label}</TableCell>)}<TableCell align="right" sx={{ fontWeight: 600, bgcolor: 'grey.50' }}>Actions</TableCell></TableRow></TableHead><TableBody>
      {users.map((user) => { const current = currentUser.id === user.id; return <TableRow key={user.id} hover selected={current}><TableCell><Stack direction="row" alignItems="center" spacing={1.5}><Avatar>{initials(user)}</Avatar><Typography variant="body2" fontWeight={600}>{name(user)}{current && <Typography component="span" variant="caption" color="primary.main" ml={1}>(You)</Typography>}</Typography></Stack></TableCell><TableCell>{user.email}</TableCell><TableCell>{user.username}</TableCell><TableCell>{roleBadge(user.role)}</TableCell><TableCell><Chip size="small" label={user.isActive ? 'Active' : 'Inactive'} color={user.isActive ? 'success' : 'default'} /></TableCell><TableCell>{formatDate(user.createdAt)}</TableCell><TableCell align="right">{actions(user, current)}</TableCell></TableRow>; })}
    </TableBody></Table></TableContainer>
  </Paper>;
};

const Detail = ({ label, value }) => <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2" fontWeight={500}>{value}</Typography></Box>;
export default UserTable;
