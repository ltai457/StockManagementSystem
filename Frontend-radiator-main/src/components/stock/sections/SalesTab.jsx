import React, { useCallback, useEffect, useMemo, useState } from "react";
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
    <div className="space-y-4">
      {/* Header with action */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{filteredSales.length} sale{filteredSales.length !== 1 ? "s" : ""}</span>
        <Button variant="contained" color="error" size="small" onClick={() => setSaleOpen(true)}>
          New Sale
        </Button>
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

      {filteredSales.length === 0 ? (
        <Alert severity="info">No sales found for the selected filters.</Alert>
      ) : (
        <>
          {/* Mobile: Collapsible cards */}
          <div className="md:hidden space-y-2">
            {filteredSales.map((sale) => (
              <SaleCard key={sale.id} sale={sale} formatDate={formatDate} />
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block">
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
          </div>
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
    </div>
  );
}

function SaleCard({ sale, formatDate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        <Chip
          size="small"
          color="error"
          variant="outlined"
          label={`-${sale.quantity}`}
          sx={{ height: 24, "& .MuiChip-label": { px: 1, fontSize: 12, fontWeight: 600 } }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{sale.productName}</p>
          <p className="text-xs text-gray-500">{formatDate(sale.date)}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            <div>
              <span className="text-gray-500">Brand / Code</span>
              <p className="font-medium text-gray-900">{sale.brand} - {sale.productCode}</p>
            </div>
            <div>
              <span className="text-gray-500">Warehouse</span>
              <p className="font-medium text-gray-900">{sale.warehouseName}</p>
              <p className="text-gray-500">{sale.warehouseCode}</p>
            </div>
          </div>
          {sale.notes && (
            <p className="text-xs text-gray-500 pt-2">{sale.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
