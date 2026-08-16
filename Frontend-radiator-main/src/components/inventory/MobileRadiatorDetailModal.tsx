// @ts-nocheck
import React, { useState } from "react";
import { Edit, Package, Trash2 } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";
import { Modal } from "../common/ui/Modal";
import ImagePreviewModal from "../common/ui/ImagePreviewModal";
import { resolveImageUrl } from "../../utils/image";
import HighlightedText from "../common/ui/HighlightedText";

const getTotalStock = (stock) =>
  Object.values(stock || {}).reduce((total, qty) => total + (qty || 0), 0);

export default function MobileRadiatorDetailModal({
  isOpen,
  radiator,
  isAdmin,
  onClose,
  onEdit,
  onDelete,
  onEditStock,
  searchTerm,
}) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  if (!radiator) return null;

  const totalStock = getTotalStock(radiator.stock);
  const title = `${radiator.brand || ""} ${radiator.model || ""}`.trim() || radiator.code;
  const imageSrc = resolveImageUrl(radiator.imageUrl);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
          <div
            className={`overflow-hidden rounded-lg border border-gray-200 bg-gray-100${imageSrc ? " cursor-pointer" : ""}`}
            onClick={() => imageSrc && setImagePreviewOpen(true)}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={title}
                className="h-52 w-full object-contain md:h-56"
              />
            ) : (
              <div className="flex h-52 items-center justify-center text-sm font-medium text-gray-500 md:h-56">
                No image
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailBlock label="Brand" value={radiator.brand || "-"} searchTerm={searchTerm} />
            <DetailBlock label="Model" value={radiator.model || "-"} searchTerm={searchTerm} />
            <DetailBlock label="Code" value={radiator.code || "-"} searchTerm={searchTerm} />
            <DetailBlock label="Type" value={radiator.type || "-"} searchTerm={searchTerm} />
            <DetailBlock label="Total Stock" value={`${totalStock} units`} searchTerm={searchTerm} />
            <DetailBlock label="Dimension" value={radiator.dimension || "-"} searchTerm={searchTerm} />
            <DetailBlock
              label="Core Dimension"
              value={radiator.coreDimension || "-"}
              searchTerm={searchTerm}
            />
          </div>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-gray-900">Notes</p>
          <div className="min-h-24 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-sm text-gray-600">
              <HighlightedText text={radiator.notes || "-"} query={searchTerm} />
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
          <button
            type="button"
            onClick={() => onEditStock?.(radiator)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 sm:w-auto"
          >
            <Package size={16} />
            Edit Stock
          </button>
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={() => onEdit?.(radiator)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 sm:w-auto"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(radiator)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 sm:w-auto"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>

      <ImagePreviewModal
        isOpen={imagePreviewOpen}
        src={imageSrc}
        alt={title}
        onClose={() => setImagePreviewOpen(false)}
      />
    </Modal>
  );
}

function DetailBlock({ label, value, searchTerm }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">
        <HighlightedText text={value} query={searchTerm} />
      </p>
    </div>
  );
}
