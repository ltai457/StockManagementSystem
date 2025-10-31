import React, { useState, useMemo } from "react";
import { ShoppingCart, Plus, Zap, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useModal } from "../../hooks/useModal";
import { PageHeader } from "../common/layout/PageHeader";
import { LoadingSpinner } from "../common/ui/LoadingSpinner";
import { Button } from "../common/ui/Button";
import { EmptyState } from "../common/layout/EmptyState";
import SalesFilters from "./SalesFilters";
import SalesTable from "./SalesTable";
import SalesStats from "./SalesStats";
/* import CreateSaleModal from './modals/CreateSaleModal'; */
import SaleDetailsModal from "./modals/SaleDetailsModal";
import ReceiptModal from "./modals/ReceiptModal";
import FastCreateSaleModal from "./modals/FastCreateSaleModal";
import QuickInvoiceModal from "./modals/QuickInvoiceModal";
import salesService from "../../api/salesService";

const SalesManagement = ({ onQuickInvoice }) => {
  const { user } = useAuth();

  // Use infinite scroll hook with auto-scroll enabled
  const {
    items: sales,
    loading,
    error,
    hasMore,
    loadMore,
    refetch,
    observerRef,
  } = useInfiniteScroll(
    (pageNumber, pageSize) => salesService.getPaginated(pageNumber, pageSize),
    21, // page size (divisible by 3 for consistent loading)
    true // enable auto-scroll
  );

  // Sales operations without the hook (to avoid auto-fetching)
  const createSale = async (saleData) => {
    try {
      const result = await salesService.create(saleData);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getSaleById = async (id) => {
    try {
      const result = await salesService.getById(id);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const getReceipt = async (saleId) => {
    try {
      const result = await salesService.getReceipt(saleId);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const cancelSale = async (id) => {
    try {
      const result = await salesService.cancel(id);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const refundSale = async (id) => {
    try {
      const result = await salesService.refund(id);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const createModal = useModal();
  const detailsModal = useModal();
  const receiptModal = useModal();
  const quickInvoiceModal = useModal();

  // Manual filter state instead of useFilters hook
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateRange: { start: "", end: "" },
  });

  const setFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      dateRange: { start: "", end: "" },
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (typeof value === "object") {
      return Object.values(value).some((v) => v && v !== "");
    }
    return value && value !== "all" && value !== "";
  });

  // Manual filtering - simple and clean
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Search filter
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch =
          sale.saleNumber?.toLowerCase().includes(searchTerm) ||
          sale.customerName?.toLowerCase().includes(searchTerm) ||
          sale.processedByName?.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && filters.status !== "all") {
        if (sale.status !== filters.status) return false;
      }

      // Date range filter - only apply if both dates are set
      if (filters.dateRange?.start && filters.dateRange?.end) {
        const saleDate = new Date(sale.saleDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);

        if (saleDate < startDate || saleDate > endDate) return false;
      }

      return true;
    });
  }, [sales, filters]);

  const handleCreateSale = async (saleData) => {
    const result = await createSale(saleData);
    if (result.success) {
      createModal.closeModal();
      // Refetch to get the new sale
      refetch();
      return true;
    }
    return false;
  };

  const handleViewDetails = async (sale) => {
    const result = await getSaleById(sale.id);
    if (result.success) {
      detailsModal.openModal(result.data);
    } else {
      alert("Failed to load sale details: " + result.error);
    }
  };

  const handleViewReceipt = async (sale) => {
    const result = await getReceipt(sale.id);
    if (result.success) {
      receiptModal.openModal(result.data);
    } else {
      alert("Failed to load receipt: " + result.error);
    }
  };

  const handleCancelSale = async (sale) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel sale ${sale.saleNumber}?`
      )
    ) {
      return;
    }

    const result = await cancelSale(sale.id);
    if (!result.success) {
      alert("Failed to cancel sale: " + result.error);
    } else {
      // Refetch after canceling
      refetch();
    }
  };

  const handleRefundSale = async (sale) => {
    if (
      !window.confirm(
        `Are you sure you want to refund sale ${sale.saleNumber}? This will restore stock levels.`
      )
    ) {
      return;
    }

    const result = await refundSale(sale.id);
    if (!result.success) {
      alert("Failed to refund sale: " + result.error);
    } else {
      // Refetch after refunding
      refetch();
    }
  };

  const handleQuickInvoiceSuccess = async (invoiceData) => {
    console.log("Quick invoice created:", invoiceData);
    // Show receipt immediately
    if (invoiceData && invoiceData.invoiceNumber) {
      receiptModal.openModal(invoiceData);
    }
    // Refetch to get new sale
    refetch();
    quickInvoiceModal.closeModal();
  };

  if (loading && sales.length === 0) {
    return <LoadingSpinner size="lg" text="Loading sales..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        icon={ShoppingCart}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onQuickInvoice}
              icon={Zap}
              className="border-0 text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:bg-transparent focus:ring-green-500 shadow-md hover:shadow-lg"
            >
              Quick Invoice
            </Button>
            <Button onClick={() => createModal.openModal()} icon={Plus}>
              New Sale
            </Button>
          </div>
        }
      />

      <SalesStats sales={filteredSales} />

      <SalesFilters
        filters={filters}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {filteredSales.length === 0 && !loading ? (
        <EmptyState
          icon={ShoppingCart}
          title={hasActiveFilters ? "No sales found" : "No sales yet"}
          description={
            hasActiveFilters
              ? "No sales match your current filters"
              : "Start by creating your first sale"
          }
          action={hasActiveFilters}
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : (
        <>
          <SalesTable
            sales={filteredSales}
            onViewDetails={handleViewDetails}
            onViewReceipt={handleViewReceipt}
            onCancel={handleCancelSale}
            onRefund={handleRefundSale}
            userRole={user?.role}
          />

          {/* Infinite scroll trigger (invisible observer element) */}
          {hasMore && (
            <div
              ref={observerRef}
              className="flex justify-center py-8"
            >
              {loading ? (
                <LoadingSpinner size="md" text="Loading more sales..." />
              ) : (
                <div className="h-10" /> // Invisible trigger element
              )}
            </div>
          )}

          {/* End of list indicator */}
          {!hasMore && filteredSales.length > 0 && (
            <div className="text-center py-6 text-gray-500 text-sm">
              All sales loaded ({filteredSales.length} total)
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {/* <CreateSaleModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onSubmit={handleCreateSale}
      /> */}
      <FastCreateSaleModal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        onSubmit={handleCreateSale}
      />
      <SaleDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={detailsModal.closeModal}
        sale={detailsModal.data}
        onViewReceipt={handleViewReceipt}
      />

      <ReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={receiptModal.closeModal}
        receipt={receiptModal.data}
      />
    </div>
  );
};

export default SalesManagement;
