export const EMPTY_RADIATOR_FORM = {
  brand: "",
  code: "",
  name: "",
  year: "",
  dimensions: "",
  notes: "",
};

export const mapRadiatorToFormValues = (radiator) => ({
  brand: radiator?.brand ?? "",
  code: radiator?.code ?? "",
  name: radiator?.name ?? "",
  year: radiator?.year?.toString() ?? "",
  dimensions: radiator?.dimensions ?? "",
  notes: radiator?.notes ?? "",
});

export const validateRadiatorForm = (form) => {
  if (!form.brand?.trim()) return "Brand is required.";
  if (!form.code?.trim()) return "Code is required.";
  if (!form.name?.trim()) return "Name is required.";
  if (form.year === "" || Number.isNaN(Number(form.year))) {
    return "Year must be a valid number.";
  }

  const maxYear = new Date().getFullYear() + 5;
  if (Number(form.year) < 1900 || Number(form.year) > maxYear) {
    return `Year must be between 1900 and ${maxYear}`;
  }

  return "";
};

export const buildRadiatorPayload = (form) => ({
  brand: form.brand.trim(),
  code: form.code.trim(),
  name: form.name.trim(),
  year: Number(form.year),
  dimensions: form.dimensions.trim() || null,
  notes: form.notes.trim() || null,
});
