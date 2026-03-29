import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import {
  getMovementRoute,
  isSaleEvent,
  isStockInEvent,
  isStockMovementEvent,
  isManualAdjustmentEvent,
} from "../../../utils/stockEvents";

const TYPE_FILTERS = [
  { value: "all", label: "All Activity" },
  { value: "transfer", label: "Transfers" },
  { value: "supplier", label: "Supplier / Stock In" },
  { value: "sale", label: "Sales" },
  { value: "adjustment", label: "Manual Edit" },
];

function matchesTypeFilter(movement, typeFilter) {
  if (typeFilter === "all") return true;
  if (typeFilter === "transfer") return isStockMovementEvent(movement);
  if (typeFilter === "supplier") return isStockInEvent(movement);
  if (typeFilter === "sale") return isSaleEvent(movement);
  if (typeFilter === "adjustment") return isManualAdjustmentEvent(movement);
  return true;
}

function getActivityLabel(movement) {
  if (isSaleEvent(movement)) return { label: "Sale", color: "error" };
  if (isStockInEvent(movement)) return { label: "Supplier", color: "success" };
  if (isStockMovementEvent(movement)) return { label: "Transfer", color: "info" };
  if (isManualAdjustmentEvent(movement)) return { label: "Manual Edit", color: "warning" };
  return { label: movement.changeType || "Other", color: "default" };
}

export default function RecentActivity({ warehouses = [] }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [typeFilter, setTypeFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("");

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

      if (result?.success) {
        setMovements(result.data || []);
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

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      if (!matchesTypeFilter(m, typeFilter)) return false;

      if (productFilter) {
        const term = productFilter.toLowerCase();
        const matchesProduct =
          (m.productName || "").toLowerCase().includes(term) ||
          (m.productCode || "").toLowerCase().includes(term);
        if (!matchesProduct) return false;
      }

      if (warehouseFilter !== "all") {
        const route = getMovementRoute(m);
        if (
          m.warehouseCode !== warehouseFilter &&
          route.fromWarehouseCode !== warehouseFilter &&
          route.toWarehouseCode !== warehouseFilter
        ) {
          return false;
        }
      }

      return true;
    });
  }, [movements, typeFilter, productFilter, warehouseFilter]);

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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <TextField
          size="small"
          placeholder="Search product..."
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        />

        <TextField
          select
          size="small"
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {TYPE_FILTERS.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Warehouse"
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All Warehouses</MenuItem>
          {(warehouses || []).map((w) => (
            <MenuItem key={w.id} value={w.code}>
              {w.name} ({w.code})
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Range"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="7">Last 7 days</MenuItem>
          <MenuItem value="30">Last 30 days</MenuItem>
          <MenuItem value="90">Last 90 days</MenuItem>
          <MenuItem value="180">Last 6 months</MenuItem>
        </TextField>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading activity..." />
      ) : filtered.length === 0 ? (
        <Alert severity="info">No activity found for the selected filters.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>From</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>To</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }} align="center">Qty</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50", py: 1, px: 1.5 }}>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((m) => {
                const route = getMovementRoute(m);
                const activity = getActivityLabel(m);

                return (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ py: 1, px: 1.5, whiteSpace: "nowrap" }}>
                      <Typography variant="caption">{formatDate(m.date)}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 1.5 }}>
                      <Chip
                        size="small"
                        label={activity.label}
                        color={activity.color}
                        variant="filled"
                        sx={{ height: 22, "& .MuiChip-label": { px: 1, fontSize: 11 } }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1, px: 1.5 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>
                        {m.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {m.brand} - {m.productCode}
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
                        label={`${m.movementType === "INCOMING" ? "+" : "-"}${m.quantity}`}
                        color={m.movementType === "INCOMING" ? "success" : "error"}
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
                        {m.notes || "-"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
