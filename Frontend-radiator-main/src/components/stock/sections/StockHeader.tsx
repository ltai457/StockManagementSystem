// @ts-nocheck
import React from "react";
import LowStockAlert from "../../inventory/LowStockAlert";
import { PageHeader } from "../../common/layout/PageHeader";
import { Box, Stack, Typography } from "@mui/material";

export default function StockHeader({ radiators = [], actions = null }) {
  return (
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
      <Box minWidth={0} flex={1}>
        <Typography variant="h4">Stock Management</Typography>
        <Typography mt={0.5} variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
          View and manage inventory across all warehouse locations
        </Typography>
      </Box>

      <Stack direction="row" flex="none" alignItems="center" spacing={1}>
        {actions}
        <LowStockAlert radiators={radiators} />
      </Stack>
    </Stack>
  );
}
