// @ts-nocheck
import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Minus, Plus } from "lucide-react";
import {
  Chip,
  IconButton,
  Stack,
  TextField,
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
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
        {safeItems.map((r) => {
          const total = getTotalStock(r.stock);
          const out = total === 0;
          const low = total > 0 && total <= LOW_STOCK_THRESHOLD;
          const displayName = `${r.brand || ""} ${r.model || ""}`.trim() || r.code;

          return (
            <div
              key={r.id}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="min-h-[96px]">
                <p className="min-h-[44px] line-clamp-2 text-sm font-semibold text-slate-900 md:text-base">
                  {displayName}
                </p>
                <div className="mt-1 min-h-[18px]">
                  <p className="text-xs text-slate-500">{r.code || "-"}</p>
                </div>
                <div className="mt-2 min-h-[28px]">
                  {out ? (
                    <Status text="Out" className="text-rose-600" icon={AlertTriangle} />
                  ) : low ? (
                    <Status text="Low" className="text-amber-600" icon={AlertTriangle} />
                  ) : (
                    <Status text="Good" className="text-emerald-600" icon={CheckCircle} />
                  )}
                </div>
              </div>

              <div className="mt-4 min-h-[68px]">
                {selectedWarehouse === "all" ? (
                  <div className="min-h-[28px]">
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
                  </div>
                ) : editMode ? (
                  <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                        Edit Quantity
                      </span>
                    </div>
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
                  </div>
                ) : (
                  <div className="min-h-[28px]">
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
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>

        {safeItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No radiators found matching your criteria</p>
          </div>
        )}
      </div>

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

function Status({ text, className, icon: Icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-current/10 bg-current/5 px-2 py-1 ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">{text}</span>
    </span>
  );
}

function StockWarehouseModal({ item, warehouses, onClose }) {
  if (!item) return null;

  const displayName = `${item.brand || ""} ${item.model || ""}`.trim() || item.code;

  return (
    <Modal isOpen={!!item} onClose={onClose} title={displayName} size="md">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Warehouse stock breakdown</p>
        </div>

        <div className="space-y-2">
          {(warehouses || []).map((warehouse) => {
            const quantity = item.stock?.[warehouse.code] || 0;
            return (
              <div
                key={warehouse.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{warehouse.name}</p>
                  <p className="text-xs text-gray-500">{warehouse.code}</p>
                </div>
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
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
