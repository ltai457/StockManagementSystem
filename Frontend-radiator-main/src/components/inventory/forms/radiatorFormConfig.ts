import type { CreateRadiatorPayload, Radiator, RadiatorFormValues } from "../../../types";

export const EMPTY_RADIATOR_FORM: RadiatorFormValues = {
  brand: "",
  code: "",
  model: "",
  type: "",
  coreDimension: "",
  dimension: "",
  imageUrl: "",
  notes: "",
};

export const mapRadiatorToFormValues = (radiator?: Partial<Radiator> | null): RadiatorFormValues => ({
  brand: radiator?.brand ?? "",
  code: radiator?.code ?? "",
  model: radiator?.model ?? "",
  type: radiator?.type ?? "",
  coreDimension: radiator?.coreDimension ?? "",
  dimension: radiator?.dimension ?? "",
  imageUrl: radiator?.imageUrl ?? "",
  notes: radiator?.notes ?? "",
});

export const validateRadiatorForm = (form: RadiatorFormValues): string => {
  if (!form.brand?.trim()) return "Brand is required.";
  if (!form.code?.trim()) return "Code is required.";
  if (!form.model?.trim()) return "Model is required.";

  return "";
};

export const buildRadiatorPayload = (form: RadiatorFormValues): Omit<CreateRadiatorPayload, "initialStock"> => ({
  brand: form.brand.trim(),
  code: form.code.trim(),
  model: form.model.trim(),
  type: form.type.trim() || null,
  coreDimension: form.coreDimension.trim() || null,
  dimension: form.dimension.trim() || null,
  imageUrl: form.imageUrl?.trim() || null,
  notes: form.notes.trim() || null,
});
