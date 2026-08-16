// @ts-nocheck
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
import { Avatar, Box, ButtonBase, Stack, Typography } from "@mui/material";

const QUICK_ACTIONS = [
  {
    key: "transfer",
    label: "Transfer Stock",
    description: "Move units between warehouses",
    icon: ArrowRightLeft,
    onOpen: "transfer",
    color: "info.main",
  },
  {
    key: "stock-in",
    label: "Receive Stock",
    description: "Add supplier deliveries",
    icon: PackagePlus,
    onOpen: "stockIn",
    color: "success.main",
  },
  {
    key: "sale",
    label: "Record Sale",
    description: "Reduce stock for customer orders",
    icon: ShoppingCart,
    onOpen: "sale",
    color: "error.main",
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
    <Box minHeight="100vh" bgcolor="background.default" p={{ xs: 1.5, sm: 2, md: 3 }}>
      <Stack maxWidth="xl" mx="auto" spacing={3}>
        <StockHeader radiators={sm.filteredRadiators} />

        <Box display="grid" gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap={{ xs: 1, sm: 1.5 }}>
          {QUICK_ACTIONS.map(({ key, label, description, icon: Icon, onOpen, color }) => (
            <ButtonBase
              key={key}
              onClick={() => {
                if (onOpen === "transfer") setTransferOpen(true);
                if (onOpen === "stockIn") setStockInOpen(true);
                if (onOpen === "sale") setSaleOpen(true);
              }}
              sx={{ minHeight: { xs: 60, sm: 64 }, flexDirection: { xs: "column", sm: "row" }, justifyContent: { xs: "center", sm: "flex-start" }, gap: { xs: 1, sm: 1.5 }, px: { xs: 1, sm: 2 }, py: 1.5, border: 2, borderColor: "divider", bgcolor: "background.paper", borderRadius: 2, color, textAlign: { xs: "center", sm: "left" }, boxShadow: 1, "&:hover": { bgcolor: "action.hover", borderColor: color } }}
            >
              <Avatar variant="rounded" sx={{ width: 40, height: 40, flex: "none", bgcolor: "action.hover", color: "inherit" }}><Icon size={20} /></Avatar>
              <Box minWidth={0}>
                <Typography display="block" fontWeight={600} sx={{ fontSize: { xs: 12, sm: 16 }, lineHeight: 1.2 }}>
                  {label}
                </Typography>
                <Typography mt={0.5} variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  {description}
                </Typography>
              </Box>
            </ButtonBase>
          ))}
        </Box>

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

        <Box mb={0.5}>
          <Typography variant="body2" color="text.secondary">
            {sm.selectedWarehouse === "all"
              ? "Viewing stock across all warehouses"
              : `Viewing stock for ${
                  sm.warehouses.find((w) => w.code === sm.selectedWarehouse)?.name ||
                  sm.selectedWarehouse
                }`}
            {sm.editMode && sm.selectedWarehouse !== "all" && (
              <Typography component="span" ml={1} fontWeight={600} color="primary.main">• Edit Mode Active</Typography>
            )}
          </Typography>
        </Box>

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
      </Stack>
    </Box>
  );
}
