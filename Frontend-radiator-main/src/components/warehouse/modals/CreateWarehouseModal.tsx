// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Alert, Box, Stack, TextField, Typography } from '@mui/material';
import { Modal } from '../../common/ui/Modal';
import { Button } from '../../common/ui/Button';

const emptyForm = { name: '', code: '', location: '', address: '', phone: '', email: '' };
const CreateWarehouseModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState(emptyForm); const [errors, setErrors] = useState({}); const [loading, setLoading] = useState(false);
  useEffect(() => { if (!isOpen) { setForm(emptyForm); setErrors({}); setLoading(false); } }, [isOpen]);
  const change = (field, value) => { setForm((previous) => ({ ...previous, [field]: value })); if (errors[field]) setErrors((previous) => ({ ...previous, [field]: '' })); };
  const validate = () => { const next = {}; if (!form.name.trim()) next.name = 'Warehouse name is required'; if (!form.code.trim()) next.code = 'Warehouse code is required'; else if (!/^[A-Z0-9_]{2,10}$/.test(form.code.toUpperCase())) next.code = 'Use 2–10 letters, numbers, or underscores'; if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address'; if (form.phone && !/^[\d\s+()-]+$/.test(form.phone)) next.phone = 'Enter a valid phone number'; setErrors(next); return Object.keys(next).length === 0; };
  const submit = async () => { if (!validate()) return; setLoading(true); try { await onSuccess({ name: form.name.trim(), code: form.code.toUpperCase().trim(), location: form.location.trim() || null, address: form.address.trim() || null, phone: form.phone.trim() || null, email: form.email.trim() || null }); setForm(emptyForm); setErrors({}); } catch (error) { setErrors({ submit: error.message || 'Failed to create warehouse' }); setLoading(false); } };
  const field = (name, label, props = {}) => <TextField fullWidth size="small" label={label} value={form[name]} onChange={(event) => change(name, name === 'code' ? event.target.value.toUpperCase() : event.target.value)} error={Boolean(errors[name])} helperText={errors[name]} disabled={loading} {...props} />;
  return <Modal isOpen={isOpen} onClose={onClose} title="Create New Warehouse" size="md"><Stack spacing={2}>
    {errors.submit && <Alert severity="error">{errors.submit}</Alert>}
    {field('name', 'Warehouse Name', { required: true, placeholder: 'Auckland Main Warehouse' })}
    {field('code', 'Warehouse Code', { required: true, placeholder: 'AKL', slotProps: { htmlInput: { maxLength: 10 } } })}
    <Typography variant="caption" color="text.secondary">This code tracks stock levels and cannot be changed later.</Typography>
    {field('location', 'Location', { placeholder: 'Auckland, New Zealand' })}
    {field('address', 'Address', { multiline: true, rows: 2, placeholder: 'Street address, city, postal code' })}
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} gap={2}>{field('phone', 'Phone', { type: 'tel' })}{field('email', 'Email', { type: 'email' })}</Box>
    <Stack direction="row" justifyContent="flex-end" spacing={1.5} pt={2} borderTop={1} borderColor="divider"><Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button><Button onClick={submit} loading={loading} disabled={loading}>Create Warehouse</Button></Stack>
  </Stack></Modal>;
};
export default CreateWarehouseModal;
