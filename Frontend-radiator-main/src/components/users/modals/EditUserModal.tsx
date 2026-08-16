// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Alert, Box, FormControlLabel, MenuItem, Stack, Switch, TextField } from '@mui/material';
import { Button } from '../../common/ui/Button';
import { Modal } from '../../common/ui/Modal';

const EditUserModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', username: '', role: 2, isActive: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (user) setFormData({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', username: user.username || '', role: user.role || 2, isActive: user.isActive ?? true }); }, [user]);
  const handleChange = (event) => { const { name, value, type, checked } = event.target; setFormData((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value })); if (errors[name]) setErrors((previous) => ({ ...previous, [name]: '' })); };
  const validate = () => { const next = {}; if (!formData.firstName.trim()) next.firstName = 'First name is required'; if (!formData.lastName.trim()) next.lastName = 'Last name is required'; if (!formData.email.trim()) next.email = 'Email is required'; else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Email is invalid'; if (!formData.username.trim()) next.username = 'Username is required'; else if (formData.username.length < 3) next.username = 'Username must be at least 3 characters'; setErrors(next); return Object.keys(next).length === 0; };
  const handleClose = () => { setErrors({}); onClose(); };
  const handleSubmit = async (event) => { event.preventDefault(); if (!validate()) return; setLoading(true); const success = await onSuccess({ ...formData, role: Number(formData.role) }); setLoading(false); if (success) handleClose(); };
  if (!user) return null;
  const field = (name, label, type = 'text') => <TextField fullWidth size="small" name={name} label={label} type={type} value={formData[name]} onChange={handleChange} error={Boolean(errors[name])} helperText={errors[name]} required />;
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit User">
      <Box component="form" onSubmit={handleSubmit}><Stack spacing={2}>
        <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={2}>{field('firstName', 'First Name')}{field('lastName', 'Last Name')}</Box>
        {field('email', 'Email', 'email')}{field('username', 'Username')}
        <TextField select fullWidth size="small" name="role" label="Role" value={formData.role} onChange={handleChange}><MenuItem value={1}>Administrator</MenuItem><MenuItem value={2}>Staff</MenuItem></TextField>
        <FormControlLabel control={<Switch name="isActive" checked={formData.isActive} onChange={handleChange} />} label="Active (User can log in)" />
        <Alert severity="info">To change the password, use the Reset Password feature or contact an administrator.</Alert>
        <Stack direction="row" justifyContent="flex-end" spacing={1.5} pt={2} borderTop={1} borderColor="divider"><Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button><Button type="submit" loading={loading} disabled={loading}>Update User</Button></Stack>
      </Stack></Box>
    </Modal>
  );
};
export default EditUserModal;
