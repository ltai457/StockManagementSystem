import React from "react";
import { Package } from "lucide-react";
import { EmptyState } from "../common/layout/EmptyState";
import { LoadingSpinner } from "../common/ui/LoadingSpinner";
import RadiatorCards from "./RadiatorCards";
import RadiatorFilters from "./RadiatorFilters";
import RadiatorStats from "./RadiatorStats";
import RadiatorTable from "./RadiatorTable";

const InventoryContent = ({
  radiators,
  sortedRadiators,
  filters,
  setFilter,
  clearFilters,
  hasActiveFilters,
  error,
  loading,
  hasMore,
  observerRef,
  editModal,
  handleDeleteRadiator,
  onEditStock,
  isAdmin,
  viewMode,
  warehouses,
  searchTerm,
}) => (
  <>
    <RadiatorStats radiators={radiators} />

    <RadiatorFilters
      filters={filters}
      onFilterChange={setFilter}
      onClearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
      radiators={radiators}
    />

    {error && (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {error}
      </div>
    )}

    {sortedRadiators.length === 0 && !loading ? (
      <EmptyState
        icon={Package}
        title={hasActiveFilters ? "No products found" : "No products yet"}
        description={
          hasActiveFilters
            ? "No products match your current filters"
            : "Start by adding your first product"
        }
        action={hasActiveFilters}
        actionLabel="Clear filters"
        onAction={clearFilters}
      />
    ) : (
      <>
        {viewMode === "cards" ? (
          <RadiatorCards
            radiators={sortedRadiators}
            warehouses={warehouses}
            searchTerm={searchTerm}
            onEdit={editModal.openModal}
            onDelete={handleDeleteRadiator}
            onEditStock={onEditStock}
            isAdmin={isAdmin}
          />
        ) : (
          <RadiatorTable
            radiators={sortedRadiators}
            warehouses={warehouses}
            searchTerm={searchTerm}
            onEdit={editModal.openModal}
            onDelete={handleDeleteRadiator}
            onEditStock={onEditStock}
            isAdmin={isAdmin}
          />
        )}

        {hasMore && (
          <div
            ref={observerRef}
            className="flex justify-center py-8"
          >
            {loading ? (
              <LoadingSpinner size="md" text="Loading more products..." />
            ) : (
              <div className="h-10" />
            )}
          </div>
        )}

        {!hasMore && sortedRadiators.length > 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">
            All products loaded ({sortedRadiators.length} total)
          </div>
        )}
      </>
    )}
  </>
);

export default InventoryContent;
