// @ts-nocheck
import React from "react";
import { Package } from "lucide-react";
import { Alert, Box, Typography } from "@mui/material";
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
      <Alert severity="error">{error}</Alert>
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
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <RadiatorCards
            radiators={sortedRadiators}
            searchTerm={searchTerm}
            onViewDetails={detailModal.openModal}
          />
        </Box>
        {/* Desktop: respect viewMode toggle */}
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
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
        </Box>

        {hasMore && (
          <Box ref={observerRef} display="flex" justifyContent="center" py={4}>
            {loading ? (
              <LoadingSpinner size="md" text="Loading more products..." />
            ) : (
              <Box height={40} />
            )}
          </Box>
        )}

        {!hasMore && sortedRadiators.length > 0 && (
          <Typography color="text.secondary" variant="body2" textAlign="center" py={3}>
            All products loaded ({sortedRadiators.length} total)
          </Typography>
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
      onEditStock={onEditStock}
    />
  </>
);

export default InventoryContent;
