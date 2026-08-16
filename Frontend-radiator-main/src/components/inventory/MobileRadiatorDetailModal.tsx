// @ts-nocheck
import React, { useState } from "react";
import { Edit, Package, Trash2 } from "lucide-react";
import { Box, Stack, Typography } from "@mui/material";
import { Modal } from "../common/ui/Modal";
import ImagePreviewModal from "../common/ui/ImagePreviewModal";
import { resolveImageUrl } from "../../utils/image";
import HighlightedText from "../common/ui/HighlightedText";
import { Button } from "../common/ui/Button";

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
      <Stack spacing={2}>
        <Box display="grid" gridTemplateColumns={{ md: "220px minmax(0, 1fr)" }} gap={2} alignItems="start">
          <Box
            sx={{ overflow: "hidden", borderRadius: 1, border: 1, borderColor: "divider", bgcolor: "grey.100", cursor: imageSrc ? "pointer" : "default" }}
            onClick={() => imageSrc && setImagePreviewOpen(true)}
          >
            {imageSrc ? (
              <Box component="img"
                src={imageSrc}
                alt={title}
                sx={{ height: { xs: 208, md: 224 }, width: "100%", objectFit: "contain" }}
              />
            ) : (
              <Box height={{ xs: 208, md: 224 }} display="grid" sx={{ placeItems: "center" }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                No image
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={1.5}>
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
          </Box>
        </Box>

        <Box>
          <Typography mb={0.5} variant="body2" fontWeight={600}>Notes</Typography>
          <Box minHeight={96} border={1} borderColor="divider" bgcolor="grey.50" borderRadius={1} px={1.5} py={1}>
            <Typography variant="body2" color="text.secondary">
              <HighlightedText text={radiator.notes || "-"} query={searchTerm} />
            </Typography>
          </Box>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" spacing={1} pt={1.5} borderTop={1} borderColor="divider">
          <Button variant="secondary" icon={Package}
            onClick={() => onEditStock?.(radiator)}
          >
            Edit Stock
          </Button>
          {isAdmin ? (
            <>
              <Button variant="warning" icon={Edit}
                onClick={() => onEdit?.(radiator)}
              >
                Edit
              </Button>
              <Button variant="danger" icon={Trash2}
                onClick={() => onDelete?.(radiator)}
              >
                Delete
              </Button>
            </>
          ) : null}
        </Stack>
      </Stack>

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
    <Box border={1} borderColor="divider" bgcolor="grey.50" borderRadius={1} px={1.5} py={1}>
      <Typography variant="overline" color="text.secondary" sx={{ fontSize: 11, letterSpacing: ".08em", lineHeight: 1.4 }}>{label}</Typography>
      <Typography mt={0.5} variant="body2" fontWeight={600}>
        <HighlightedText text={value} query={searchTerm} />
      </Typography>
    </Box>
  );
}
