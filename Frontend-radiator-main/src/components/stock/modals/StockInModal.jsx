import React, { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PackagePlus } from "lucide-react";
import radiatorService from "../../../api/radiatorService";
import ProductTypeSelect from "../../inventory/forms/ProductTypeSelect";

const INITIAL_FORM = {
  radiatorId: "",
  warehouseCode: "",
  quantity: 1,
  reason: "",
};

const INITIAL_NEW_PRODUCT = {
  code: "",
  brand: "",
  model: "",
  type: "",
};

export default function StockInModal({
  open,
  onClose,
  onSubmit,
  radiators = [],
  warehouses = [],
  selectedWarehouse = "all",
  submitting = false,
  onProductCreated,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newProduct, setNewProduct] = useState(INITIAL_NEW_PRODUCT);
  const [creating, setCreating] = useState(false);

  const selectedRadiator = useMemo(
    () => (radiators || []).find((item) => item.id === form.radiatorId),
    [radiators, form.radiatorId]
  );

  const currentStock = selectedRadiator?.stock?.[form.warehouseCode] || 0;

  const handleClose = () => {
    if (submitting || creating) return;
    setForm(INITIAL_FORM);
    setNewProduct(INITIAL_NEW_PRODUCT);
    setAddingNew(false);
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

  const handleNewProductChange = (field) => (event) => {
    const value = event.target.value;
    setNewProduct((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleCreateProduct = async () => {
    if (!newProduct.code.trim() || !newProduct.model.trim() || !newProduct.type.trim()) {
      setError("Product code, model, and type are required.");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const result = await radiatorService.create({
        code: newProduct.code.trim(),
        brand: newProduct.brand.trim() || undefined,
        model: newProduct.model.trim(),
        type: newProduct.type.trim(),
        retailPrice: 0,
        tradePrice: null,
        costPrice: null,
        isPriceOverridable: false,
        maxDiscountPercent: null,
      });

      if (!result?.success) {
        setError(result?.error || "Failed to create product.");
        return;
      }

      // Select the newly created product
      setForm((current) => ({ ...current, radiatorId: result.data.id }));
      setAddingNew(false);
      setNewProduct(INITIAL_NEW_PRODUCT);

      // Refresh the radiator list so the new product appears
      await onProductCreated?.();
    } catch (e) {
      setError(e?.message || "Failed to create product.");
    } finally {
      setCreating(false);
    }
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
      <DialogTitle>Receive from Supplier</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {/* Product selector or new product form */}
          {!addingNew ? (
            <>
              <Autocomplete
                options={radiators || []}
                getOptionLabel={(option) => `${option.brand} ${option.model} (${option.code})`}
                filterOptions={(options, { inputValue }) => {
                  const term = inputValue.toLowerCase();
                  return options.filter(
                    (o) =>
                      o.model.toLowerCase().includes(term) ||
                      o.code.toLowerCase().includes(term) ||
                      (o.brand || "").toLowerCase().includes(term)
                  );
                }}
                value={selectedRadiator || null}
                onChange={(_, newValue) => {
                  const next = { ...form, radiatorId: newValue?.id || "" };
                  if (newValue && selectedWarehouse !== "all") {
                    next.warehouseCode = selectedWarehouse;
                  }
                  setForm(next);
                  setError("");
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Search product" placeholder="Type brand, model, or code..." />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />

              <Button
                size="small"
                startIcon={<PackagePlus size={16} />}
                onClick={() => setAddingNew(true)}
                sx={{ alignSelf: "flex-start", textTransform: "none" }}
              >
                Product not listed? Add new product
              </Button>
            </>
          ) : (
            <Box sx={{ border: 1, borderColor: "green", borderRadius: 1, p: 2, bgcolor: "grey.50" }}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                New Product
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    size="small"
                    label="Code *"
                    value={newProduct.code}
                    onChange={handleNewProductChange("code")}
                    fullWidth
                    placeholder="e.g. RAD-1234"
                  />
                  <TextField
                    size="small"
                    label="Brand"
                    value={newProduct.brand}
                    onChange={handleNewProductChange("brand")}
                    fullWidth
                    placeholder="e.g. Denso"
                  />
                </Stack>
                <TextField
                  size="small"
                  label="Model *"
                  value={newProduct.model}
                  onChange={handleNewProductChange("model")}
                  fullWidth
                  placeholder="e.g. Workmate Radiator"
                />
                <ProductTypeSelect
                  value={newProduct.type}
                  onChange={(value) =>
                    setNewProduct((current) => ({ ...current, type: value }))
                  }
                  disabled={creating}
                />
                <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                  <Button
                    size="small"
                    onClick={() => {
                      setAddingNew(false);
                      setNewProduct(INITIAL_NEW_PRODUCT);
                      setError("");
                    }}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={handleCreateProduct}
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create Product"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

          <Divider />

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
            placeholder="Optional supplier name, shipment, or container reference"
          />

          {selectedRadiator && form.warehouseCode ? (
            <Box sx={{ bgcolor: "grey.50", borderRadius: 1, px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                Current stock
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`${selectedRadiator.brand || ""} ${selectedRadiator.model || ""}`.trim() || selectedRadiator.code} currently has {currentStock} units in {form.warehouseCode}.
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting || creating}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || creating || addingNew}
        >
          {submitting ? "Saving..." : "Save Stock In"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
