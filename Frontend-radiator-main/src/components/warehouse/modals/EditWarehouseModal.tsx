// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Alert, Box, Stack, TextField, Typography } from '@mui/material';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';

const EditWarehouseModal = ({ isOpen, onClose, onSuccess, warehouse }) => {
  const [form, setForm] = useState({ name: '', code: '', location: '', address: '', phone: '', email: '' }); const [errors, setErrors] = useState({}); const [loading, setLoading] = useState(false);
  useEffect(() => { if (isOpen && warehouse) { setForm({ name: warehouse.name || '', code: warehouse.code || '', location: warehouse.location || '', address: warehouse.address || '', phone: warehouse.phone || '', email: warehouse.email || '' }); setErrors({}); setLoading(false); } }, [isOpen, warehouse]);
  const change = (field, value) => { setForm((previous) => ({ ...previous, [field]: value })); if (errors[field]) setErrors((previous) => ({ ...previous, [field]: '' })); };
  const validate = () => { const next = {}; if (!form.name.trim()) next.name = 'Warehouse name is required'; if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address'; if (form.phone && !/^[\d\s+()-]+$/.test(form.phone)) next.phone = 'Enter a valid phone number'; setErrors(next); return Object.keys(next).length === 0; };
  const submit = async () => { if (!validate()) return; setLoading(true); try { await onSuccess({ name: form.name.trim(), code: form.code.trim().toUpperCase(), location: form.location.trim() || null, address: form.address.trim() || null, phone: form.phone.trim() || null, email: form.email.trim() || null }); } catch (error) { setErrors({ submit: error.message || 'Failed to update warehouse' }); setLoading(false); } };
  if (!warehouse) return null;
  const field = (name, label, props = {}) => <TextField fullWidth size="small" label={label} value={form[name]} onChange={(event) => change(name, event.target.value)} error={Boolean(errors[name])} helperText={errors[name]} disabled={loading} {...props} />;
  return <Modal isOpen={isOpen} onClose={onClose} title={`Edit Warehouse - ${warehouse.name}`} size="md"><Stack spacing={2}>
    {errors.submit && <Alert severity="error">{errors.submit}</Alert>}
    {field('name', 'Warehouse Name', { required: true })}
    <TextField fullWidth size="small" label="Warehouse Code" value={form.code} disabled /><Typography variant="caption" color="text.secondary">Warehouse code cannot be changed after creation.</Typography>
    {field('location', 'Location')}{field('address', 'Address', { multiline: true, rows: 2 })}
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} gap={2}>{field('phone', 'Phone', { type: 'tel' })}{field('email', 'Email', { type: 'email' })}</Box>
    <Stack direction="row" justifyContent="flex-end" spacing={1.5} pt={2} borderTop={1} borderColor="divider"><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button onClick={submit} loading={loading} disabled={loading}>Update Warehouse</Button></Stack>
  </Stack></Modal>;
};
export default EditWarehouseModal;
