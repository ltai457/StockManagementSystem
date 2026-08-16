// @ts-nocheck
import React, { useState } from 'react';
import { Alert, Box, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import { Button } from '../../common/ui/Button';
import { Modal } from '../../common/ui/Modal';

const initialForm = { firstName: '', lastName: '', email: '', username: '', password: '', confirmPassword: '', role: 2, isActive: true };

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: '' }));
  };

  const validateForm = () => {
    const next = {};
    if (!formData.firstName.trim()) next.firstName = 'First name is required';
    if (!formData.lastName.trim()) next.lastName = 'Last name is required';
    if (!formData.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Email is invalid';
    if (!formData.username.trim()) next.username = 'Username is required';
    else if (formData.username.length < 3) next.username = 'Username must be at least 3 characters';
    if (!formData.password) next.password = 'Password is required';
    else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => { setFormData(initialForm); setErrors({}); onClose(); };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const { confirmPassword: _confirmPassword, ...values } = formData;
    const success = await onSuccess({ ...values, role: Number(values.role) });
    setLoading(false);
    if (success) handleClose();
  };

  const field = (name, label, type = 'text') => (
    <TextField fullWidth size="small" name={name} label={label} type={type} value={formData[name]} onChange={handleChange} error={Boolean(errors[name])} helperText={errors[name]} required />
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New User">
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={2}>{field('firstName', 'First Name')}{field('lastName', 'Last Name')}</Box>
          {field('email', 'Email', 'email')}
          {field('username', 'Username')}
          <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={2}>{field('password', 'Password', 'password')}{field('confirmPassword', 'Confirm Password', 'password')}</Box>
          <TextField select fullWidth size="small" name="role" label="Role" value={formData.role} onChange={handleChange}>
            <MenuItem value={1}>Administrator</MenuItem><MenuItem value={2}>Staff</MenuItem>
          </TextField>
          <Typography variant="caption" color="text.secondary">Administrators have full access. Staff have limited permissions.</Typography>
          <FormControlLabel control={<Switch name="isActive" checked={formData.isActive} onChange={handleChange} />} label="Active (User can log in)" />
          <Stack direction="row" justifyContent="flex-end" spacing={1.5} pt={2} borderTop={1} borderColor="divider">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Cancel</Button>
            <Button type="submit" loading={loading} disabled={loading}>Create User</Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default AddUserModal;
