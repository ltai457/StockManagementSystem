import React, { useState } from "react";
import { ArrowRightLeft, PackagePlus, ShoppingCart } from "lucide-react";
import { useStockManagement } from "../../hooks/useStockManagement";
import StockHeader from "./sections/StockHeader";
import StockToolbar from "./sections/StockToolbar";
import StockOverviewGrid from "./sections/StockOverviewGrid";
import StockTable from "./views/StockTable";
import StockInModal from "./modals/StockInModal";
import TransferStockModal from "./modals/TransferStockModal";
import RecordSaleModal from "./modals/RecordSaleModal";
import PageLoadingState from "../common/feedback/PageLoadingState";
import PageErrorState from "../common/feedback/PageErrorState";

export default function StockManagement() {
  const sm = useStockManagement();

  const [transferOpen, setTransferOpen] = useState(false);
  const [stockInOpen, setStockInOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (sm.loading) {
    return <PageLoadingState text="Loading stock data..." />;
  }

  if (sm.error) {
    return <PageErrorState title="Error loading stock data" message={sm.error} />;
  }

  const handleOperation = (handler) => async (payload) => {
    setSubmitting(true);
    try {
      return await handler(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <StockHeader radiators={sm.filteredRadiators} />

        {/* 3 Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setTransferOpen(true)}
            className="flex items-center justify-center gap-3 px-5 py-4 bg-white border-2 border-blue-200 rounded-xl text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
          >
            <ArrowRightLeft className="w-5 h-5" />
            Transfer Stock
          </button>
          <button
            onClick={() => setStockInOpen(true)}
            className="flex items-center justify-center gap-3 px-5 py-4 bg-white border-2 border-green-200 rounded-xl text-green-700 font-semibold hover:bg-green-50 hover:border-green-400 transition-all shadow-sm"
          >
            <PackagePlus className="w-5 h-5" />
            Receive from Supplier
          </button>
          <button
            onClick={() => setSaleOpen(true)}
            className="flex items-center justify-center gap-3 px-5 py-4 bg-white border-2 border-red-200 rounded-xl text-red-700 font-semibold hover:bg-red-50 hover:border-red-400 transition-all shadow-sm"
          >
            <ShoppingCart className="w-5 h-5" />
            Sell to Customer
          </button>
        </div>

        {/* Warehouse Overview Cards */}
        <StockOverviewGrid
          warehouses={sm.warehouses}
          radiators={sm.radiators}
          selectedWarehouse={sm.selectedWarehouse}
          setSelectedWarehouse={sm.setSelectedWarehouse}
          getTotalStock={sm.getTotalStock}
        />

        {/* Search + Filter + Edit Toolbar */}
        <StockToolbar
          searchTerm={sm.searchTerm}
          setSearchTerm={sm.setSearchTerm}
          filterLowStock={sm.filterLowStock}
          setFilterLowStock={sm.setFilterLowStock}
          editMode={sm.editMode}
          updating={sm.updating}
          editingCount={Object.keys(sm.editingStocks || {}).length}
          onEdit={sm.handleEditMode}
          onCancel={sm.handleCancelEdit}
          onSave={sm.handleSaveChanges}
          selectedWarehouse={sm.selectedWarehouse}
        />

        <div className="mb-1">
          <p className="text-sm text-gray-600">
            {sm.selectedWarehouse === "all"
              ? "Viewing stock across all warehouses"
              : `Viewing stock for ${
                  sm.warehouses.find((w) => w.code === sm.selectedWarehouse)?.name ||
                  sm.selectedWarehouse
                }`}
            {sm.editMode && sm.selectedWarehouse !== "all" && (
              <span className="ml-2 text-blue-600 font-medium">• Edit Mode Active</span>
            )}
          </p>
        </div>

        {/* Stock Table */}
        <StockTable
          warehouses={sm.warehouses}
          items={sm.filteredRadiators}
          selectedWarehouse={sm.selectedWarehouse}
          editMode={sm.editMode}
          getTotalStock={sm.getTotalStock}
          getStockStatus={sm.getStockStatus}
          getDisplayStock={sm.getDisplayStock}
          onChangeStock={sm.handleStockChange}
        />

        {/* Modals */}
        <TransferStockModal
          open={transferOpen}
          onClose={() => setTransferOpen(false)}
          radiators={sm.radiators}
          warehouses={sm.warehouses}
          selectedWarehouse={sm.selectedWarehouse}
          submitting={submitting}
          onSubmit={handleOperation(sm.handleTransferStock)}
        />
        <StockInModal
          open={stockInOpen}
          onClose={() => setStockInOpen(false)}
          radiators={sm.radiators}
          warehouses={sm.warehouses}
          selectedWarehouse={sm.selectedWarehouse}
          submitting={submitting}
          onSubmit={handleOperation(sm.handleStockIn)}
          onProductCreated={sm.refreshStockData}
        />
        <RecordSaleModal
          open={saleOpen}
          onClose={() => setSaleOpen(false)}
          radiators={sm.radiators}
          warehouses={sm.warehouses}
          selectedWarehouse={sm.selectedWarehouse}
          submitting={submitting}
          onSubmit={handleOperation(sm.handleRecordSale)}
        />
      </div>
    </div>
  );
}
