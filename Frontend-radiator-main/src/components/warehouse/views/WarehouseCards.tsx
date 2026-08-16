// @ts-nocheck
import React, { useState } from 'react';
import { Warehouse, MapPin, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Avatar, Box, Card, Chip, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material';

export default function WarehouseCards({ items, isAdmin, onView, onEdit, onDelete }) {
  const [menu, setMenu] = useState(null);
  const close = () => setMenu(null);
  const run = (action) => { action(menu?.warehouse); close(); };
  return <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={3}>
    {items.map((warehouse) => <Card key={warehouse.id} variant="outlined" sx={{ p: 3, transition: 'box-shadow .2s', '&:hover': { boxShadow: 4 } }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between"><Stack direction="row" alignItems="center" spacing={1.5}><Avatar variant="rounded" sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}><Warehouse size={24} /></Avatar><Box><Typography fontWeight={600}>{warehouse.name}</Typography><Chip size="small" label={warehouse.code} color="primary" variant="outlined" sx={{ mt: 0.5 }} /></Box></Stack>{isAdmin && <IconButton size="small" onClick={(event) => setMenu({ anchor: event.currentTarget, warehouse })}><MoreVertical size={18} /></IconButton>}</Stack>
        {warehouse.location && <Stack direction="row" alignItems="flex-start" spacing={1} color="text.secondary"><MapPin size={18} /><Typography variant="body2">{warehouse.location}</Typography></Stack>}
      </Stack>
    </Card>)}
    <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={close}><MenuItem onClick={() => run(onView)}><ListItemIcon><Eye size={18} /></ListItemIcon><ListItemText>View Details</ListItemText></MenuItem><MenuItem onClick={() => run(onEdit)}><ListItemIcon><Edit size={18} /></ListItemIcon><ListItemText>Edit</ListItemText></MenuItem><MenuItem onClick={() => run(onDelete)} sx={{ color: 'error.main' }}><ListItemIcon><Trash2 size={18} /></ListItemIcon><ListItemText>Delete</ListItemText></MenuItem></Menu>
  </Box>;
}
