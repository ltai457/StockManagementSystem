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
  fromWarehouseCode: "",
  toWarehouseCode: "",
  quantity: 1,
  reason: "",
};

export default function TransferStockModal({
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

  const availableSourceStock = selectedRadiator?.stock?.[form.fromWarehouseCode] || 0;

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

      if (field === "radiatorId") {
        const preferredWarehouse =
          selectedWarehouse !== "all"
            ? selectedWarehouse
            : current.fromWarehouseCode;

        next.fromWarehouseCode = preferredWarehouse || "";
      }

      return next;
    });
    setError("");
  };

  const handleSubmit = async () => {
    const quantity = Number.parseInt(form.quantity, 10) || 0;

    if (!form.radiatorId || !form.fromWarehouseCode || !form.toWarehouseCode) {
      setError("Select product and both warehouses.");
      return;
    }

    if (form.fromWarehouseCode === form.toWarehouseCode) {
      setError("Choose two different warehouses.");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than zero.");
      return;
    }

    if (quantity > availableSourceStock) {
      setError(`Only ${availableSourceStock} items available in ${form.fromWarehouseCode}.`);
      return;
    }

    const success = await onSubmit?.({
      radiatorId: form.radiatorId,
      fromWarehouseCode: form.fromWarehouseCode,
      toWarehouseCode: form.toWarehouseCode,
      quantity,
      reason: form.reason.trim() || undefined,
    });

    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Stock Movement</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            select
            label="Product"
            value={form.radiatorId}
            onChange={handleChange("radiatorId")}
            fullWidth
          >
            {(radiators || []).map((radiator) => (
              <MenuItem key={radiator.id} value={radiator.id}>
                {radiator.name} ({radiator.code})
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="From Warehouse"
              value={form.fromWarehouseCode}
              onChange={handleChange("fromWarehouseCode")}
              fullWidth
            >
              {(warehouses || []).map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.code}>
                  {warehouse.name} ({warehouse.code})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="To Warehouse"
              value={form.toWarehouseCode}
              onChange={handleChange("toWarehouseCode")}
              fullWidth
            >
              {(warehouses || []).map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.code}>
                  {warehouse.name} ({warehouse.code})
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            type="number"
            label="Quantity"
            value={form.quantity}
            onChange={handleChange("quantity")}
            fullWidth
            slotProps={{ htmlInput: { min: 1 } }}
          />

          <TextField
            label="Reason"
            value={form.reason}
            onChange={handleChange("reason")}
            fullWidth
            multiline
            minRows={2}
            placeholder="Optional note for this stock movement"
          />

          {selectedRadiator && form.fromWarehouseCode ? (
            <Box sx={{ bgcolor: "grey.50", borderRadius: 1, px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                Available stock
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedRadiator.name} has {availableSourceStock} units in {form.fromWarehouseCode}.
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
          {submitting ? "Saving..." : "Move Stock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
