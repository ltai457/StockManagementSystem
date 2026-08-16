// @ts-nocheck
import React, { useMemo, useState } from "react";
import { AlertTriangle, Bell, X } from "lucide-react";
import { Badge, Box, IconButton, List, ListItem, ListItemText, Popover, Stack, Typography } from "@mui/material";
import { LOW_STOCK_THRESHOLD } from "../../utils/stock";
import { Button } from "../common/ui/Button";

const getLowStockProducts = (radiators = []) =>
  radiators
    .map((radiator) => ({
      ...radiator,
      totalStock: Object.values(radiator.stock || {}).reduce((sum, qty) => sum + (qty || 0), 0),
    }))
    .filter((radiator) => radiator.totalStock > 0 && radiator.totalStock <= LOW_STOCK_THRESHOLD);

const LowStockAlert = ({ radiators = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const lowStockProducts = useMemo(() => getLowStockProducts(radiators), [radiators]);
  const visibleProducts = showAll ? lowStockProducts : lowStockProducts.slice(0, 5);

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Low stock notifications"
        sx={{ border: 1, borderColor: "warning.light", bgcolor: "warning.50", color: "warning.dark", "&:hover": { bgcolor: "warning.light" } }}
      >
        <Badge badgeContent={lowStockProducts.length} color="warning"><Bell size={20} /></Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => { setAnchorEl(null); setShowAll(false); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, width: { xs: "calc(100vw - 32px)", sm: 340 }, maxWidth: 340 } } }}
      >
            <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} py={1.5} borderBottom={1} borderColor="divider">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box color="warning.dark" display="flex"><AlertTriangle size={18} /></Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>Low stock alerts</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} below {LOW_STOCK_THRESHOLD}
                  </Typography>
                </Box>
              </Stack>

              <IconButton size="small" onClick={() => { setAnchorEl(null); setShowAll(false); }} aria-label="Close alerts"><X size={18} /></IconButton>
            </Stack>

            <Box maxHeight={320} overflow="auto" px={1} py={1}>
              <List disablePadding>
                {visibleProducts.map((product) => (
                  <ListItem
                    key={product.id}
                    sx={{ mb: 1, borderRadius: 1, border: 1, borderColor: "warning.light", bgcolor: "warning.50" }}
                  >
                    <ListItemText
                      primary={product.model}
                      secondary={<>{product.brand} · {product.code}{product.type ? ` · ${product.type}` : ""}<Typography component="span" display="block" variant="body2" color="warning.dark" fontWeight={600}>{product.totalStock} units left</Typography></>}
                    />
                  </ListItem>
                ))}
              </List>

              {lowStockProducts.length > 5 && (
                <Button variant="ghost" size="sm" onClick={() => setShowAll((prev) => !prev)}>
                    {showAll
                      ? "Show less"
                      : `View more (${lowStockProducts.length - 5} more)`}
                </Button>
              )}
            </Box>
      </Popover>
    </>
  );
};

export default LowStockAlert;
