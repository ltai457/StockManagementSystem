import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingSpinner } from "../../common/ui/LoadingSpinner";
import stockService from "../../../api/stockService";
import StockInModal from "../modals/StockInModal";
import TransferStockModal from "../modals/TransferStockModal";
import {
  getMovementRoute,
  isManualAdjustmentEvent,
  isStockInEvent,
  isStockMovementEvent,
} from "../../../utils/stockEvents";

const StockMovementsTab = ({
  radiators = [],
  warehouses = [],
  selectedWarehouse = "all",
  onSubmitStockIn,
  onSubmitMovement,
}) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stockInOpen, setStockInOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  const [warehouseFilter, setWarehouseFilter] = useState(selectedWarehouse === "all" ? "all" : selectedWarehouse);
  const [productFilter, setProductFilter] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");

  const loadMovements = useCallback(async () => {
    setLoading(true);
    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - Number.parseInt(dateRange, 10));

      const result = await stockService.getStockMovements({
        fromDate,
        toDate,
        limit: 500,
      });

      if (result.success) {
        setMovements(
          (result.data || []).filter(
            (movement) =>
              isStockMovementEvent(movement) ||
              isStockInEvent(movement) ||
              isManualAdjustmentEvent(movement)
          )
        );
      } else {
        setMovements([]);
      }
    } catch {
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  useEffect(() => {
    if (selectedWarehouse !== "all") {
      setWarehouseFilter(selectedWarehouse);
    }
  }, [selectedWarehouse]);

  const filteredMovements = useMemo(
    () =>
      movements.filter((movement) => {
        const route = getMovementRoute(movement);
        const matchesProduct =
          !productFilter ||
          movement.productName.toLowerCase().includes(productFilter.toLowerCase()) ||
          movement.productCode.toLowerCase().includes(productFilter.toLowerCase());

        const matchesWarehouse =
          warehouseFilter === "all" ||
          route.fromWarehouseCode === warehouseFilter ||
          route.toWarehouseCode === warehouseFilter;

        const matchesMovementType =
          movementTypeFilter === "all" || movement.movementType === movementTypeFilter;

        return matchesProduct && matchesWarehouse && matchesMovementType;
      }),
    [movements, productFilter, warehouseFilter, movementTypeFilter]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading stock movements..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <TextField
            size="small"
            placeholder="Filter by product"
            value={productFilter}
            onChange={(event) => setProductFilter(event.target.value)}
            fullWidth
          />

          <TextField
            select
            size="small"
            label="Direction"
            value={movementTypeFilter}
            onChange={(event) => setMovementTypeFilter(event.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="INCOMING">Incoming</MenuItem>
            <MenuItem value="OUTGOING">Outgoing</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Warehouse"
            value={warehouseFilter}
            onChange={(event) => setWarehouseFilter(event.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Warehouses</MenuItem>
            {(warehouses || []).map((warehouse) => (
              <MenuItem key={warehouse.id} value={warehouse.code}>
                {warehouse.name} ({warehouse.code})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Range"
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="180">Last 6 months</MenuItem>
          </TextField>
        </div>

        <div className="flex items-center gap-2">
          <Button size="small" variant="outlined" onClick={() => setStockInOpen(true)}>
            Stock In
          </Button>
          <Button size="small" variant="contained" onClick={() => setMovementOpen(true)}>
            Move Stock
          </Button>
        </div>
      </div>

      {filteredMovements.length === 0 ? (
        <Alert severity="info">No stock movements found for the selected filters.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table size="small" sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>From</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>To</TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }} align="center">
                    Action
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }} align="center">
                    Qty
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>Note</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMovements.map((movement) => {
                  const route = getMovementRoute(movement);
                  const isStockIn = isStockInEvent(movement);
                  const isManualAdjustment = isManualAdjustmentEvent(movement);
                  const typeLabel = isStockIn
                    ? "Stock In"
                    : isManualAdjustment
                      ? "Manual Adjustment"
                      : "Stock Movement";

                  return (
                    <TableRow key={movement.id} hover>
                      <TableCell sx={{ py: 1, px: 1.5, whiteSpace: "nowrap" }}>
                        <Typography variant="caption">{formatDate(movement.date)}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 1.5 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {movement.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {movement.productCode}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 1.5 }}>
                        <Typography variant="caption" fontWeight={500} noWrap>
                          {route.fromWarehouseCode || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 1.5 }}>
                        <Typography variant="caption" fontWeight={500} noWrap>
                          {route.toWarehouseCode || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 1.5 }} align="center">
                        <Chip
                          size="small"
                          label={typeLabel}
                          color={movement.movementType === "INCOMING" ? "success" : "error"}
                          variant="filled"
                          sx={{ height: 22, "& .MuiChip-label": { px: 1, fontSize: 11 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 1.5 }} align="center">
                        <Chip
                          size="small"
                          label={`${movement.movementType === "INCOMING" ? "+" : "-"}${movement.quantity}`}
                          color={movement.movementType === "INCOMING" ? "success" : "error"}
                          variant="outlined"
                          sx={{ height: 22, "& .MuiChip-label": { px: 1, fontSize: 11 } }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1, px: 1.5, maxWidth: 220 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {movement.notes || "Stock movement"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
      )}

      <TransferStockModal
        open={movementOpen}
        onClose={() => setMovementOpen(false)}
        radiators={radiators}
        warehouses={warehouses}
        selectedWarehouse={selectedWarehouse}
        submitting={submitting}
        onSubmit={async (payload) => {
          setSubmitting(true);
          try {
            const success = await onSubmitMovement?.(payload);
            if (success) {
              await loadMovements();
            }
            return success;
          } finally {
            setSubmitting(false);
          }
        }}
      />
      <StockInModal
        open={stockInOpen}
        onClose={() => setStockInOpen(false)}
        radiators={radiators}
        warehouses={warehouses}
        selectedWarehouse={selectedWarehouse}
        submitting={submitting}
        onSubmit={async (payload) => {
          setSubmitting(true);
          try {
            const success = await onSubmitStockIn?.(payload);
            if (success) {
              await loadMovements();
            }
            return success;
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
};

export default StockMovementsTab;
