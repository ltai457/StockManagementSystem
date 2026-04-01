import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
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
      {/* Direction chips */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {[
            { value: "all", label: "All" },
            { value: "INCOMING", label: "Incoming" },
            { value: "OUTGOING", label: "Outgoing" },
          ].map((d) => (
            <button
              key={d.value}
              onClick={() => setMovementTypeFilter(d.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                movementTypeFilter === d.value
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="small" variant="outlined" onClick={() => setStockInOpen(true)}>
            Stock In
          </Button>
          <Button size="small" variant="contained" onClick={() => setMovementOpen(true)}>
            Move Stock
          </Button>
        </div>
      </div>

      {/* Search & filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search product..."
            value={productFilter}
            onChange={(event) => setProductFilter(event.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[40px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <TextField
            select
            size="small"
            label="Warehouse"
            value={warehouseFilter}
            onChange={(event) => setWarehouseFilter(event.target.value)}
            fullWidth
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
            fullWidth
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="180">Last 6 months</MenuItem>
          </TextField>
        </div>
      </div>

      {filteredMovements.length === 0 ? (
        <Alert severity="info">No stock movements found for the selected filters.</Alert>
      ) : (
        <>
          {/* Mobile: Collapsible cards */}
          <div className="md:hidden space-y-2">
            {filteredMovements.map((movement) => {
              const route = getMovementRoute(movement);
              const isStockIn = isStockInEvent(movement);
              const isManualAdj = isManualAdjustmentEvent(movement);
              const typeLabel = isStockIn ? "Stock In" : isManualAdj ? "Manual Adjustment" : "Stock Movement";

              return (
                <MovementCard
                  key={movement.id}
                  movement={movement}
                  route={route}
                  typeLabel={typeLabel}
                  formatDate={formatDate}
                />
              );
            })}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block">
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
                    const isStockIn2 = isStockInEvent(movement);
                    const isManualAdj2 = isManualAdjustmentEvent(movement);
                    const typeLabel = isStockIn2
                      ? "Stock In"
                      : isManualAdj2
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
          </div>
        </>
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

function MovementCard({ movement, route, typeLabel, formatDate }) {
  const [expanded, setExpanded] = useState(false);
  const isIncoming = movement.movementType === "INCOMING";

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        <Chip
          size="small"
          label={`${isIncoming ? "+" : "-"}${movement.quantity}`}
          color={isIncoming ? "success" : "error"}
          variant="outlined"
          sx={{ height: 24, "& .MuiChip-label": { px: 1, fontSize: 12, fontWeight: 600 } }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{movement.productName}</p>
          <p className="text-xs text-gray-500">{formatDate(movement.date)}</p>
        </div>
        <Chip
          size="small"
          label={typeLabel}
          color={isIncoming ? "success" : "error"}
          variant="filled"
          sx={{ height: 22, "& .MuiChip-label": { px: 1, fontSize: 10 } }}
        />
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100 space-y-1.5">
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div>
              <span className="text-gray-500">Code</span>
              <p className="font-medium text-gray-900">{movement.productCode}</p>
            </div>
            <div>
              <span className="text-gray-500">Direction</span>
              <p className="font-medium text-gray-900">{isIncoming ? "Incoming" : "Outgoing"}</p>
            </div>
            {route.fromWarehouseCode && (
              <div>
                <span className="text-gray-500">From</span>
                <p className="font-medium text-gray-900">{route.fromWarehouseCode}</p>
              </div>
            )}
            {route.toWarehouseCode && (
              <div>
                <span className="text-gray-500">To</span>
                <p className="font-medium text-gray-900">{route.toWarehouseCode}</p>
              </div>
            )}
          </div>
          {movement.notes && (
            <p className="text-xs text-gray-500 pt-1">{movement.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default StockMovementsTab;
