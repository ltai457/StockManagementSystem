// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { SearchInput } from '../common/ui/SearchInput';
import { Button } from '../common/ui/Button';
import { MenuItem, Paper, Stack, TextField } from '@mui/material';

const RadiatorFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  radiators
}) => {
  // Local state for immediate search input display
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Update local input when external filters change (e.g., when cleared)
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Get unique brands and types for filter options
  const brands = [...new Set(radiators.map(r => r.brand))].sort();
  const types = [...new Set(radiators.map(r => r.type).filter(Boolean))].sort();

  const handleSearchChange = (value) => {
    // Update input immediately for responsive UI
    setSearchInput(value);
    // This will be debounced by useFilters hook
    onFilterChange('search', value);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    onFilterChange('search', '');
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <Stack flex={1}>
            <SearchInput
              value={searchInput}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              placeholder="Search radiators..."
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField select size="small" label="Brand"
              value={filters.brand || 'all'}
              onChange={(e) => onFilterChange('brand', e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Brands</MenuItem>
              {brands.map(brand => (
                <MenuItem key={brand} value={brand}>{brand}</MenuItem>
              ))}
            </TextField>

            <TextField select size="small" label="Type"
              value={filters.type || 'all'}
              onChange={(e) => onFilterChange('type', e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              {types.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>

            {hasActiveFilters ? (
              <Button variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            ) : null}
          </Stack>
        </Stack>
    </Paper>
  );
};

export default RadiatorFilters;
