// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  Alert,
  Box,
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
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Recent Activity</Typography>
        <Typography variant="body2" color="text.secondary">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</Typography>
      </Stack>

      {/* Type filter chips */}
      <Stack direction="row" spacing={1} overflow="auto" pb={0.5} mx={-0.5} px={0.5}>
        {TYPE_FILTERS.map((t) => (
          <Chip clickable
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            label={t.label}
            color={typeFilter === t.value ? "primary" : "default"}
            variant={typeFilter === t.value ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {/* Search & filters */}
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack spacing={1.5}>
          <TextField size="small"
            placeholder="Search product..."
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
          />

        <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }}>
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
        </Stack>
        </Stack>
      </Paper>

      {/* Content */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading activity..." />
      ) : filtered.length === 0 ? (
        <Alert severity="info">No activity found for the selected filters.</Alert>
      ) : (
        <>
          {/* Mobile: Collapsible cards */}
          <Stack spacing={1} sx={{ display: { xs: "flex", md: "none" } }}>
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
          </Stack>

          {/* Desktop: Table */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
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
          </Box>
        </>
      )}
    </Stack>
  );
}

function ActivityCard({ movement: m, route, activity, formatDate }) {
  const [expanded, setExpanded] = useState(false);
  const isIncoming = m.movementType === "INCOMING";

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <ButtonBase
        onClick={() => setExpanded(!expanded)}
        sx={{ width: "100%", p: 1.5, display: "flex", gap: 1.5, textAlign: "left", justifyContent: "flex-start" }}
      >
        <Chip
          size="small"
          label={`${isIncoming ? "+" : "-"}${m.quantity}`}
          color={isIncoming ? "success" : "error"}
          variant="outlined"
          sx={{ height: 24, "& .MuiChip-label": { px: 1, fontSize: 12, fontWeight: 600 } }}
        />
        <Box flex={1} minWidth={0}>
          <Typography variant="body2" fontWeight={500} noWrap>{m.productName}</Typography>
          <Typography variant="caption" color="text.secondary">{formatDate(m.date)}</Typography>
        </Box>
        <Chip
          size="small"
          label={activity.label}
          color={activity.color}
          variant="filled"
          sx={{ height: 22, "& .MuiChip-label": { px: 1, fontSize: 10 } }}
        />
        <Box color="text.secondary" display="flex" sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}><ChevronDown size={16} /></Box>
      </ButtonBase>

      {expanded && (
        <Box px={1.5} pb={1.5} borderTop={1} borderColor="divider">
          <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1} pt={1}>
            <Detail label="Code" value={`${m.brand} - ${m.productCode}`} />
            <Detail label="Direction" value={isIncoming ? "Incoming" : "Outgoing"} />
            {route.fromWarehouseCode && (
              <Detail label="From" value={route.fromWarehouseCode} />
            )}
            {route.toWarehouseCode && (
              <Detail label="To" value={route.toWarehouseCode} />
            )}
          </Box>
          {m.notes && (
            <Typography variant="caption" color="text.secondary" pt={1} display="block">{m.notes}</Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}

function Detail({ label, value }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="caption" fontWeight={600} display="block">{value}</Typography></Box>;
}
