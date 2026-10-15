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
  <Stack
    direction={{ xs: "column", md: "row" }}
    alignItems={{ xs: "stretch", md: "flex-start" }}
    justifyContent="space-between"
    spacing={2}
  >
      <Box minWidth={0}>
        <Typography variant="h4">Inventory Management</Typography>
        <Typography mt={0.5} variant="body2" color="text.secondary">Manage your product list and stock levels</Typography>
      </Box>

    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems={{ xs: "stretch", sm: "center" }}
      justifyContent={{ md: "flex-end" }}
      flex="none"
    >
      <Box display="flex" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
        <LowStockAlert radiators={radiators} />
      </Box>
      {isAdmin && (
        <Button onClick={onAddProduct} icon={Plus}>
          Add Product
        </Button>
      )}
    </Stack>
  </Stack>
);

export default InventoryHeader;
