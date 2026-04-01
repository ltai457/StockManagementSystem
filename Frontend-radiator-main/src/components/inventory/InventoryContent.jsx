import React from "react";
import { Package } from "lucide-react";
import { EmptyState } from "../common/layout/EmptyState";
import { LoadingSpinner } from "../common/ui/LoadingSpinner";
import RadiatorCards from "./RadiatorCards";
import RadiatorFilters from "./RadiatorFilters";
import RadiatorStats from "./RadiatorStats";
import RadiatorTable from "./RadiatorTable";
import RadiatorDetailModal from "./MobileRadiatorDetailModal";

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
  detailModal,
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
        {/* Force cards view on mobile */}
        <div className="sm:hidden">
          <RadiatorCards
            radiators={sortedRadiators}
            searchTerm={searchTerm}
            onViewDetails={detailModal.openModal}
          />
        </div>
        {/* Desktop: respect viewMode toggle */}
        <div className="hidden sm:block">
          {viewMode === "cards" ? (
            <RadiatorCards
              radiators={sortedRadiators}
              searchTerm={searchTerm}
              onViewDetails={detailModal.openModal}
            />
          ) : (
            <RadiatorTable
              radiators={sortedRadiators}
              warehouses={warehouses}
              searchTerm={searchTerm}
              onViewDetails={detailModal.openModal}
              onEdit={editModal.openModal}
              onDelete={handleDeleteRadiator}
              onEditStock={onEditStock}
              isAdmin={isAdmin}
            />
          )}
        </div>

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

    <RadiatorDetailModal
      isOpen={detailModal.isOpen}
      radiator={detailModal.data}
      isAdmin={isAdmin}
      searchTerm={searchTerm}
      onClose={detailModal.closeModal}
      onEdit={(radiator) => {
        detailModal.closeModal();
        editModal.openModal(radiator);
      }}
      onDelete={(radiator) => {
        detailModal.closeModal();
        handleDeleteRadiator(radiator);
      }}
      onEditStock={(radiator) => {
        detailModal.closeModal();
        onEditStock(radiator);
      }}
    />
  </>
);

export default InventoryContent;
