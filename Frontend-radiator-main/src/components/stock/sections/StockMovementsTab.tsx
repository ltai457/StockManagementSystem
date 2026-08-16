// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
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
  InputAdornment,
  Stack,
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
    <Stack spacing={2}>
      {/* Direction chips */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Stack direction="row" spacing={1} overflow="auto" pb={0.5} mx={-0.5} px={0.5}>
          {[
            { value: "all", label: "All" },
            { value: "INCOMING", label: "Incoming" },
            { value: "OUTGOING", label: "Outgoing" },
          ].map((d) => (
            <Chip clickable
              key={d.value}
              onClick={() => setMovementTypeFilter(d.value)}
              label={d.label}
              color={movementTypeFilter === d.value ? "primary" : "default"}
              variant={movementTypeFilter === d.value ? "filled" : "outlined"}
            />
          ))}
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1} flex="none">
          <Button size="small" variant="outlined" onClick={() => setStockInOpen(true)}>
            Stock In
          </Button>
          <Button size="small" variant="contained" onClick={() => setMovementOpen(true)}>
            Move Stock
          </Button>
        </Stack>
      </Stack>

      {/* Search & filters */}
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack spacing={1.5}>
          <TextField size="small"
            placeholder="Search product..."
            value={productFilter}
            onChange={(event) => setProductFilter(event.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
          />

        <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }}>
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
        </Stack>
        </Stack>
      </Paper>

      {filteredMovements.length === 0 ? (
        <Alert severity="info">No stock movements found for the selected filters.</Alert>
      ) : (
        <>
          {/* Mobile: Collapsible cards */}
          <Stack spacing={1} sx={{ display: { xs: "flex", md: "none" } }}>
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
          </Stack>

          {/* Desktop: Table */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
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
          </Box>
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
    </Stack>
  );
};

function MovementCard({ movement, route, typeLabel, formatDate }) {
  const [expanded, setExpanded] = useState(false);
  const isIncoming = movement.movementType === "INCOMING";

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <ButtonBase
        onClick={() => setExpanded(!expanded)}
        sx={{ width: "100%", p: 1.5, display: "flex", gap: 1.5, textAlign: "left", justifyContent: "flex-start" }}
      >
        <Chip
          size="small"
          label={`${isIncoming ? "+" : "-"}${movement.quantity}`}
          color={isIncoming ? "success" : "error"}
          variant="outlined"
          sx={{ height: 24, "& .MuiChip-label": { px: 1, fontSize: 12, fontWeight: 600 } }}
        />
        <Box flex={1} minWidth={0}>
          <Typography variant="body2" fontWeight={500} noWrap>{movement.productName}</Typography>
          <Typography variant="caption" color="text.secondary">{formatDate(movement.date)}</Typography>
        </Box>
        <Chip
          size="small"
          label={typeLabel}
          color={isIncoming ? "success" : "error"}
          variant="filled"
          sx={{ height: 22, "& .MuiChip-label": { px: 1, fontSize: 10 } }}
        />
        <Box color="text.secondary" display="flex" sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}><ChevronDown size={16} /></Box>
      </ButtonBase>

      {expanded && (
        <Box px={1.5} pb={1.5} borderTop={1} borderColor="divider">
          <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1} pt={1}>
            <Detail label="Code" value={movement.productCode} />
            <Detail label="Direction" value={isIncoming ? "Incoming" : "Outgoing"} />
            {route.fromWarehouseCode && (
              <Detail label="From" value={route.fromWarehouseCode} />
            )}
            {route.toWarehouseCode && (
              <Detail label="To" value={route.toWarehouseCode} />
            )}
          </Box>
          {movement.notes && (
            <Typography variant="caption" color="text.secondary" pt={0.5} display="block">{movement.notes}</Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}

function Detail({ label, value }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="caption" fontWeight={600} display="block">{value}</Typography></Box>;
}

export default StockMovementsTab;
