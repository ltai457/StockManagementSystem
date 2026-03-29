import React, { useCallback, useEffect, useMemo, useState } from "react";
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
            label="Warehouse"
            value={warehouseFilter}
            onChange={(event) => setWarehouseFilter(event.target.value)}
            sx={{ minWidth: 180 }}
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
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="180">Last 6 months</MenuItem>
          </TextField>
        </div>

        <Button variant="contained" color="error" onClick={() => setSaleOpen(true)}>
          New Sale
        </Button>
      </div>

      {filteredSales.length === 0 ? (
        <Alert severity="info">No sales found for the selected filters.</Alert>
      ) : (
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
