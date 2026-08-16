// @ts-nocheck
export function normalizeChangeType(changeType) {
  return String(changeType || "").trim().toUpperCase();
}

export function isSaleEvent(movement) {
  return normalizeChangeType(movement?.changeType) === "SALE";
}

export function isStockInEvent(movement) {
  return normalizeChangeType(movement?.changeType) === "STOCK IN";
}

export function isManualAdjustmentEvent(movement) {
  const changeType = normalizeChangeType(movement?.changeType);
  return changeType === "MANUAL ADJUSTMENT" || changeType === "MANUAL UPDATE";
}

export function isStockMovementEvent(movement) {
  const changeType = normalizeChangeType(movement?.changeType);
  return changeType === "STOCK MOVEMENT IN" || changeType === "STOCK MOVEMENT OUT";
}

export function getMovementRoute(movement) {
  const changeType = normalizeChangeType(movement?.changeType);
  const warehouseCode = movement?.warehouseCode || "";
  const note = String(movement?.notes || "");

  const toMatch = note.match(/Stock moved to ([A-Z0-9_]+)/i);
  const fromMatch = note.match(/Stock moved from ([A-Z0-9_]+)/i);

  if (changeType === "STOCK MOVEMENT OUT") {
    return {
      fromWarehouseCode: warehouseCode,
      toWarehouseCode: toMatch?.[1] || "",
    };
  }

  if (changeType === "STOCK MOVEMENT IN") {
    return {
      fromWarehouseCode: fromMatch?.[1] || "",
      toWarehouseCode: warehouseCode,
    };
  }

  if (changeType === "STOCK IN") {
    return {
      fromWarehouseCode: "Overseas / Supplier",
      toWarehouseCode: warehouseCode,
    };
  }

  if (changeType === "MANUAL ADJUSTMENT" || changeType === "MANUAL UPDATE") {
    return {
      fromWarehouseCode: movement?.movementType === "OUTGOING" ? warehouseCode : "",
      toWarehouseCode: movement?.movementType === "INCOMING" ? warehouseCode : "",
    };
  }

  return {
    fromWarehouseCode: "",
    toWarehouseCode: "",
  };
}
