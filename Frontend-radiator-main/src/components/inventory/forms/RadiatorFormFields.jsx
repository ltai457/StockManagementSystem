import React from "react";
import { Grid, TextField } from "@mui/material";

const getMaxYear = () => new Date().getFullYear() + 5;

const RadiatorFormFields = ({ form, onFieldChange, disabled = false }) => (
  <>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Brand"
          required
          fullWidth
          size="small"
          value={form.brand}
          onChange={(e) => onFieldChange("brand", e.target.value)}
          placeholder="e.g., Denso"
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Code"
          required
          fullWidth
          size="small"
          value={form.code}
          onChange={(e) => onFieldChange("code", e.target.value)}
          placeholder="Unique product code"
          disabled={disabled}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Name"
          required
          fullWidth
          size="small"
          value={form.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          placeholder="e.g., Toyota Corolla Radiator"
          disabled={disabled}
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
          onChange={(e) => onFieldChange("year", e.target.value)}
          placeholder="e.g., 2018"
          slotProps={{ htmlInput: { min: 1900, max: getMaxYear() } }}
          disabled={disabled}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Dimensions"
          fullWidth
          size="small"
          value={form.dimensions}
          onChange={(e) => onFieldChange("dimensions", e.target.value)}
          placeholder="e.g., 250x240x40mm"
          disabled={disabled}
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
          onChange={(e) => onFieldChange("notes", e.target.value)}
          placeholder="Additional product information..."
          disabled={disabled}
        />
      </Grid>
    </Grid>
  </>
);

export default RadiatorFormFields;
