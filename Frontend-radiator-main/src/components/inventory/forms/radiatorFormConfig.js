export const EMPTY_RADIATOR_FORM = {
  brand: "",
  code: "",
  model: "",
  type: "",
  coreDimension: "",
  dimension: "",
  imageUrl: "",
  notes: "",
};

export const mapRadiatorToFormValues = (radiator) => ({
  brand: radiator?.brand ?? "",
  code: radiator?.code ?? "",
  model: radiator?.model ?? "",
  type: radiator?.type ?? "",
  coreDimension: radiator?.coreDimension ?? "",
  dimension: radiator?.dimension ?? "",
  imageUrl: radiator?.imageUrl ?? "",
  notes: radiator?.notes ?? "",
});

export const validateRadiatorForm = (form) => {
  if (!form.brand?.trim()) return "Brand is required.";
  if (!form.code?.trim()) return "Code is required.";
  if (!form.model?.trim()) return "Model is required.";
  if (!form.type?.trim()) return "Type is required.";

  return "";
};

export const buildRadiatorPayload = (form) => ({
  brand: form.brand.trim(),
  code: form.code.trim(),
  model: form.model.trim(),
  type: form.type.trim(),
  coreDimension: form.coreDimension.trim() || null,
  dimension: form.dimension.trim() || null,
  imageUrl: form.imageUrl?.trim() || null,
  notes: form.notes.trim() || null,
});
