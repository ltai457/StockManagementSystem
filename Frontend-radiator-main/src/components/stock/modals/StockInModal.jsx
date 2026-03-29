import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const INITIAL_FORM = {
  radiatorId: "",
  warehouseCode: "",
  quantity: 1,
  reason: "",
};

export default function StockInModal({
  open,
  onClose,
  onSubmit,
  radiators = [],
  warehouses = [],
  selectedWarehouse = "all",
  submitting = false,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");

  const selectedRadiator = useMemo(
    () => (radiators || []).find((item) => item.id === form.radiatorId),
    [radiators, form.radiatorId]
  );

  const currentStock = selectedRadiator?.stock?.[form.warehouseCode] || 0;

  const handleClose = () => {
    if (submitting) return;
    setForm(INITIAL_FORM);
    setError("");
    onClose?.();
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "radiatorId" && selectedWarehouse !== "all") {
        next.warehouseCode = selectedWarehouse;
      }
      return next;
    });
    setError("");
  };

  const handleSubmit = async () => {
    const quantity = Number.parseInt(form.quantity, 10) || 0;

    if (!form.radiatorId || !form.warehouseCode) {
      setError("Select product and warehouse.");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    const success = await onSubmit?.({
      radiatorId: form.radiatorId,
      warehouseCode: form.warehouseCode,
      quantity,
      reason: form.reason.trim() || undefined,
    });

    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Stock In</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField select label="Product" value={form.radiatorId} onChange={handleChange("radiatorId")} fullWidth>
            {(radiators || []).map((radiator) => (
              <MenuItem key={radiator.id} value={radiator.id}>
                {radiator.name} ({radiator.code})
              </MenuItem>
            ))}
          </TextField>

          <TextField select label="Warehouse" value={form.warehouseCode} onChange={handleChange("warehouseCode")} fullWidth>
            {(warehouses || []).map((warehouse) => (
              <MenuItem key={warehouse.id} value={warehouse.code}>
                {warehouse.name} ({warehouse.code})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Quantity Received"
            value={form.quantity}
            onChange={handleChange("quantity")}
            fullWidth
            slotProps={{ htmlInput: { min: 1 } }}
          />

          <TextField
            label="Reference"
            value={form.reason}
            onChange={handleChange("reason")}
            fullWidth
            multiline
            minRows={2}
            placeholder="Optional shipment, supplier, or container reference"
          />

          {selectedRadiator && form.warehouseCode ? (
            <Box sx={{ bgcolor: "grey.50", borderRadius: 1, px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                Current stock
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedRadiator.name} currently has {currentStock} units in {form.warehouseCode}.
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? "Saving..." : "Save Stock In"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
