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
  Typography,
} from "@mui/material";
import RadiatorFormFields from "../forms/RadiatorFormFields";
import radiatorService from "../../../api/radiatorService";
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
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (isOpen && radiator) {
      setForm(mapRadiatorToFormValues(radiator));
      setSaving(false);
      setError("");
      setImageFile(null);
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
      let imageUrl = radiator.imageUrl || null;
      if (imageFile) {
        const uploadResult = await radiatorService.uploadImage(imageFile);
        if (!uploadResult?.success) {
          throw new Error(uploadResult?.error || "Failed to upload image");
        }
        imageUrl = uploadResult.data.imageUrl;
      }

      const payload = buildRadiatorPayload({ ...form, imageUrl });
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
      <DialogTitle>Edit Radiator — {radiator.model || radiator.code || ""}</DialogTitle>
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
              helperText="Upload a new image to replace the current one."
            />
            {imageFile ? (
              <Typography variant="caption" color="text.secondary">
                Selected: {imageFile.name}
              </Typography>
            ) : radiator.imageUrl ? (
              <Typography variant="caption" color="text.secondary">
                Current image saved
              </Typography>
            ) : null}
          </Box>

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
