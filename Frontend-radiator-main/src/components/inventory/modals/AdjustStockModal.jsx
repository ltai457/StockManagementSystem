import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import stockService from "../../../api/stockService";

export default function AdjustStockModal({
  isOpen,
  onClose,
  radiator,
  warehouses = [],
  onSaved,
}) {
  const initialQuantities = useMemo(() => {
    const map = {};
    (warehouses || []).forEach((w) => {
      map[w.code] = radiator?.stock?.[w.code] ?? 0;
    });
    return map;
  }, [radiator, warehouses]);

  const [quantities, setQuantities] = useState(initialQuantities);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuantities(initialQuantities);
    setError("");
  }, [initialQuantities]);

  if (!radiator) return null;

  const title =
    `${radiator.brand || ""} ${radiator.model || ""}`.trim() || radiator.code;

  const changedEntries = Object.entries(quantities).filter(([code, qty]) => {
    const parsed = Number.parseInt(qty, 10);
    if (Number.isNaN(parsed)) return false;
    return parsed !== (initialQuantities[code] ?? 0);
  });

  const hasChanges = changedEntries.length > 0;

  const handleChange = (code) => (event) => {
    setQuantities((prev) => ({ ...prev, [code]: event.target.value }));
    setError("");
  };

  const handleClose = () => {
    if (submitting) return;
    onClose?.();
  };

  const handleSubmit = async () => {
    for (const [code, qty] of changedEntries) {
      const parsed = Number.parseInt(qty, 10);
      if (Number.isNaN(parsed) || parsed < 0) {
        setError(`Quantity for ${code} must be a non-negative number.`);
        return;
      }
    }

    setSubmitting(true);
    setError("");

    const failures = [];
    for (const [code, qty] of changedEntries) {
      const parsed = Number.parseInt(qty, 10);
      const result = await stockService.updateStock(radiator.id, code, parsed);
      if (!result?.success) {
        failures.push(`${code}: ${result?.error || "update failed"}`);
      }
    }

    setSubmitting(false);
    await onSaved?.();

    if (failures.length) {
      setError(`Some warehouses failed: ${failures.join("; ")}`);
      return;
    }

    onClose?.();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Adjust Stock — {title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Set the on-hand quantity for each warehouse. Saving overwrites the
            current count and records an audit entry.
          </Typography>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {(warehouses || []).length === 0 ? (
            <Alert severity="info">No warehouses available.</Alert>
          ) : (
            <Stack spacing={1.5}>
              {warehouses.map((w) => {
                const current = initialQuantities[w.code] ?? 0;
                return (
                  <Box
                    key={w.id || w.code}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {w.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {w.code} • current: {current}
                      </Typography>
                    </Box>
                    <TextField
                      size="small"
                      type="number"
                      value={quantities[w.code] ?? 0}
                      onChange={handleChange(w.code)}
                      slotProps={{ htmlInput: { min: 0 } }}
                      sx={{ width: 110 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !hasChanges}
        >
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
