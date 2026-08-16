// @ts-nocheck
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  Grid,
  Divider,
} from "@mui/material";
import RadiatorFormFields from "../forms/RadiatorFormFields";
import radiatorService from "../../../api/radiatorService";
import {
  EMPTY_RADIATOR_FORM,
  buildRadiatorPayload,
  validateRadiatorForm,
} from "../forms/radiatorFormConfig";

const AddRadiatorModal = ({ isOpen, onClose, onSuccess, warehouses = [] }) => {
  const [form, setForm] = useState(EMPTY_RADIATOR_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialStock, setInitialStock] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateStock = (warehouseCode, quantity) => {
    setInitialStock((prev) => ({
      ...prev,
      [warehouseCode]: Math.max(0, parseInt(quantity) || 0),
    }));
  };
  const handleSave = async () => {
    const validationError = validateRadiatorForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError("");
    try {
      let imageUrl = null;
      if (imageFile) {
        const uploadResult = await radiatorService.uploadImage(imageFile);
        if (!uploadResult?.success) {
          throw new Error(uploadResult?.error || "Failed to upload image");
        }
        imageUrl = uploadResult.data.imageUrl;
      }

      const payload = {
        ...buildRadiatorPayload({ ...form, imageUrl }),
        retailPrice: 0,
        tradePrice: null,
        costPrice: null,
        isPriceOverridable: false,
        maxDiscountPercent: null,
        initialStock,
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
    setForm(EMPTY_RADIATOR_FORM);
    setInitialStock({});
    setImageFile(null);
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

          <RadiatorFormFields
            form={form}
            onFieldChange={updateField}
            disabled={saving}
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Product Image
            </Typography>
            <TextField
              type="file"
              fullWidth
              size="small"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              slotProps={{ htmlInput: { accept: "image/*" } }}
              disabled={saving}
              helperText="Upload an image and the backend will save its link automatically."
            />
            {imageFile && (
              <Typography variant="caption" color="text.secondary">
                Selected: {imageFile.name}
              </Typography>
            )}
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
          {saving ? "Creating..." : "Create Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRadiatorModal;
