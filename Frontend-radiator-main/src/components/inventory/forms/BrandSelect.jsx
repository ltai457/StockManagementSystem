import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Check, Pencil, Trash2, X } from "lucide-react";
import brandService from "../../../api/brandService";

export default function BrandSelect({
  value,
  onChange,
  disabled = false,
  label = "Brand",
}) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const loadBrands = async () => {
    setLoading(true);
    try {
      const result = await brandService.getAll();
      setBrands(result?.success ? result.data || [] : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const resetDialogState = () => {
    setNewBrandName("");
    setEditingId(null);
    setEditingName("");
    setError("");
  };

  const handleOpenManage = () => {
    resetDialogState();
    setOpen(true);
  };

  const handleCloseManage = () => {
    if (busy) return;
    setOpen(false);
    resetDialogState();
  };

  const handleCreate = async () => {
    if (!newBrandName.trim()) {
      setError("Brand name is required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await brandService.create(newBrandName);
      if (!result?.success) {
        setError(result?.error || "Failed to create brand.");
        return;
      }
      const created = result.data;
      await loadBrands();
      onChange(created.name);
      setNewBrandName("");
    } finally {
      setBusy(false);
    }
  };

  const beginEdit = (brand) => {
    setEditingId(brand.id);
    setEditingName(brand.name);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      setError("Brand name is required.");
      return;
    }
    const target = brands.find((b) => b.id === editingId);
    if (!target) {
      cancelEdit();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await brandService.update(editingId, editingName);
      if (!result?.success) {
        setError(result?.error || "Failed to update brand.");
        return;
      }
      // If the radiator currently uses the renamed brand, follow the rename.
      if (value === target.name) {
        onChange(result.data.name);
      }
      await loadBrands();
      cancelEdit();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (brand) => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Delete brand "${brand.name}"? Existing radiators using this brand will keep the label, but it will no longer appear in the dropdown.`
    );
    if (!confirmed) return;
    setBusy(true);
    setError("");
    try {
      const result = await brandService.remove(brand.id);
      if (!result?.success) {
        setError(result?.error || "Failed to delete brand.");
        return;
      }
      // If the radiator currently uses the deleted brand, clear the selection.
      if (value === brand.name) {
        onChange("");
      }
      await loadBrands();
    } finally {
      setBusy(false);
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
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {brands.map((brand) => (
            <MenuItem key={brand.id} value={brand.name}>
              {brand.name}
            </MenuItem>
          ))}
        </TextField>

        <Button
          size="small"
          onClick={handleOpenManage}
          disabled={disabled}
          sx={{ alignSelf: "flex-start", textTransform: "none" }}
        >
          Manage brands
        </Button>
      </Stack>

      <Dialog open={open} onClose={handleCloseManage} fullWidth maxWidth="xs">
        <DialogTitle>Manage Brands</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Typography variant="subtitle2">Add new</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                disabled={busy}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleCreate}
                disabled={busy}
              >
                Add
              </Button>
            </Stack>

            <Typography variant="subtitle2" sx={{ pt: 1 }}>
              Existing
            </Typography>
            {brands.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No brands yet.
              </Typography>
            ) : (
              <List dense disablePadding>
                {brands.map((brand) => {
                  const isEditing = editingId === brand.id;
                  return (
                    <ListItem
                      key={brand.id}
                      disableGutters
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        py: 0.5,
                      }}
                    >
                      {isEditing ? (
                        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                          <TextField
                            size="small"
                            fullWidth
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            disabled={busy}
                            autoFocus
                          />
                          <Tooltip title="Save">
                            <span>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={handleSaveEdit}
                                disabled={busy}
                              >
                                <Check size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <span>
                              <IconButton
                                size="small"
                                onClick={cancelEdit}
                                disabled={busy}
                              >
                                <X size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ width: "100%" }}
                        >
                          <Typography sx={{ flexGrow: 1 }}>{brand.name}</Typography>
                          <Tooltip title="Rename">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => beginEdit(brand)}
                                disabled={busy}
                              >
                                <Pencil size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(brand)}
                                disabled={busy}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseManage} disabled={busy}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
