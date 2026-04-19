import React from "react";
import { Grid, TextField } from "@mui/material";
import BrandSelect from "./BrandSelect";
import ProductTypeSelect from "./ProductTypeSelect";

const RadiatorFormFields = ({ form, onFieldChange, disabled = false }) => (
  <>
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <BrandSelect
          value={form.brand}
          onChange={(value) => onFieldChange("brand", value)}
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
          disabled={disabled}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Model"
          required
          fullWidth
          size="small"
          value={form.model}
          onChange={(e) => onFieldChange("model", e.target.value)}
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ProductTypeSelect
          value={form.type}
          onChange={(value) => onFieldChange("type", value)}
          disabled={disabled}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          label="Core Dimension"
          fullWidth
          size="small"
          value={form.coreDimension}
          onChange={(e) => onFieldChange("coreDimension", e.target.value)}
          disabled={disabled}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label="Dimension"
          fullWidth
          size="small"
          value={form.dimension}
          onChange={(e) => onFieldChange("dimension", e.target.value)}
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
          disabled={disabled}
        />
      </Grid>
    </Grid>
  </>
);

export default RadiatorFormFields;
