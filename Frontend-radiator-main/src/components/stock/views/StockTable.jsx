import React from "react";
import { AlertTriangle, CheckCircle, Minus, Plus } from "lucide-react";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { LOW_STOCK_THRESHOLD } from "../../../utils/stock";

export default function StockTable({
  warehouses,
  items,
  selectedWarehouse,
  editMode,
  getTotalStock,
  getStockStatus,
  getDisplayStock,
  onChangeStock,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
        <Table sx={{ minWidth: 840 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Product</TableCell>
              {selectedWarehouse === "all" ? (
                <>
                  <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Total Stock</TableCell>
                  {(warehouses || []).map((w) => (
                    <TableCell key={w.id} sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                      {w.code}
                    </TableCell>
                  ))}
                </>
              ) : (
                <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>
                  {editMode ? "Edit Quantity" : "Current Stock"}
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 600, bgcolor: "grey.50" }}>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {safeItems.map((r) => {
              const total = getTotalStock(r.stock);
              const out = total === 0;
              const low = total > 0 && total <= LOW_STOCK_THRESHOLD;

              return (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {`${r.brand || ""} ${r.model || ""}`.trim() || r.code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[r.type, r.code].filter(Boolean).join(" - ")}
                      </Typography>
                    </Box>
                  </TableCell>

                  {selectedWarehouse === "all" ? (
                    <>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{total}</Typography>
                      </TableCell>
                      {(warehouses || []).map((w) => {
                        const current = r.stock?.[w.code] || 0;
                        return (
                          <TableCell key={w.id}>
                            <Chip
                              size="small"
                              label={current}
                              color={current === 0 ? "error" : current <= LOW_STOCK_THRESHOLD ? "warning" : "success"}
                              variant="outlined"
                            />
                          </TableCell>
                        );
                      })}
                    </>
                  ) : (
                    <TableCell>
                      {editMode ? (
                        <QuantityEditor
                          value={getDisplayStock(r.id, total)}
                          onDecrement={() =>
                            onChangeStock(r.id, Math.max(0, getDisplayStock(r.id, total) - 1))
                          }
                          onIncrement={() =>
                            onChangeStock(r.id, getDisplayStock(r.id, total) + 1)
                          }
                          onChange={(value) => onChangeStock(r.id, value)}
                        />
                      ) : (
                        <Badge quantity={total} getStockStatus={getStockStatus} />
                      )}
                    </TableCell>
                  )}

                  <TableCell>
                    {out ? (
                      <Status text="Out of Stock" className="text-red-600" icon={AlertTriangle} />
                    ) : low ? (
                      <Status text="Low Stock" className="text-yellow-600" icon={AlertTriangle} />
                    ) : (
                      <Status text="Good" className="text-green-600" icon={CheckCircle} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {safeItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No radiators found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

function QuantityEditor({ value, onDecrement, onIncrement, onChange }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton
        size="small"
        onClick={onDecrement}
        sx={{ bgcolor: "error.50", color: "error.main", "&:hover": { bgcolor: "error.100" } }}
      >
        <Minus size={16} />
      </IconButton>
      <TextField
        type="number"
        size="small"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        slotProps={{ htmlInput: { min: 0, style: { textAlign: "center", width: 56 } } }}
      />
      <IconButton
        size="small"
        onClick={onIncrement}
        sx={{ bgcolor: "success.50", color: "success.main", "&:hover": { bgcolor: "success.100" } }}
      >
        <Plus size={16} />
      </IconButton>
    </Stack>
  );
}

function Badge({ quantity, getStockStatus }) {
  const s = getStockStatus(quantity);
  return (
    <Chip
      size="small"
      label={quantity}
      color={s.color?.includes("red") ? "error" : s.color?.includes("yellow") ? "warning" : "success"}
      variant="outlined"
    />
  );
}

function Status({ text, className, icon: Icon }) {
  return (
    <span className={`inline-flex items-center space-x-1 ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-xs font-medium">{text}</span>
    </span>
  );
}
