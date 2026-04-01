import React from "react";
import { Chip } from "@mui/material";
import { LOW_STOCK_THRESHOLD } from "../../utils/stock";
import HighlightedText from "../common/ui/HighlightedText";

const getTotalStock = (stock) =>
  Object.values(stock || {}).reduce((total, qty) => total + (qty || 0), 0);

const getStockChipColor = (totalStock) => {
  if (totalStock === 0) return "error";
  if (totalStock <= LOW_STOCK_THRESHOLD) return "warning";
  return "success";
};

const RadiatorCards = ({
  radiators,
  onViewDetails,
  searchTerm,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
      {radiators.map((radiator) => {
        const totalStock = getTotalStock(radiator.stock);
        const title = `${radiator.brand || ""} ${radiator.model || ""}`.trim() || radiator.code;

        return (
          <div
            key={radiator.id}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:rounded-2xl"
          >
            <div className="aspect-square overflow-hidden bg-gray-100 md:aspect-[4/3]">
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

            <div className="flex flex-1 flex-col space-y-3 p-3 md:space-y-4 md:p-4">
              <div className="min-h-[44px] md:min-h-[48px]">
                <h3 className="line-clamp-2 text-sm font-medium leading-5 text-gray-900 md:text-[15px]">
                  <HighlightedText text={title} query={searchTerm} />
                </h3>
              </div>

              <div className="flex min-h-[32px] flex-wrap gap-2">
                <Chip
                  size="small"
                  label={<HighlightedText text={radiator.code || "-"} query={searchTerm} />}
                  variant="outlined"
                  sx={{ "& .MuiChip-label": { px: 1, fontSize: { xs: 11, md: 13 } } }}
                />
                <Chip
                  size="small"
                  label={`${totalStock} units`}
                  color={getStockChipColor(totalStock)}
                  variant="filled"
                  sx={{ "& .MuiChip-label": { px: 1, fontSize: { xs: 11, md: 13 } } }}
                />
              </div>

              <div className="grid min-h-[88px] grid-cols-1 gap-2">
                <SpecPill label="Dimension" value={radiator.dimension || "-"} searchTerm={searchTerm} />
                <SpecPill label="Core" value={radiator.coreDimension || "-"} searchTerm={searchTerm} />
              </div>

              {radiator.notes ? (
                <p className="hidden line-clamp-2 text-sm text-gray-600 md:block">
                  <HighlightedText text={radiator.notes} query={searchTerm} />
                </p>
              ) : null}

              <div className="mt-auto border-t border-gray-100 pt-3">
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => onViewDetails?.(radiator)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function SpecPill({ label, value, searchTerm }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-gray-500">{label}</p>
      <p className="truncate text-xs font-medium text-gray-900">
        <HighlightedText text={value} query={searchTerm} />
      </p>
    </div>
  );
}

export default RadiatorCards;
