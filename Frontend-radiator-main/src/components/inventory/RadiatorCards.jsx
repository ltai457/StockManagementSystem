import React from "react";
import { Edit, Package, Trash2 } from "lucide-react";
import { Chip, IconButton, Tooltip } from "@mui/material";
import { LOW_STOCK_THRESHOLD } from "../../utils/stock";
import HighlightedText from "../common/ui/HighlightedText";

const getTotalStock = (stock) =>
  Object.values(stock || {}).reduce((total, qty) => total + (qty || 0), 0);

const getStockChipColor = (totalStock) => {
  if (totalStock === 0) return "error";
  if (totalStock <= LOW_STOCK_THRESHOLD) return "warning";
  return "success";
};

const RadiatorCards = ({ radiators, warehouses, onEdit, onDelete, onEditStock, isAdmin, searchTerm }) => {
  const orderedWarehouses = Array.isArray(warehouses) ? warehouses : [];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {radiators.map((radiator) => {
        const totalStock = getTotalStock(radiator.stock);
        const title = `${radiator.brand || ""} ${radiator.model || ""}`.trim() || radiator.code;

        return (
          <div
            key={radiator.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="aspect-[4/3] overflow-hidden bg-gray-100">
              {radiator.imageUrl ? (
                <img
                  src={radiator.imageUrl}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-sm font-medium text-gray-500">
                  No image
                </div>
              )}
            </div>

            <div className="space-y-4 p-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  <HighlightedText text={title} query={searchTerm} />
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  <HighlightedText
                    text={[radiator.type, radiator.code].filter(Boolean).join(" · ")}
                    query={searchTerm}
                  />
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Chip
                  size="small"
                  label={`${totalStock} units`}
                  color={getStockChipColor(totalStock)}
                  variant="filled"
                />
                {radiator.dimension ? (
                  <Chip size="small" label={radiator.dimension} variant="outlined" />
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {orderedWarehouses.map((warehouse) => {
                  const quantity = radiator.stock?.[warehouse.code] || 0;
                  return (
                    <Chip
                      key={warehouse.id}
                      size="small"
                      label={`${warehouse.code}: ${quantity}`}
                      color={getStockChipColor(quantity)}
                      variant="outlined"
                    />
                  );
                })}
              </div>

              {radiator.notes ? (
                <p className="line-clamp-2 text-sm text-gray-600">
                  <HighlightedText text={radiator.notes} query={searchTerm} />
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-1 border-t border-gray-100 pt-3">
                <Tooltip title="Edit Stock">
                  <IconButton size="small" color="primary" onClick={() => onEditStock?.(radiator)}>
                    <Package size={18} />
                  </IconButton>
                </Tooltip>
                {isAdmin ? (
                  <>
                    <Tooltip title="Edit Product">
                      <IconButton size="small" color="warning" onClick={() => onEdit(radiator)}>
                        <Edit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Product">
                      <IconButton size="small" color="error" onClick={() => onDelete(radiator)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RadiatorCards;
