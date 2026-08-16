// @ts-nocheck
import React from "react";
import { Plus } from "lucide-react";
import { Box, Stack, Typography } from "@mui/material";
import { Button } from "../common/ui/Button";
import LowStockAlert from "./LowStockAlert";

const InventoryHeader = ({
  isAdmin,
  onAddProduct,
  radiators,
}) => (
  <Stack spacing={2}>
    <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
      <Box minWidth={0}>
        <Typography variant="h4">Inventory Management</Typography>
        <Typography mt={0.5} variant="body2" color="text.secondary">Manage your product list and stock levels</Typography>
      </Box>
      <Box flex="none">
        <LowStockAlert radiators={radiators} />
      </Box>
    </Stack>

    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
      {isAdmin && (
        <Button onClick={onAddProduct} icon={Plus}>
          Add Product
        </Button>
      )}
    </Stack>
  </Stack>
);

export default InventoryHeader;
