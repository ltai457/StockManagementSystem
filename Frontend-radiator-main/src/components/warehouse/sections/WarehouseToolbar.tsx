// @ts-nocheck
import React from "react";
import { SearchInput } from "../../common/ui/SearchInput";
import { Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

export default function WarehouseToolbar({
  searchTerm,
  onSearch,
  viewMode,
  onViewChange,
  resultCount,
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems={{ lg: "center" }} justifyContent="space-between">
        <Box flex={1} maxWidth={448} width="100%">
          <SearchInput
            value={searchTerm}
            onChange={onSearch}
            onClear={() => onSearch("")}
            placeholder="Search warehouses by name, code, location..."
          />
        </Box>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}><Typography variant="body2" color="text.secondary">View:</Typography><ToggleButtonGroup exclusive size="small" value={viewMode} onChange={(_, value) => value && onViewChange(value)}><ToggleButton value="table">Table</ToggleButton><ToggleButton value="cards">Cards</ToggleButton></ToggleButtonGroup></Stack>
      </Stack>

      {typeof resultCount === "number" && (
        <Typography mt={1.5} variant="body2" color="text.secondary">
          Found {resultCount} result{resultCount !== 1 ? "s" : ""}
        </Typography>
      )}
    </Paper>
  );
}
