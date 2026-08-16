// @ts-nocheck
import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Minus, Plus } from "lucide-react";
import {
  Chip,
  Box,
  Card,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LOW_STOCK_THRESHOLD } from "../../../utils/stock";
import { Modal } from "../../common/ui/Modal";

export default function StockTable({
  warehouses,
  items,
  selectedWarehouse,
  editMode,
  getTotalStock,
  getStockStatus: _getStockStatus,
  getDisplayStock,
  onChangeStock,
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const [detailItem, setDetailItem] = useState(null);

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Box display="grid" gridTemplateColumns={{ xs: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }} gap={{ xs: 1.5, md: 2 }}>
        {safeItems.map((r) => {
          const total = getTotalStock(r.stock);
          const out = total === 0;
          const low = total > 0 && total <= LOW_STOCK_THRESHOLD;
          const displayName = `${r.brand || ""} ${r.model || ""}`.trim() || r.code;

          return (
            <Card
              key={r.id}
              variant="outlined"
              sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2, borderRadius: 2 }}
            >
              <Box minHeight={96}>
                <Typography minHeight={44} variant="body2" fontWeight={600} sx={{ fontSize: { md: 16 }, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {displayName}
                </Typography>
                <Box mt={0.5} minHeight={18}>
                  <Typography variant="caption" color="text.secondary">{r.code || "-"}</Typography>
                </Box>
                <Box mt={1} minHeight={28}>
                  {out ? (
                    <Status text="Out" color="error" icon={AlertTriangle} />
                  ) : low ? (
                    <Status text="Low" color="warning" icon={AlertTriangle} />
                  ) : (
                    <Status text="Good" color="success" icon={CheckCircle} />
                  )}
                </Box>
              </Box>

              <Box mt={2} minHeight={68}>
                {selectedWarehouse === "all" ? (
                  <Box minHeight={28}>
                    <Chip
                      size="small"
                      label={`Total: ${total}`}
                      onClick={() => setDetailItem(r)}
                      clickable
                      color={total === 0 ? "error" : total <= LOW_STOCK_THRESHOLD ? "warning" : "success"}
                      variant="filled"
                      sx={{
                        height: 28,
                        borderRadius: "999px",
                        cursor: "pointer",
                        "& .MuiChip-label": { fontSize: 11, px: 1.25 },
                      }}
                    />
                  </Box>
                ) : editMode ? (
                  <Box borderRadius={2} bgcolor="grey.50" px={1.5} py={1.25}>
                    <Box mb={1} display="flex" alignItems="center" justifyContent="space-between">
                      <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: ".08em" }}>
                        Edit Quantity
                      </Typography>
                    </Box>
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
                  </Box>
                ) : (
                  <Box minHeight={28}>
                    <Chip
                      size="small"
                      label={`Total: ${total}`}
                      onClick={() => setDetailItem(r)}
                      clickable
                      color={total === 0 ? "error" : total <= LOW_STOCK_THRESHOLD ? "warning" : "success"}
                      variant="filled"
                      sx={{
                        height: 28,
                        borderRadius: "999px",
                        cursor: "pointer",
                        "& .MuiChip-label": { fontSize: 11, px: 1.25 },
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Card>
          );
        })}
        </Box>

        {safeItems.length === 0 && (
          <Box textAlign="center" py={6}>
            <Typography color="text.secondary">No radiators found matching your criteria</Typography>
          </Box>
        )}
      </Paper>

      <StockWarehouseModal
        item={detailItem}
        warehouses={warehouses}
        onClose={() => setDetailItem(null)}
      />
    </>
  );
}

function QuantityEditor({ value, onDecrement, onIncrement, onChange }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
      <IconButton
        size="small"
        onClick={onDecrement}
        sx={{
          bgcolor: "error.50",
          color: "error.main",
          "&:hover": { bgcolor: "error.100" },
        }}
      >
        <Minus size={16} />
      </IconButton>
      <TextField
        type="number"
        size="small"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
        slotProps={{ htmlInput: { min: 0, style: { textAlign: "center", width: 64 } } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            borderRadius: "12px",
          },
        }}
      />
      <IconButton
        size="small"
        onClick={onIncrement}
        sx={{
          bgcolor: "success.50",
          color: "success.main",
          "&:hover": { bgcolor: "success.100" },
        }}
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

function Status({ text, color, icon: Icon }) {
  return (
    <Chip size="small" color={color} variant="outlined" icon={Icon ? <Icon size={14} /> : undefined} label={text} sx={{ height: 26, "& .MuiChip-label": { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" } }} />
  );
}

function StockWarehouseModal({ item, warehouses, onClose }) {
  if (!item) return null;

  const displayName = `${item.brand || ""} ${item.model || ""}`.trim() || item.code;

  return (
    <Modal isOpen={!!item} onClose={onClose} title={displayName} size="md">
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">Warehouse stock breakdown</Typography>

        <Stack spacing={1}>
          {(warehouses || []).map((warehouse) => {
            const quantity = item.stock?.[warehouse.code] || 0;
            return (
              <Stack
                key={warehouse.id}
                direction="row" alignItems="center" justifyContent="space-between" border={1} borderColor="divider" bgcolor="grey.50" borderRadius={1} px={1.5} py={1.5}
              >
                <Box minWidth={0}>
                  <Typography variant="body2" fontWeight={600}>{warehouse.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{warehouse.code}</Typography>
                </Box>
                <Chip
                  size="small"
                  label={quantity}
                  color={
                    quantity === 0
                      ? "error"
                      : quantity <= LOW_STOCK_THRESHOLD
                        ? "warning"
                        : "success"
                  }
                  variant="filled"
                />
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Modal>
  );
}
