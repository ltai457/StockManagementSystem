// @ts-nocheck
import React from "react";
import { Edit3, Filter, Save, X } from "lucide-react";
import { SearchInput } from "../../common/ui/SearchInput";
import { Paper, Stack } from "@mui/material";
import { Button } from "../../common/ui/Button";

export default function StockToolbar({
  searchTerm,
  setSearchTerm,
  filterLowStock,
  setFilterLowStock,
  editMode,
  updating,
  editingCount = 0,
  onEdit,
  onCancel,
  onSave,
  selectedWarehouse,
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5} alignItems={{ lg: "center" }} justifyContent="space-between">
        <Stack direction="row" flex={1} spacing={{ xs: 1, sm: 1.5 }}>
          <Stack flex={1}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm("")}
              placeholder="Search radiators by name, code, or brand..."
            />
          </Stack>

          <Button variant={filterLowStock ? "warning" : "outline"} icon={Filter}
            onClick={() => setFilterLowStock(!filterLowStock)}
          >
            Low Stock Only
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {editMode ? (
            <>
              <Button variant="outline" icon={X}
                onClick={onCancel}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button variant="primary" icon={Save} loading={updating}
                onClick={onSave}
                disabled={updating || editingCount === 0}
              >
                  Save Changes{editingCount ? ` (${editingCount})` : ""}
              </Button>
            </>
          ) : (
            selectedWarehouse !== "all" && (
              <Button onClick={onEdit} icon={Edit3}>Edit Stock</Button>
            )
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
