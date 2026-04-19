// src/components/inventory/RadiatorList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useWarehouses } from "../../hooks/useWarehouses";
import { useModal } from "../../hooks/useModal";
import { useFilters } from "../../hooks/useFilters";
import { LoadingSpinner } from "../common/ui/LoadingSpinner";
import InventoryHeader from "./InventoryHeader";
import InventoryContent from "./InventoryContent";
import AddRadiatorModal from "./modals/AddRadiatorModal";
import EditRadiatorModal from "./modals/EditRadiatorModal";
import AdjustStockModal from "./modals/AdjustStockModal";
import radiatorService from "../../api/radiatorService";
import { isAdminUser } from "../../utils/roles";

const RadiatorList = () => {
  const { user } = useAuth();

  // Use infinite scroll hook with auto-scroll enabled
  const {
    items: radiators,
    loading,
    error,
    hasMore,
    refetch,
    observerRef,
  } = useInfiniteScroll(
    (pageNumber, pageSize) => radiatorService.getPaginated(pageNumber, pageSize),
    21, // page size (divisible by 3 for grid layout - prevents incomplete rows)
    true // enable auto-scroll
  );

  // CRUD operations without the hook (to avoid auto-fetching)
  const createRadiator = async (radiatorData) => {
    try {
      const result = await radiatorService.create(radiatorData);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateRadiator = async (id, radiatorData) => {
    try {
      const result = await radiatorService.update(id, radiatorData);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteRadiator = async (id) => {
    try {
      const result = await radiatorService.delete(id);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const { warehouses } = useWarehouses();

  const addModal = useModal();
  const editModal = useModal();
  const detailModal = useModal();
  const adjustStockModal = useModal();

  useEffect(() => {
    if (!detailModal.isOpen || !detailModal.data?.id) return;
    const fresh = radiators.find((r) => r.id === detailModal.data.id);
    if (fresh && fresh !== detailModal.data) {
      detailModal.openModal(fresh);
    }
  }, [radiators, detailModal]);

  const {
    filteredData: filteredRadiators,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
  } = useFilters(radiators, {
    search: "",
    brand: "all",
    type: "all",
  });

  // Sort order state
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("cards");

  // Sort filtered radiators based on selected sort option
  const sortedRadiators = useMemo(() => {
    const sorted = [...filteredRadiators];
    
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        });
      
      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateA - dateB;
        });
      
      case "name":
        return sorted.sort((a, b) => 
          (a.model || "").localeCompare(b.model || "")
        );
      
      case "brand":
        return sorted.sort((a, b) => 
          (a.brand || "").localeCompare(b.brand || "")
        );
      
      default:
        return sorted;
    }
  }, [filteredRadiators, sortBy]);

  const isAdmin = isAdminUser(user);

  const handleAddRadiator = async (radiatorData) => {
    const result = await createRadiator(radiatorData);

    if (result.success) {
      addModal.closeModal();
      // Refetch to get the new radiator
      refetch();
      return true;
    }
    return false;
  };

  const handleEditRadiator = async (radiatorData) => {
    const result = await updateRadiator(editModal.data.id, radiatorData);
    if (result.success) {
      editModal.closeModal();
      // Refetch to get updated data
      refetch();
      return true;
    }
    return false;
  };

  const handleDeleteRadiator = async (radiator) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${radiator.model || radiator.code}? This action cannot be undone.`
      )
    ) {
      return;
    }

    const result = await deleteRadiator(radiator.id);
    if (!result.success) {
      alert("Failed to delete radiator: " + result.error);
    } else {
      // Refetch after deletion
      refetch();
    }
  };

  if (loading && radiators.length === 0) {
    return <LoadingSpinner size="lg" text="Loading radiators..." />;
  }

  return (
    <div className="space-y-6">
      <InventoryHeader
        sortBy={sortBy}
        onSortChange={setSortBy}
        isAdmin={isAdmin}
        onAddProduct={addModal.openModal}
        radiators={sortedRadiators}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <InventoryContent
        radiators={radiators}
        sortedRadiators={sortedRadiators}
        filters={filters}
        setFilter={setFilter}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        error={error}
        loading={loading}
        hasMore={hasMore}
        observerRef={observerRef}
        editModal={editModal}
        handleDeleteRadiator={handleDeleteRadiator}
        onEditStock={adjustStockModal.openModal}
        isAdmin={isAdmin}
        viewMode={viewMode}
        warehouses={warehouses || []}
        searchTerm={filters.search || ""}
        detailModal={detailModal}
      />

      <AddRadiatorModal
        isOpen={addModal.isOpen}
        onClose={addModal.closeModal}
        onSuccess={handleAddRadiator}
        warehouses={warehouses || []}
      />

      <EditRadiatorModal
        isOpen={editModal.isOpen}
        onClose={editModal.closeModal}
        onSuccess={handleEditRadiator}
        radiator={editModal.data}
      />

      <AdjustStockModal
        isOpen={adjustStockModal.isOpen}
        radiator={adjustStockModal.data}
        warehouses={warehouses || []}
        onClose={adjustStockModal.closeModal}
        onSaved={refetch}
      />
    </div>
  );
};

export default RadiatorList;
