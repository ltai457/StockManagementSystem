import React, { useState, useEffect } from 'react';
import { SearchInput } from '../common/ui/SearchInput';
import { Button } from '../common/ui/Button';

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
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={searchInput}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              placeholder="Search radiators..."
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filters.brand || 'all'}
              onChange={(e) => onFilterChange('brand', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={filters.type || 'all'}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={onClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiatorFilters;
