// @ts-nocheck
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
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

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

  const resetDialogState = () => {
    setNewTypeName("");
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
    if (!newTypeName.trim()) {
      setError("Type name is required.");
      return;
    }
    setBusy(true);
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
    } finally {
      setBusy(false);
    }
  };

  const beginEdit = (type) => {
    setEditingId(type.id);
    setEditingName(type.name);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setError("");
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      setError("Type name is required.");
      return;
    }
    const target = types.find((t) => t.id === editingId);
    if (!target) {
      cancelEdit();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await productTypeService.update(editingId, editingName);
      if (!result?.success) {
        setError(result?.error || "Failed to update type.");
        return;
      }
      // If the radiator currently uses the renamed type, follow the rename.
      if (value === target.name) {
        onChange(result.data.name);
      }
      await loadTypes();
      cancelEdit();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (type) => {
    const confirmed = window.confirm(
      `Delete type "${type.name}"? Existing radiators using this type will keep the label, but it will no longer appear in the dropdown.`
    );
    if (!confirmed) return;
    setBusy(true);
    setError("");
    try {
      const result = await productTypeService.remove(type.id);
      if (!result?.success) {
        setError(result?.error || "Failed to delete type.");
        return;
      }
      // If the radiator currently uses the deleted type, clear the selection.
      if (value === type.name) {
        onChange("");
      }
      await loadTypes();
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
          fullWidth
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {types.map((type) => (
            <MenuItem key={type.id} value={type.name}>
              {type.name}
            </MenuItem>
          ))}
        </TextField>

        <Button
          size="small"
          onClick={handleOpenManage}
          disabled={disabled}
          sx={{ alignSelf: "flex-start", textTransform: "none" }}
        >
          Manage types
        </Button>
      </Stack>

      <Dialog open={open} onClose={handleCloseManage} fullWidth maxWidth="xs">
        <DialogTitle>Manage Product Types</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Typography variant="subtitle2">Add new</Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                fullWidth
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
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
            {types.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No types yet.
              </Typography>
            ) : (
              <List dense disablePadding>
                {types.map((type) => {
                  const isEditing = editingId === type.id;
                  return (
                    <ListItem
                      key={type.id}
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
                          <Typography sx={{ flexGrow: 1 }}>{type.name}</Typography>
                          <Tooltip title="Rename">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => beginEdit(type)}
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
                                onClick={() => handleDelete(type)}
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
