import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
} from "@mui/material";
import RadiatorFormFields from "../forms/RadiatorFormFields";
import {
  EMPTY_RADIATOR_FORM,
  buildRadiatorPayload,
  mapRadiatorToFormValues,
  validateRadiatorForm,
} from "../forms/radiatorFormConfig";

const EditRadiatorModal = ({ isOpen, onClose, onSuccess, radiator }) => {
  const [form, setForm] = useState(EMPTY_RADIATOR_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && radiator) {
      setForm(mapRadiatorToFormValues(radiator));
      setSaving(false);
      setError("");
    }
  }, [isOpen, radiator]);

  if (!radiator) return null;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      const payload = buildRadiatorPayload(form);
      const success = await onSuccess(payload);
      if (!success) throw new Error("Failed to update radiator");
    } catch (e) {
      console.error("Error updating radiator:", e);
      setError(e.message || "Failed to update radiator");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle>Edit Radiator — {radiator.name || ""}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <RadiatorFormFields
            form={form}
            onFieldChange={updateField}
            disabled={saving}
          />

        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditRadiatorModal;
