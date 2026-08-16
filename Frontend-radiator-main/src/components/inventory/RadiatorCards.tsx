// @ts-nocheck
import React, { useState } from "react";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { LOW_STOCK_THRESHOLD } from "../../utils/stock";
import { resolveImageUrl } from "../../utils/image";
import ImagePreviewModal from "../common/ui/ImagePreviewModal";
import HighlightedText from "../common/ui/HighlightedText";
import { Button } from "../common/ui/Button";

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
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <>
    <Box display="grid" gridTemplateColumns={{ xs: "repeat(2, minmax(0, 1fr))", xl: "repeat(3, minmax(0, 1fr))" }} gap={{ xs: 1.5, md: 2.5 }}>
      {radiators.map((radiator) => {
        const totalStock = getTotalStock(radiator.stock);
        const title = `${radiator.brand || ""} ${radiator.model || ""}`.trim() || radiator.code;
        const imageSrc = resolveImageUrl(radiator.imageUrl);

        return (
          <Card
            key={radiator.id}
            variant="outlined"
            sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", transition: "transform .2s, box-shadow .2s", "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}
          >
            <Box
              sx={{ aspectRatio: { xs: "1", md: "4 / 3" }, overflow: "hidden", bgcolor: "grey.100", cursor: imageSrc ? "pointer" : "default" }}
              onClick={() => imageSrc && setPreviewImage({ src: imageSrc, alt: title })}
            >
              {imageSrc ? (
                <Box component="img"
                  src={imageSrc}
                  alt={title}
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <Box height="100%" display="grid" sx={{ placeItems: "center", background: "linear-gradient(135deg, #f5f5f5, #e0e0e0)" }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  No image
                  </Typography>
                </Box>
              )}
            </Box>

            <CardContent sx={{ display: "flex", flex: 1, flexDirection: "column", gap: { xs: 1.5, md: 2 }, p: { xs: 1.5, md: 2 }, "&:last-child": { pb: { xs: 1.5, md: 2 } } }}>
              <Box minHeight={{ xs: 44, md: 48 }}>
                <Typography variant="body2" fontWeight={600} sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  <HighlightedText text={title} query={searchTerm} />
                </Typography>
              </Box>

              <Stack minHeight={32} direction="row" flexWrap="wrap" gap={1}>
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
              </Stack>

              <Stack minHeight={88} spacing={1}>
                <SpecPill label="Dimension" value={radiator.dimension || "-"} searchTerm={searchTerm} />
                <SpecPill label="Core" value={radiator.coreDimension || "-"} searchTerm={searchTerm} />
              </Stack>

              {radiator.notes ? (
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", md: "-webkit-box" }, WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  <HighlightedText text={radiator.notes} query={searchTerm} />
                </Typography>
              ) : null}

              <Box mt="auto" pt={1.5} borderTop={1} borderColor="divider">
                  <Button variant="outline"
                    onClick={() => onViewDetails?.(radiator)}
                  >
                    View Details
                  </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>

    <ImagePreviewModal
      isOpen={!!previewImage}
      src={previewImage?.src}
      alt={previewImage?.alt}
      onClose={() => setPreviewImage(null)}
    />
    </>
  );
};

function SpecPill({ label, value, searchTerm }) {
  return (
    <Box border={1} borderColor="divider" bgcolor="grey.50" borderRadius={1} px={1} py={0.75}>
      <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: ".08em", lineHeight: 1.4 }}>{label}</Typography>
      <Typography variant="caption" fontWeight={600} display="block" noWrap>
        <HighlightedText text={value} query={searchTerm} />
      </Typography>
    </Box>
  );
}

export default RadiatorCards;
