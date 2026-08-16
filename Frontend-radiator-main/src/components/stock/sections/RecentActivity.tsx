// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <span className="text-sm text-gray-500">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              typeFilter === t.value
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search & filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search product..."
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[40px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <TextField
            select
            size="small"
            label="Warehouse"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            fullWidth
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
            fullWidth
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="180">Last 6 months</MenuItem>
          </TextField>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading activity..." />
      ) : filtered.length === 0 ? (
        <Alert severity="info">No activity found for the selected filters.</Alert>
      ) : (
        <>
          {/* Mobile: Collapsible cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((m) => {
              const route = getMovementRoute(m);
              const activity = getActivityLabel(m);
              return (
                <ActivityCard
                  key={m.id}
                  movement={m}
                  route={route}
                  activity={activity}
                  formatDate={formatDate}
                />
              );
            })}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block">
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
          </div>
        </>
      )}
    </div>
  );
}

function ActivityCard({ movement: m, route, activity, formatDate }) {
  const [expanded, setExpanded] = useState(false);
  const isIncoming = m.movementType === "INCOMING";

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        <Chip
          size="small"
          label={`${isIncoming ? "+" : "-"}${m.quantity}`}
          color={isIncoming ? "success" : "error"}
          variant="outlined"
          sx={{ height: 24, "& .MuiChip-label": { px: 1, fontSize: 12, fontWeight: 600 } }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{m.productName}</p>
          <p className="text-xs text-gray-500">{formatDate(m.date)}</p>
        </div>
        <Chip
          size="small"
          label={activity.label}
          color={activity.color}
          variant="filled"
          sx={{ height: 22, "& .MuiChip-label": { px: 1, fontSize: 10 } }}
        />
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div>
              <span className="text-gray-500">Code</span>
              <p className="font-medium text-gray-900">{m.brand} - {m.productCode}</p>
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
          {m.notes && (
            <p className="text-xs text-gray-500 pt-2">{m.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
