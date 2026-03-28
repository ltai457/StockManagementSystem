import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
  Box,
  Grid,
  Divider,
} from "@mui/material";

const emptyForm = {
  brand: "",
  code: "",
  name: "",
  year: "",
  retailPrice: "",
  tradePrice: "",
  costPrice: "",
  isPriceOverridable: false,
  maxDiscountPercent: "",
  productType: "",
  dimensions: "",
  notes: "",
};

const productTypes = [
  { value: "Vehicle", label: "Vehicle" },
  { value: "Truck", label: "Truck" },
  { value: "Machinery", label: "Machinery" },
  { value: "Generator", label: "Generator" },
  { value: "Forklift", label: "Forklift" },
  { value: "Harvester", label: "Harvester" },
  { value: "Excavator", label: "Excavator" },
  { value: "Tractor", label: "Tractor" },
  { value: "Other", label: "Other" },
];

const AddRadiatorModal = ({ isOpen, onClose, onSuccess, warehouses = [] }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialStock, setInitialStock] = useState({});

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateStock = (warehouseCode, quantity) => {
    setInitialStock((prev) => ({
      ...prev,
      [warehouseCode]: Math.max(0, parseInt(quantity) || 0),
    }));
  };

  const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

  const validate = () => {
    if (!form.brand?.trim()) return "Brand is required.";
    if (!form.code?.trim()) return "Code is required.";
    if (!form.name?.trim()) return "Name is required.";
    if (form.year === "" || isNaN(Number(form.year))) return "Year must be a valid number.";
    if (Number(form.year) < 1900 || Number(form.year) > new Date().getFullYear() + 5) {
      return "Year must be between 1900 and " + (new Date().getFullYear() + 5);
    }
    const rp = num(form.retailPrice);
    const tp = num(form.tradePrice);
    const md = num(form.maxDiscountPercent);
    if (rp === null || isNaN(rp) || rp < 0) return "Retail price is required and must be >= 0.";
    if (tp !== null && (isNaN(tp) || tp < 0)) return "Trade price must be >= 0.";
    if (md !== null && (isNaN(md) || md < 0 || md > 100)) return "Max discount must be between 0 and 100.";
    return "";
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        brand: form.brand.trim(),
        code: form.code.trim(),
        name: form.name.trim(),
        year: Number(form.year),
        retailPrice: num(form.retailPrice),
        tradePrice: num(form.tradePrice),
        costPrice: num(form.costPrice),
        isPriceOverridable: !!form.isPriceOverridable,
        maxDiscountPercent: num(form.maxDiscountPercent),
        stock: initialStock,
        productType: form.productType.trim() || null,
        dimensions: form.dimensions.trim() || null,
        notes: form.notes.trim() || null,
      };
      const success = await onSuccess(payload);
      if (!success) throw new Error("Failed to create radiator");
      resetForm();
    } catch (e) {
      setError(e.message || "Failed to create radiator");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setInitialStock({});
  };

  const handleClose = () => {
    if (!saving) {
      setError("");
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle>Add New Radiator</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Basic Details */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Brand"
                required
                fullWidth
                size="small"
                value={form.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                placeholder="e.g., Denso"
                disabled={saving}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Code"
                required
                fullWidth
                size="small"
                value={form.code}
                onChange={(e) => updateField("code", e.target.value)}
                placeholder="Unique product code"
                disabled={saving}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Name"
                required
                fullWidth
                size="small"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g., Toyota Corolla Radiator"
                disabled={saving}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Year"
                required
                fullWidth
                size="small"
                type="number"
                value={form.year}
                onChange={(e) => updateField("year", e.target.value)}
                placeholder="e.g., 2018"
                slotProps={{ htmlInput: { min: 1900, max: new Date().getFullYear() + 5 } }}
                disabled={saving}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Product Type"
                select
                fullWidth
                size="small"
                value={form.productType}
                onChange={(e) => updateField("productType", e.target.value)}
                disabled={saving}
              >
                <MenuItem value="">Select Type</MenuItem>
                {productTypes.map((pt) => (
                  <MenuItem key={pt.value} value={pt.value}>{pt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Dimensions"
                fullWidth
                size="small"
                value={form.dimensions}
                onChange={(e) => updateField("dimensions", e.target.value)}
                placeholder="e.g., 250x240x40mm"
                disabled={saving}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Notes"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Additional product information..."
                disabled={saving}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Pricing */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Pricing</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Retail Price ($)"
                  required
                  fullWidth
                  size="small"
                  type="number"
                  value={form.retailPrice}
                  onChange={(e) => updateField("retailPrice", e.target.value)}
                  placeholder="0.00"
                  slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Trade Price ($)"
                  fullWidth
                  size="small"
                  type="number"
                  value={form.tradePrice}
                  onChange={(e) => updateField("tradePrice", e.target.value)}
                  placeholder="0.00"
                  slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Cost Price ($)"
                  fullWidth
                  size="small"
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => updateField("costPrice", e.target.value)}
                  placeholder="0.00"
                  slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                  disabled={saving}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.isPriceOverridable}
                      onChange={(e) => updateField("isPriceOverridable", e.target.checked)}
                      disabled={saving}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">Allow price override</Typography>}
                />
              </Grid>
              {form.isPriceOverridable && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Max Discount (%)"
                    fullWidth
                    size="small"
                    type="number"
                    value={form.maxDiscountPercent}
                    onChange={(e) => updateField("maxDiscountPercent", e.target.value)}
                    placeholder="0"
                    slotProps={{ htmlInput: { min: 0, max: 100, step: 0.1 } }}
                    disabled={saving}
                  />
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Initial Stock */}
          {warehouses.length > 0 && (
            <Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Initial Stock</Typography>
              <Grid container spacing={2}>
                {warehouses.map((warehouse) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={warehouse.id}>
                    <TextField
                      label={`${warehouse.name} (${warehouse.code})`}
                      fullWidth
                      size="small"
                      type="number"
                      value={initialStock[warehouse.code] || ""}
                      onChange={(e) => updateStock(warehouse.code, e.target.value)}
                      placeholder="0"
                      slotProps={{ htmlInput: { min: 0 } }}
                      disabled={saving}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Creating..." : "Create Radiator"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRadiatorModal;
