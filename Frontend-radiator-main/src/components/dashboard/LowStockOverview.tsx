// @ts-nocheck
import { useMemo } from "react";
import { Box, Button, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "../../utils/stock";
import { AppCard } from "../common/ui";

export default function LowStockOverview({ radiators = [], onNavigate }) {
  const lowStockItems = useMemo(() => radiators
    .map((radiator) => ({ ...radiator, calculatedTotal: Object.values(radiator.stock || {}).reduce((sum, quantity) => sum + (quantity || 0), 0) }))
    .filter((radiator) => radiator.calculatedTotal > 0 && radiator.calculatedTotal <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.calculatedTotal - b.calculatedTotal), [radiators]);

  return (
    <AppCard
      title="Low Stock"
      actions={lowStockItems.length ? <Button onClick={() => onNavigate?.("stock")}>View Stock</Button> : undefined}
    >
      {lowStockItems.length === 0 ? (
        <Box py={4} textAlign="center"><Typography color="text.secondary">All stock levels are healthy</Typography></Box>
      ) : (
        <List disablePadding sx={{ maxHeight: 384, overflowY: "auto" }}>
          {lowStockItems.map((radiator) => (
            <ListItem key={radiator.id} sx={{ bgcolor: "warning.light", borderRadius: 2, mb: 1 }}>
              <ListItemIcon sx={{ color: "warning.main", minWidth: 34 }}><AlertTriangle size={18} /></ListItemIcon>
              <ListItemText primary={`${radiator.brand || ""} ${radiator.model || ""}`.trim() || radiator.code} slotProps={{ primary: { noWrap: true } }} />
              <Typography color="warning.dark" fontWeight={700}>{radiator.calculatedTotal}</Typography>
            </ListItem>
          ))}
        </List>
      )}
    </AppCard>
  );
}
