import React, { useState } from "react";
import { ArrowRightLeft, Package, ShoppingCart } from "lucide-react";
import { useStockManagement } from "../../hooks/useStockManagement";
import StockHeader from "./sections/StockHeader";
import StockToolbar from "./sections/StockToolbar";
import StockOverviewGrid from "./sections/StockOverviewGrid";
import StockTable from "./views/StockTable";
import StockMovementsTab from "./sections/StockMovementsTab";
import SalesTab from "./sections/SalesTab";
import PageLoadingState from "../common/feedback/PageLoadingState";
import PageErrorState from "../common/feedback/PageErrorState";

export default function StockManagement() {
  const sm = useStockManagement();
  const [activeTab, setActiveTab] = useState("inventory");

  if (sm.loading) {
    return <PageLoadingState text="Loading stock data..." />;
  }

  if (sm.error) {
    return <PageErrorState title="Error loading stock data" message={sm.error} />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <StockHeader radiators={sm.filteredRadiators} />

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-colors ${
              activeTab === "inventory"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Package className="w-4 h-4" />
            Current Inventory
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-colors ${
              activeTab === "movements"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Stock
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-colors ${
              activeTab === "sales"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Sales
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "inventory" ? (
          <>
            <StockOverviewGrid
              warehouses={sm.warehouses}
              radiators={sm.radiators}
              selectedWarehouse={sm.selectedWarehouse}
              setSelectedWarehouse={sm.setSelectedWarehouse}
              getTotalStock={sm.getTotalStock}
            />

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
          </>
        ) : null}

        {activeTab === "movements" ? (
          <StockMovementsTab
            radiators={sm.radiators}
            warehouses={sm.warehouses}
            selectedWarehouse={sm.selectedWarehouse}
            onSubmitStockIn={sm.handleStockIn}
            onSubmitMovement={sm.handleTransferStock}
          />
        ) : null}

        {activeTab === "sales" ? (
          <SalesTab
            radiators={sm.radiators}
            warehouses={sm.warehouses}
            selectedWarehouse={sm.selectedWarehouse}
            onSubmitSale={sm.handleRecordSale}
          />
        ) : null}
      </div>
    </div>
  );
}
