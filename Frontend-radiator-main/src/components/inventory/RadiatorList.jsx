// src/components/inventory/RadiatorList.jsx
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Package,
  Plus,
  List as ListIcon,
  Grid as GridIcon,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useWarehouses } from "../../hooks/useWarehouses";
import { useModal } from "../../hooks/useModal";
import { useFilters } from "../../hooks/useFilters";
import { LoadingSpinner } from "../common/ui/LoadingSpinner";
import { Button } from "../common/ui/Button";
import { EmptyState } from "../common/layout/EmptyState";
import RadiatorFilters from "./RadiatorFilters";
import RadiatorTable from "./RadiatorTable";
import RadiatorCards from "./RadiatorCards";
import RadiatorStats from "./RadiatorStats";
import AddRadiatorModal from "./modals/AddRadiatorModal";
import EditRadiatorModal from "./modals/EditRadiatorModal";
import radiatorService from "../../api/radiatorService";

const RadiatorList = () => {
  const { user } = useAuth();

  // Use infinite scroll hook with auto-scroll enabled
  const {
    items: radiators,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    observerRef,
  } = useInfiniteScroll(
    (pageNumber, pageSize) => radiatorService.getPaginated(pageNumber, pageSize),
    21, // page size (divisible by 3 for grid layout - prevents incomplete rows)
    true // enable auto-scroll
  );

  // CRUD operations without the hook (to avoid auto-fetching)
  const createRadiator = async (radiatorData, imageFile = null) => {
    try {
      const result = await radiatorService.create(radiatorData, imageFile);
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
  const stockModal = useModal();

  const {
    filteredData: filteredRadiators,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
  } = useFilters(radiators, {
    search: "",
    brand: "all",
    year: "all",
  });

  // Sort order state
  const [sortBy, setSortBy] = useState("newest");

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
          (a.name || "").localeCompare(b.name || "")
        );
      
      case "brand":
        return sorted.sort((a, b) => 
          (a.brand || "").localeCompare(b.brand || "")
        );
      
      default:
        return sorted;
    }
  }, [filteredRadiators, sortBy]);

  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("radiatorViewMode") || "list"
  );
  
  useEffect(() => {
    localStorage.setItem("radiatorViewMode", viewMode);
  }, [viewMode]);

  const isAdmin =
    user?.role === 1 ||
    user?.role === "1" ||
    user?.role === "Admin" ||
    user?.role === "admin" ||
    (Array.isArray(user?.role) &&
      user.role.map(String).some((r) => r.toLowerCase() === "admin" || r === "1"));

  const handleAddRadiator = async (radiatorData, imageFile) => {
    const result = await createRadiator(radiatorData, imageFile);

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
        `Are you sure you want to delete ${radiator.name}? This action cannot be undone.`
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your radiator products and stock levels
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
            <option value="brand">Brand (A-Z)</option>
          </select>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            icon={ListIcon}
          >
            List
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("card")}
            icon={GridIcon}
          >
            Card
          </Button>

          {isAdmin && (
            <Button onClick={() => addModal.openModal()} icon={Plus}>
              Add Radiator
            </Button>
          )}
        </div>
      </div>

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
          title={hasActiveFilters ? "No radiators found" : "No radiators yet"}
          description={
            hasActiveFilters
              ? "No radiators match your current filters"
              : "Start by adding your first radiator"
          }
          action={hasActiveFilters}
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          {viewMode === "list" ? (
            <RadiatorTable
              radiators={sortedRadiators}
              onEdit={editModal.openModal}
              onDelete={handleDeleteRadiator}
              onEditStock={stockModal.openModal}
              isAdmin={isAdmin}
            />
          ) : (
            <RadiatorCards
              radiators={sortedRadiators}
              onEdit={editModal.openModal}
              onDelete={handleDeleteRadiator}
              onEditStock={stockModal.openModal}
              isAdmin={isAdmin}
            />
          )}

          {/* Infinite scroll trigger (invisible observer element) */}
          {hasMore && (
            <div
              ref={observerRef}
              className="flex justify-center py-8"
            >
              {loading ? (
                <LoadingSpinner size="md" text="Loading more radiators..." />
              ) : (
                <div className="h-10" /> // Invisible trigger element
              )}
            </div>
          )}

          {/* End of list indicator */}
          {!hasMore && sortedRadiators.length > 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              All radiators loaded ({sortedRadiators.length} total)
            </div>
          )}
        </>
      )}

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
    </div>
  );
};

export default RadiatorList;