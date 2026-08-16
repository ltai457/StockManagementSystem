// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import RecordSaleModal from "../modals/RecordSaleModal";
import stockService from "../../../api/stockService";
import { LoadingSpinner } from "../../common/ui/LoadingSpinner";
import { isSaleEvent } from "../../../utils/stockEvents";

export default function SalesTab({
  radiators = [],
  warehouses = [],
  selectedWarehouse = "all",
  onSubmitSale,
}) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [dateRange, setDateRange] = useState("30");
  const [warehouseFilter, setWarehouseFilter] = useState(selectedWarehouse === "all" ? "all" : selectedWarehouse);
  const [productFilter, setProductFilter] = useState("");

  const loadSales = useCallback(async () => {
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

      if (!result?.success) {
        setSales([]);
        return;
      }

      setSales((result.data || []).filter(isSaleEvent));
    } catch {
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    if (selectedWarehouse !== "all") {
      setWarehouseFilter(selectedWarehouse);
    }
  }, [selectedWarehouse]);

  const filteredSales = useMemo(
    () =>
      sales.filter((sale) => {
        const matchesProduct =
          !productFilter ||
          sale.productName.toLowerCase().includes(productFilter.toLowerCase()) ||
          sale.productCode.toLowerCase().includes(productFilter.toLowerCase());

        const matchesWarehouse =
          warehouseFilter === "all" || sale.warehouseCode === warehouseFilter;

        return matchesProduct && matchesWarehouse;
      }),
    [sales, productFilter, warehouseFilter]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading sales..." />;
  }

  return (
    <Stack spacing={2}>
      {/* Header with action */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">{filteredSales.length} sale{filteredSales.length !== 1 ? "s" : ""}</Typography>
        <Button variant="contained" color="error" size="small" onClick={() => setSaleOpen(true)}>
          New Sale
        </Button>
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

      {filteredSales.length === 0 ? (
        <Alert severity="info">No sales found for the selected filters.</Alert>
      ) : (
        <>
          {/* Mobile: Collapsible cards */}
          <Stack spacing={1} sx={{ display: { xs: "flex", md: "none" } }}>
            {filteredSales.map((sale) => (
              <SaleCard key={sale.id} sale={sale} formatDate={formatDate} />
            ))}
          </Stack>

          {/* Desktop: Table */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Warehouse</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }} align="center">
                      Quantity
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Reference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id} hover>
                      <TableCell>
                        <Typography variant="body2">{formatDate(sale.date)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {sale.productName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sale.brand} - {sale.productCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {sale.warehouseName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sale.warehouseCode}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" color="error" variant="outlined" label={`-${sale.quantity}`} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {sale.notes || "Sale"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}

      <RecordSaleModal
        open={saleOpen}
        onClose={() => setSaleOpen(false)}
        radiators={radiators}
        warehouses={warehouses}
        selectedWarehouse={selectedWarehouse}
        submitting={submitting}
        onSubmit={async (payload) => {
          setSubmitting(true);
          try {
            const success = await onSubmitSale?.(payload);
            if (success) {
              await loadSales();
            }
            return success;
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </Stack>
  );
}

function SaleCard({ sale, formatDate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <ButtonBase
        onClick={() => setExpanded(!expanded)}
        sx={{ width: "100%", p: 1.5, display: "flex", gap: 1.5, textAlign: "left", justifyContent: "flex-start" }}
      >
        <Chip
          size="small"
          color="error"
          variant="outlined"
          label={`-${sale.quantity}`}
          sx={{ height: 24, "& .MuiChip-label": { px: 1, fontSize: 12, fontWeight: 600 } }}
        />
        <Box flex={1} minWidth={0}>
          <Typography variant="body2" fontWeight={500} noWrap>{sale.productName}</Typography>
          <Typography variant="caption" color="text.secondary">{formatDate(sale.date)}</Typography>
        </Box>
        <Box color="text.secondary" display="flex" sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}><ChevronDown size={16} /></Box>
      </ButtonBase>

      {expanded && (
        <Box px={1.5} pb={1.5} borderTop={1} borderColor="divider">
          <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1} pt={1}>
            <Detail label="Brand / Code" value={`${sale.brand} - ${sale.productCode}`} />
            <Detail label="Warehouse" value={`${sale.warehouseName} (${sale.warehouseCode})`} />
          </Box>
          {sale.notes && (
            <Typography variant="caption" color="text.secondary" pt={1} display="block">{sale.notes}</Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}

function Detail({ label, value }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="caption" fontWeight={600} display="block">{value}</Typography></Box>;
}
