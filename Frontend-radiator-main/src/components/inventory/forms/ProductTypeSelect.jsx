import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import productTypeService from "../../../api/productTypeService";

export default function ProductTypeSelect({
  value,
  onChange,
  disabled = false,
  label = "Type",
}) {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const loadTypes = async () => {
    setLoading(true);
    try {
      const result = await productTypeService.getAll();
      setTypes(result?.success ? result.data || [] : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const handleCreate = async () => {
    if (!newTypeName.trim()) {
      setError("Type name is required.");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const result = await productTypeService.create(newTypeName);
      if (!result?.success) {
        setError(result?.error || "Failed to create type.");
        return;
      }

      const created = result.data;
      await loadTypes();
      onChange(created.name);
      setNewTypeName("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Stack spacing={1}>
        <TextField
          select
          label={label}
          required
          fullWidth
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
        >
          {types.map((type) => (
            <MenuItem key={type.id} value={type.name}>
              {type.name}
            </MenuItem>
          ))}
        </TextField>

        <Button
          size="small"
          onClick={() => setOpen(true)}
          disabled={disabled}
          sx={{ alignSelf: "flex-start", textTransform: "none" }}
        >
          Add new type
        </Button>
      </Stack>

      <Dialog open={open} onClose={() => !creating && setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add Product Type</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Type name"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              fullWidth
              size="small"
              disabled={creating}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? "Saving..." : "Create Type"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
