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

const QUICK_ACTIONS = [
  {
    key: "transfer",
    label: "Transfer Stock",
    description: "Move units between warehouses",
    icon: ArrowRightLeft,
    onOpen: "transfer",
    className:
      "border-blue-200 bg-white text-blue-700 hover:border-blue-400 hover:bg-blue-50",
  },
  {
    key: "stock-in",
    label: "Receive Stock",
    description: "Add supplier deliveries",
    icon: PackagePlus,
    onOpen: "stockIn",
    className:
      "border-green-200 bg-white text-green-700 hover:border-green-400 hover:bg-green-50",
  },
  {
    key: "sale",
    label: "Record Sale",
    description: "Reduce stock for customer orders",
    icon: ShoppingCart,
    onOpen: "sale",
    className:
      "border-red-200 bg-white text-red-700 hover:border-red-400 hover:bg-red-50",
  },
];

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
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <StockHeader radiators={sm.filteredRadiators} />

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {QUICK_ACTIONS.map(({ key, label, description, icon: Icon, onOpen, className }) => (
            <button
              key={key}
              onClick={() => {
                if (onOpen === "transfer") setTransferOpen(true);
                if (onOpen === "stockIn") setStockInOpen(true);
                if (onOpen === "sale") setSaleOpen(true);
              }}
              className={`flex min-h-[60px] flex-col items-center justify-center gap-2 rounded-xl border-2 px-2 py-3 text-center shadow-sm transition-all sm:min-h-[64px] sm:flex-row sm:justify-start sm:gap-3 sm:px-4 sm:text-left ${className}`}
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-50">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold leading-tight sm:text-base">
                  {label}
                </span>
                <span className="mt-0.5 hidden text-xs text-gray-500 sm:block sm:text-sm">
                  {description}
                </span>
              </span>
            </button>
          ))}
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
              <span className="ml-2 font-medium text-blue-600">• Edit Mode Active</span>
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
